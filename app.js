"use strict";
const app = require("express")();
const { Category, Product } = require("./models");

// connect to mongo
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
app.use((req, res, next) => {
  mongoose
    .connect("mongodb://localhost/async_development", {
      useMongoClient: true
    })
    .then(() => next());
});

const display = (res, items) => {
  let lines = [];

  items.forEach(item => {
    lines.push("<hr>");
    lines.push([`${item.name}: $${item.price}`]);
  });

  lines = lines.join("<br>");

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(lines);
};

const mostOpts = () => [{}, {}, { sort: { price: -1 } }];
const leastOpts = most => {
  return [{ category: most.category }, {}, { sort: { price: 1 } }];
};
const sumOpts = (most, least) => {
  return [
    [
      {
        $match: {
          category: most.category,
          _id: { $nin: [most._id, least._id] }
        }
      },
      { $group: { _id: "$category", price: { $sum: "$price" } } },
      { $project: { price: 1, name: "Sum" } }
    ]
  ];
};

app.get("/", (req, res) => {
  res.end("Hello, world!");
});

app.get("/callback", (req, res) => {
  const errCall = e => {
    res.status(500).end(e.stack);
  };
  Product.findOne(...mostOpts(), (err, most) => {
    if (err) return errCall(err);
    Product.findOne(...leastOpts(most), (err, least) => {
      if (err) return errCall(err);
      Product.aggregate(...sumOpts(most, least), (err, sum) => {
        if (err) return errCall(err);
        display(res, [most, least, sum[0]]);
      });
    });
  });
});

app.get("/promise", (req, res) => {
  let most;
  let least;

  Product.findOne(...mostOpts())
    .then(m => {
      most = m;
      return Product.findOne(...leastOpts(most));
    })
    .then(l => {
      least = l;
      return Product.aggregate(...sumOpts(most, least));
    })
    .then(sum => {
      display(res, [most, least, sum[0]]);
    })
    .catch(e => res.status(500).end(e.stack));
});

app.get("/async", async (req, res) => {
  try {
    const most = await Product.findOne(...mostOpts());
    const least = await Product.findOne(...leastOpts(most));
    const sum = await Product.aggregate(...sumOpts(most, least));
    display(res, [most, least, sum[0]]);
  } catch (e) {
    res.status(500).end(e.stack);
  }
});

app.listen(2000, "localhost", () => {
  console.log("Good to go!");
});

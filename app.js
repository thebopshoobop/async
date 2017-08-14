"use strict";
// Express
const app = require("express")();
// Models
const { Product } = require("./models");

// DB Connection
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
app.use((req, res, next) => {
  mongoose
    .connect("mongodb://localhost/async_development", {
      useMongoClient: true
    })
    .then(() => next());
});

// Utility Functions
/////////////////////

const display = (res, items) => {
  let lines = [];

  items.forEach(item => {
    lines.push([`${item.name}: $${item.price}`]);
  });

  lines = lines.join("<br>");

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(lines);
};

const opts = {
  most: () => [{}, {}, { sort: { price: -1 } }],
  least: most => [{ category: most.category }, {}, { sort: { price: 1 } }],
  sum: (most, least) => {
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
  }
};

// Async Strategies
///////////////////

app.get("/callback", (req, res) => {
  const errCall = e => {
    res.status(500).end(e.stack);
  };
  Product.findOne(...opts.most(), (err, most) => {
    if (err) return errCall(err);
    Product.findOne(...opts.least(most), (err, least) => {
      if (err) return errCall(err);
      Product.aggregate(...opts.sum(most, least), (err, sum) => {
        if (err) return errCall(err);
        display(res, [most, least, sum[0]]);
      });
    });
  });
});

app.get("/promise", (req, res) => {
  let most;
  let least;

  Product.findOne(...opts.most())
    .then(m => {
      most = m;
      return Product.findOne(...opts.least(most));
    })
    .then(l => {
      least = l;
      return Product.aggregate(...opts.sum(most, least));
    })
    .then(sum => {
      display(res, [most, least, sum[0]]);
    })
    .catch(e => res.status(500).end(e.stack));
});

app.get("/async", async (req, res) => {
  try {
    const most = await Product.findOne(...opts.most());
    const least = await Product.findOne(...opts.least(most));
    const sum = await Product.aggregate(...opts.sum(most, least));
    display(res, [most, least, sum[0]]);
  } catch (e) {
    res.status(500).end(e.stack);
  }
});

// Load Server
app.listen(2000, "localhost", () => {
  console.log("Good to go!");
});

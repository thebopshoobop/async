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

const display = (res, categories, products, maxProduct) => {
  let lines = [];

  [categories, products, [maxProduct]].forEach(elementType => {
    lines.push("<hr>");
    elementType.forEach(element => {
      if (element.price) {
        lines.push([`${element.name}: $${element.price}`]);
      } else {
        lines.push(element.name);
      }
    });
  });

  lines = lines.join(" <br> ");

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(lines);
};

app.get("/", (req, res) => {
  res.end("Hello, world!");
});

app.get("/callback", (req, res) => {
  Category.find((err, categories) => {
    Product.find(
      {},
      { _id: 0 },
      { sort: { name: 1 }, limit: 10 },
      (err, products) => {
        Product.findOne({}, {}, { sort: { price: -1 } }, (err, maxProduct) => {
          display(res, categories, products, maxProduct);
        });
      }
    );
  });
});

app.get("/promise", (req, res) => {
  let categories;
  let products;

  Category.find()
    .then(cats => {
      categories = cats;
      return Product.find({}, { _id: 0 }, { sort: { name: 1 }, limit: 10 });
    })
    .then(prods => {
      products = prods;
      return Product.findOne({}, {}, { sort: { price: -1 } });
    })
    .then(maxProduct => {
      display(res, categories, products, maxProduct);
    })
    .catch(e => res.status(500).end(e.stack));
});

app.listen(2000, "localhost", () => {
  console.log("Good to go!");
});

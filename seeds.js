const models = require("./models");
const { Category, Product } = models;
const faker = require("faker");
const adjective = faker.commerce.productAdjective;
const mongoseeder = require("mongooseeder");

const seeds = () => {
  let categories = [];
  for (let i = 1; i < 6; i++) {
    categories.push(
      new Category({
        name: [adjective(), adjective()].join(" ")
      })
    );
  }

  let products = [];
  for (let i = 1; i < 51; i++) {
    products.push(
      new Product({
        name: faker.commerce.productName(),
        price: faker.random.number({ min: 2, max: 100 }),
        category: categories[i % 5]
      })
    );
  }

  let promises = [];
  [categories, products].forEach(collection => {
    collection.forEach(model => {
      promises.push(model.save());
    });
  });

  return Promise.all(promises);
};

mongoseeder.seed({
  mongodbUrl: "mongodb://localhost/async_development",
  models: models,
  clean: true,
  mongoose: require("mongoose"),
  seeds: seeds
});

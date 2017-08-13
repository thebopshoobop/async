const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

module.exports = {
  Product: require("./product"),
  Category: require("./category")
};

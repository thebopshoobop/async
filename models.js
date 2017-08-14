"use strict";

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: String
});

const ProductSchema = new Schema({
  name: String,
  price: Number,
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  }
});

module.exports = {
  Product: mongoose.model("Product", ProductSchema),
  Category: mongoose.model("Category", CategorySchema)
};

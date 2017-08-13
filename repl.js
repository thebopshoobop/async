let repl = require("repl").start({});
const mongoose = require("mongoose");
const models = require("./models");

// connect
mongoose
  .connect("mongodb://localhost/async_development", { useMongoClient: true })
  .then(() => {
    // Set `models` global
    repl.context.models = models;

    // model globals
    Object.keys(models).forEach(modelName => {
      repl.context[modelName] = mongoose.model(modelName);
    });

    // logger
    repl.context.lg = data => console.log(data);
  });

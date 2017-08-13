"use strict";
const app = require("express")();

app.get("/", (req, res) => {
  res.end("Hello, world!");
});

app.listen(2000, "localhost", () => {
  console.log("Good to go!");
});

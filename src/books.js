"use strict";

var express = require("express");

var app = module.exports = express();

app.use(app.router);

// fake handler for the books endpoints
app.get("/:isbn", function (req, res) {
  var isbn = req.param("isbn");
  res.jsonp({
    isbn:   isbn,
    title:  "Title of " + isbn,
    author: "Author of " + isbn,
  });
});

// fake handler for the books endpoints
app.get("/:isbn/prices/:country/:currency", function (req, res) {
  // var isbn = req.param("isbn");
  res.jsonp([
    { price: 56.78 },
    { price: 12.34 },
    { price: 34.56 },
  ]);
});

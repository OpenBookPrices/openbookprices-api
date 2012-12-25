"use strict";

var express = require("express");

module.exports = function () {
  
  var app = express();

  // Allow all domains to request data (see CORS for more details)
  app.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    next();
  });

  // fake handler for the books endpoints
  app.get("/books/:isbn", function (req, res) {
    var isbn = req.param("isbn");
    res.jsonp({
      isbn:   isbn,
      title:  "Title of " + isbn,
      author: "Author of " + isbn,
    });
  });

  // fake handler for the books endpoints
  app.get("/books/:isbn/prices", function (req, res) {
    var isbn = req.param("isbn");
    res.jsonp([
      { price: 56.78 },
      { price: 12.34 },
      { price: 34.56 },
    ]);
  });

  // 404 everything
  app.all("*", function (req, res) {
    res.status(404);
    res.jsonp({ error: "404 - page not found" });
  });

  return app;
};

"use strict";

var express = require("express");

module.exports = function () {
  
  var app = express();

  // fake handler for the books endpoints
  app.get("/books/:isbn", function (req, res) {
    var isbn = req.param("isbn");
    res.jsonp({
      isbn:   isbn,
      title:  "Title of " + isbn,
      author: "Author of " + isbn,
    });
  });

  // 404 everything
  app.all("*", function (req, res) {
    res.status(404);
    res.jsonp({ error: "404 - page not found" });
  });

  return app;
};

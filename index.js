"use strict";

var express = require("express");

module.exports = function () {
  
  var app = express();

  // Allow all domains to request data (see CORS for more details)
  app.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    next();
  });
  
  
  app.use("/country", require("./src/country"));
  app.use("/books",   require("./src/books"));

  // 404 everything
  app.all("*", function (req, res) {
    res.status(404);
    res.jsonp({ error: "404 - page not found" });
  });

  return app;
};

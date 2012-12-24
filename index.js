"use strict";

var express = require("express");

module.exports = function () {
  
  var app = express();

  // 404 everything
  app.all("*", function (req, res) {
    res.status(404);
    res.jsonp({ error: "404 - page not found" });
  });

  return app;
};

"use strict";

var express = require("express"),
    helpers = require("./src/helpers");

module.exports = function () {

  var app = express();

  // By default don't cache anything (much easier when working with CloudFront)
  app.use( function (req, res, next) {
    res.header( "Cache-Control", helpers.cacheControl(0) );
    next();
  });

  // Allow all domains to request data (see CORS for more details)
  app.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    next();
  });

  app.use("/country", require("./src/country"));
  app.use("/books",   require("./src/books"));
  app.use("/prices",  require("./src/prices"));
  app.use("/echo",    require("./src/echo"));

  // 404 everything
  app.all("*", function (req, res) {
    res.status(404);
    res.jsonp({ error: "404 - page not found" });
  });

  return app;
};

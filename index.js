"use strict";

var express = require("express"),
    helpers = require("./src/helpers");

module.exports = function () {

  var app = express();

  app.use( express.compress() );

  // development only
  if ("development" == app.get("env")) {
    app.use(express.logger("dev"));
  }

  // Set up the default response
  app.use(function (req, res, next) {

    // By default don't cache anything (much easier when working with CloudFront)
    res.header( "Cache-Control", helpers.cacheControl(0) );

    // Allow all domains to request data (see CORS for more details)
    res.header("Access-Control-Allow-Origin", "*");

    next();
  });

  // Load the sub-apps
  app.use("/country", require("./src/country"));
  app.use("/books",   require("./src/books"));
  app.use("/prices",  require("./src/prices"));
  app.use("/echo",    require("./src/echo"));

  // 404 everything that was not caught above
  app.all("*", function (req, res) {
    res.status(404);
    res.jsonp({ error: "404 - page not found" });
  });

  // Default error handling - TODO change to JSON
  app.use(express.errorHandler());

  return app;
};

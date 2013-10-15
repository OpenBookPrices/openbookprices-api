"use strict";

var express = require("express"),
    helpers = require("./src/helpers");

module.exports = function () {

  var app = express();

  app.use( express.compress() );

  // configure logging
  if ("development" == app.get("env")) {
    app.use(express.logger("dev"));
  } else if ("production" == app.get("env")) {
    app.use(express.logger("default"));
  }

  // Configure some settings
  app.set("json spaces", 2);  // in production as well as in dev

  // Intercept the static content
  app.use("/", express.static(__dirname + "/static", { maxAge: 5 * 60 * 60 * 1000 }));

  // Set up the default response
  app.use(function (req, res, next) {

    // By default don't cache anything (much easier when working with CloudFront)
    res.header( "Cache-Control", helpers.cacheControl(0) );

    // Allow all domains to request data (see CORS for more details)
    res.header("Access-Control-Allow-Origin", "*");

    next();
  });

  // Load the sub-apps
  app.use("/v1/country", require("./src/country"));
  app.use("/v1/books",   require("./src/books"));
  app.use("/v1/echo",    require("./src/echo"));

  // 404 everything that was not caught above
  app.all("*", function (req, res) {
    res.status(404);
    res.jsonp({ error: "404 - page not found" });
  });

  // Default error handling - TODO change to JSON
  app.use(function (error, req, res, next) {
    if (error.status != 403) {
      return next();
    }
    res.status(403);
    res.jsonp({ error: "403 - forbidden"});
  });
  if ("development" == app.get("env")) {
    app.use(express.errorHandler());
  }

  return app;
};

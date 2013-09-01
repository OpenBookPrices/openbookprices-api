"use strict";

var express = require("express"),
    helpers = require("./helpers");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.all(
  "*",
  function (req, res) {

    // Don't cache this
    res.header( "Cache-Control", helpers.cacheControl(0) );

    // send it back as data
    res.jsonp({
      timestamp: Date.now()/1000,
      request: {
        method: req.method,
        secure: req.secure,
        protocol: req.protocol,
        host: req.host,
        subdomains: req.subdomains,
        url: req.url,
        originalUrl: req.originalUrl,
        path: req.path,
        query: req.query,
      },
      network: {
        ip: req.ip,
        ips: req.ips,
      },
      headers: req.headers,
    });
  }
);


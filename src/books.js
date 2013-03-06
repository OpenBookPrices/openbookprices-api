"use strict";

var express = require("express"),
    ean     = require("ean");

var app = module.exports = express();

app.use(app.router);

app.param("isbn", function (req, res, next) {
  
  var dirty = req.param("isbn");
  var clean = dirty.replace(/\D/g, "");

  // isbn10 to isbn13 - see http://www.isbn-13.info/ for algorithm
  if (clean.length == 10) {
    clean = "978" + clean.substr(0, 9);
    clean += ean.checksum(clean.split(""));
  }
  
  if (!clean || !ean.isValid(clean)) {
    return next("404");
  } else if (clean != dirty) {
    // FIXME - could break in interesting ways. Better to reconstruct the URL properly
    return res.redirect(req.originalUrl.replace(dirty, clean));
  }
  
  req.param("isbn", clean);
  next();
});


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

  // var isbn     = req.param("isbn");
  // var country  = req.param("country");
  // var currency = req.param("currency");
  
  res.jsonp([
    { price: 56.78 },
    { price: 12.34 },
    { price: 34.56 },
  ]);
});



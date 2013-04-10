"use strict";

var express         = require("express"),
    ean             = require("ean"),
    getter          = require("./getter"),
    geolocateFromIP = require("./geolocate").geolocateFromIP,
    countryData     = require("country-data"),
    format          = require("util").format;

var FALLBACK_COUNTRY  = "US";
var FALLBACK_CURRENCY = "USD";

var app = module.exports = express();

app.set("trust proxy", true);
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
    return res.jsonp(
      { error: "isbn '" + dirty + "' is not valid" },
      404
    );
  } else if (clean != dirty) {
    // FIXME - could break in interesting ways. Better to reconstruct the URL properly
    return res.redirect(req.originalUrl.replace(dirty, clean));
  }

  req.param("isbn", clean);
  next();
});


app.param("countryCode", function (req, res, next) {
  var code    = req.param("countryCode") || "";
  var country = countryData.countries[code];

  // if not valid, or not found then 404
  if (!/^[A-Z]{2}$/.test(code) || !country) {
    return res.jsonp(
      { error: format("country code '%s' is not a valid upper case ISO 3166 alpha2 identifier", code) },
      404
    );
  }

  // load up the country
  req.country = country;

  next();

});


app.param("currencyCode", function (req, res, next) {
  var code     = req.param("currencyCode") || "";
  var currency = countryData.currencies[code];

  // if not valid, or not found then 404
  if (!/^[A-Z]{3}$/.test(code) || !currency) {
    return res.jsonp(
      { error: format("currency code '%s' is not a valid upper case ISO 4217 identifier", code) },
      404
    );
  }

  // load up the country
  req.currency = currency;

  next();


});


// fake handler for the books endpoints
app.get("/:isbn", function (req, res, next) {
  var isbn = req.param("isbn");
  getter.getBookDetails(
    isbn,
    function (err, data) {
      if (err) { return next(err); }
      res.jsonp(data);
    }
  );
});

app.get("/:isbn/prices", geolocateFromIP, function (req,res) {
  res.header("Cache-Control", "private, max-age=600");

  var countryCode  = req.geolocatedData.code || FALLBACK_COUNTRY;
  var currencyCode =
    req.geolocatedData.currencies.length  ?
    req.geolocatedData.currencies[0].code :
    FALLBACK_CURRENCY;

  var path =   [
    req.param("isbn"),
    "prices",
    countryCode,
    currencyCode
  ].join("/");

  var url = path;

  var callback = req.param("callback");
  if (callback) {
    url += "?callback=" + callback;
  }

  res.redirect(url);
});


app.get("/:isbn/prices/:countryCode", function (req, res) {
  var currencyCode = req.country.currencies[0] || FALLBACK_CURRENCY;

  var path =   [
    req.param("isbn"),
    "prices",
    req.country.alpha2,
    currencyCode
  ].join("/");

  var url = path;

  var callback = req.param("callback");
  if (callback) {
    url += "?callback=" + callback;
  }

  res.redirect(url);
});

// app.get("/:isbn/prices/:countryCode/:currencyCode", function (req, res) {
//   res.send('FIXME');
// });

// fake handler for the books endpoints
app.get("/:isbn/prices/:countryCode/:currencyCode", function (req, res) {

  // var isbn     = req.param("isbn");
  // var country  = req.param("country");
  // var currency = req.param("currency");

  res.jsonp([
    { price: 56.78 },
    { price: 12.34 },
    { price: 34.56 },
  ]);
});



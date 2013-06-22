"use strict";

var ean             = require("ean"),
    _               = require("underscore"),
    countryData     = require("country-data"),
    getter          = require("./getter"),
    format          = require("util").format;

exports.isbn = function (req, res, next) {

  var dirty = req.params.isbn;
  var clean = dirty.replace(/\D/g, "");

  // isbn10 to isbn13 - see http://www.isbn-13.info/ for algorithm
  if (clean.length == 10) {
    clean = "978" + clean.substr(0, 9);
    clean += ean.checksum(clean.split(""));
  }

  if (!clean || !ean.isValid(clean)) {
    return res.json(
      { error: "isbn '" + dirty + "' is not valid" },
      404
    );
  }

  req.isbn = clean;
  req.params.isbn = clean;

  next();
};


exports.countryCode = function (req, res, next) {
  var code    = req.params.countryCode || "";
  var country = countryData.countries[code.toUpperCase()];

  // if not valid, or not found then 404
  if (!country) {
    return res.json(
      { error: format("country code '%s' is not a valid ISO 3166 alpha2 identifier", code) },
      404
    );
  }

  // load up the country
  req.country = country;
  req.params.countryCode  = country.alpha2;

  next();
};


exports.currencyCode = function (req, res, next) {
  var code     = req.params.currencyCode || "";
  var currency = countryData.currencies[code.toUpperCase()];

  // if not valid, or not found then 404
  if (!currency) {
    return res.json(
      { error: format("currency code '%s' is not a valid ISO 4217 identifier", code) },
      404
    );
  }

  // load up the currency
  req.currency = currency;
  req.params.currencyCode = currency.code;

  next();
};


exports.vendorCode = function (req, res, next) {
  var code     = (req.params.vendorCode || "").toLowerCase();

  // if not valid, or not found then 404
  if (!getter.isVendorCodeKnown(code)) {
    return res.json(
      { error: format("currency code '%s' is not a valid ISO 4217 identifier", code) },
      404
    );
  }

  req.vendor            = code;
  req.params.vendorCode = code;

  next();
};


exports.redirectToCanonicalURL = function (pathParts) {

  return function (req, res, next) {

    var components = [];
    _.each(pathParts, function (key) {
      components.push( req.params[key]);
    });

    var canonicalPath = components.join("/");

    if (req.path == "/" + canonicalPath) {
      return next();
    }

    res.redirect( canonicalPath, 301 );

  };
};



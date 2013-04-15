"use strict";

var ean             = require("ean"),
    _               = require("underscore"),
    countryData     = require("country-data"),
    format          = require("util").format;

exports.isbn = function (req, res, next) {

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
  }

  req.l2b = req.l2b || {};
  req.l2b.isbn = clean;

  next();
};


exports.countryCode = function (req, res, next) {
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
  req.l2b.country  = country.alpha2;
  req.l2b.currency = country.currencies[0];

  next();

};


exports.currencyCode = function (req, res, next) {
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
  req.l2b.currency = currency;

  next();

};


exports.redirectToCanonicalURL = function (pathParts) {

  return function (req, res, next) {

    var components = [];
    _.each(pathParts, function (key) {
      components.push( req.l2b[key]);
    });

    var canonicalPath = components.join("/");

    if (req.path == "/" + canonicalPath) {
      return next();
    }

    // Add the callback
    if (req.param("callback")) {
      canonicalPath += "?callback=" + req.param("callback");
    }

    res.redirect( canonicalPath );

  };
};



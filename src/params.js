"use strict";

var ean             = require("ean"),
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
  } else if (clean != dirty) {
    // FIXME - could break in interesting ways. Better to reconstruct the URL properly
    return res.redirect(req.originalUrl.replace(dirty, clean));
  }

  req.param("isbn", clean);
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
  req.currency = currency;

  next();

};

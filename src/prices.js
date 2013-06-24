"use strict";

var express         = require("express"),
    getter          = require("./getter"),
    _               = require("underscore"),
    middleware      = require("./middleware"),
    geolocateFromIP = require("./geolocate").geolocateFromIP;

var FALLBACK_COUNTRY  = "US";
var FALLBACK_CURRENCY = "USD";

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.param("isbn",         middleware.isbn);
app.param("countryCode",  middleware.countryCode);
app.param("currencyCode", middleware.currencyCode);
app.param("vendorCode",   middleware.vendorCode);

app.get(
  "/:isbn",
  middleware.redirectToCanonicalURL(["isbn"]),
  geolocateFromIP,
  function (req,res) {
    res.header("Cache-Control", "private, max-age=600");

    var countryCode  = req.geolocatedData.code || FALLBACK_COUNTRY;
    var currencyCode =
      req.geolocatedData.currencies.length  ?
      req.geolocatedData.currencies[0].code :
      FALLBACK_CURRENCY;

    var path =   [
      req.param("isbn"),
      countryCode,
      currencyCode
    ].join("/");

    var url = path;

    var callback = req.param("callback");
    if (callback) {
      url += "?callback=" + callback;
    }

    res.redirect(url);
  }
);

app.get(
  "/:isbn/:countryCode",
  middleware.redirectToCanonicalURL(["isbn", "countryCode"]),
  function (req, res, next) {
    req.params.currencyCode = req.country.currencies[0] || FALLBACK_CURRENCY;
    next();
  },
  middleware.redirectToCanonicalURL(["isbn", "countryCode", "currencyCode"])
);


app.get(
  "/:isbn/:countryCode/:currencyCode",
  middleware.redirectToCanonicalURL(["isbn", "countryCode", "currencyCode"]),
  function (req, res, next) {

    getter.getBookPrices(
      {
        isbn: req.isbn,
        country: req.country.alpha2,
        currency: req.currency.code,
      },
      function (err, results) {
        if (err) {
          return next(err);
        }

        res.json( _.chain(results).values().value() );

      }
    );

  }
);


app.get(
  "/:isbn/:countryCode/:currencyCode/:vendorCode",
  middleware.redirectToCanonicalURL(["isbn", "countryCode", "currencyCode", "vendorCode"]),
  function (req, res, next) {
    // check that the vendor sells to this country
    if (!getter.doesVendorServeCountry(req.vendor, req.country.alpha2)) {
      return res.json(400, {error: "Vendor does not sell to that country"});
    }
    next();
  },
  function (req, res, next) {
    getter.getBookPricesForVendor(
      {
        isbn: req.isbn,
        vendor: req.vendor,
        country: req.country.alpha2,
        currency: req.currency.code,
      },
      function (err, details) {
        if (err) {
          return next(err);
        }

        // Set the expiry header. Make it the same as the scrape expires.
        var expires = new Date(details.expires * 1000);
        res.header("Expires", expires.toString());

        // Set the max age header
        var maxAge = Math.floor(details.expires - Date.now() / 1000);
        res.header(
          "Cache-Control",
          maxAge > 0 ? "max-age=" + maxAge : "no-cache"
        );

        res.json(details);
      }
    );
  }
);














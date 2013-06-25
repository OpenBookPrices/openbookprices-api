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

    var getterArgs = {
      isbn: req.isbn,
      vendor: req.vendor,
      country: req.country.alpha2,
      currency: req.currency.code,
    };

    // The scrape may take too long, so set a timeout. If it triggers send a pending
    // response to the client and let the scrape continue in the background.
    setTimeout(
      function () {
        // Set the max age header
        var maxAge = 2 * 1000; // FIXME - set in config
        var content = getter.createPendingResponse(getterArgs);
        if (!res.headerSent) {
          res.header("Cache-Control", "max-age=" + maxAge);
          res.json(content);
        }
      },
      4000 // FIXME - should be in config
    );

    getter.getBookPricesForVendor(
      getterArgs,
      function (err, details) {
        if (err) {
          return next(err);
        }

        // Set the cache header. Make it the same as the scrape expires.
        var maxAge = Math.floor(details.expires - Date.now() / 1000);

        if (!res.headerSent) {
          res.header(
            "Cache-Control",
            maxAge > 0 ? "max-age=" + maxAge : "no-cache"
          );
          res.json(details);
        }
      }
    );
  }
);














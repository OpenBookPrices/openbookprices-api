"use strict";

var express         = require("express"),
    // getter          = require("./getter"),
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


app.get("/:isbn", middleware.redirectToCanonicalURL(["isbn"]), geolocateFromIP, function (req,res) {
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
});


app.get(
  "/:isbn/:countryCode",
  middleware.redirectToCanonicalURL(["isbn", "country", "currency"])
);

// app.get("/:isbn/:countryCode/:currencyCode", function (req, res) {
//   res.send('FIXME');
// });

// fake handler for the books endpoints
app.get("/:isbn/:countryCode/:currencyCode", function (req, res) {

  // var isbn     = req.param("isbn");
  // var country  = req.param("country");
  // var currency = req.param("currency");

  res.jsonp([
    { price: 56.78 },
    { price: 12.34 },
    { price: 34.56 },
  ]);
});



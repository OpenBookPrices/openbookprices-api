"use strict";

var express         = require("express"),
    getter          = require("./getter"),
    params          = require("./params");

var app = module.exports = express();

app.set("trust proxy", true);
app.use(app.router);

app.param("isbn", params.isbn);

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


"use strict";

var apiApp  = require("./index");
var logger = require("./src/logger.js");

var app = apiApp();

// get the port from the commandline, or default
var port = process.argv[2] || 3000;

logger.info("API running on http://127.0.0.1:%s/", port);
app.listen(port);

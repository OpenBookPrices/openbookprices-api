"use strict";

var apiApp  = require("./index");

var app = apiApp();

// get the port from the commandline, or default
var port = process.argv[2] || 3000;

console.log("Listening on port %s", port);
app.listen(port);

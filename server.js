"use strict";

var express = require("express"),
    apiApp  = require("./index");

var app = express();

// Make dev easier
app.use(express.logger("dev"));
app.use(express.errorHandler());

app.use( apiApp() );

// get the port from the commandline, or default
var port = process.argv[2] || 3000;
console.log("Listening on port %s", port);

app.listen(port);

"use strict";


var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
  console.log("Redis error " + err);
});

module.exports = client;

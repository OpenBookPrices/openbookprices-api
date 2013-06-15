"use strict";

var sinon   = require("sinon"),
    getter = require("../src/getter"),
    client = require("../src/redis-client");


// Put the getter into test mode. This means using a nonstandard redis database
// and flushing it.
beforeEach(function (done) {
  getter.enterTestMode(done);
});

// Create a fresh Sinon sandbox before every test
beforeEach(function () {
  var sandbox = this.sandbox = sinon.sandbox.create({ useFakeTimers: true });

  this.waitForCache = function (cb) {
    var commandQueue = "command_queue";
    if ( client[commandQueue].length === 0) {
      return cb();
    }
    client.once("idle", function () {
      client.ping(cb);
    });
  };

  this.delay = function (delay) {
    return function (cb) {
      setTimeout(cb, delay);
      sandbox.clock.tick(delay);
    };
  };

});

// Clean up the sandbox.
afterEach(function () {
  this.sandbox.restore();
});


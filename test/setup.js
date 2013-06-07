"use strict";

var sinon   = require("sinon"),
    getter = require("../src/getter");


// Put the getter into test mode. This means using a nonstandard redis database
// and flushing it.
beforeEach(function (done) {
  getter.enterTestMode(done);
});

// Create a fresh Sinon sandbox before every test
beforeEach(function () {
  this.sandbox = sinon.sandbox.create();
});

// Clean up the sandbox.
afterEach(function () {
  this.sandbox.restore();
});


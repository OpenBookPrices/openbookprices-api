"use strict";

var sinon   = require("sinon"),
    getter = require("../src/getter"),
    client = require("../src/redis-client"),
    samples = require("./samples"),
    fetcher = require("l2b-price-fetchers");


// Put the getter into test mode. This means using a nonstandard redis database
// and flushing it.
beforeEach(function (done) {
  getter.enterTestMode(done);
});

// Create a fresh Sinon sandbox before every test
beforeEach(function () {
  var sandbox = this.sandbox = sinon.sandbox.create({ useFakeTimers: true });
  sandbox.clock.tick(samples.zeroTime);

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

  // Stub the tester so that we only use our test vendors.
  sandbox
    .stub(fetcher, "allVendorCodes")
    .returns(["test-vendor-1", "test-vendor-2"]);

  // stub the country so that only test-vendor-1 is returned
  var vendorsForCountry = this.sandbox
    .stub(fetcher, "vendorsForCountry");
  vendorsForCountry.withArgs("GB").returns(["test-vendor-1"]);
  vendorsForCountry.withArgs("US").returns(["test-vendor-1"]);


});

// Clean up the sandbox.
afterEach(function () {
  this.sandbox.restore();
});


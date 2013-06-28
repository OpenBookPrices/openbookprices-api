"use strict";

var exchange = require("../src/exchange"),
    assert = require("assert");

describe("Exchange", function () {
  describe("Load and keep fresh the exchange rates", function () {

    it("should be using test path", function () {
      // check it is faked out for tests
      var stubbedPath = "config/initial_exchange_rates.json";
      assert.equal( exchange.pathToLatestJSON(), stubbedPath);

      // check it is normally correct
      exchange.pathToLatestJSON.restore();
      assert.notEqual( exchange.pathToLatestJSON(), stubbedPath);
    });

    it("load exchange rate from disk");

  });
});


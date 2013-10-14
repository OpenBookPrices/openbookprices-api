"use strict";

require("./setup");

var assert  = require("assert"),
    helpers = require("../src/helpers");

describe("Helpers", function () {
  describe("cacheControl", function () {

    var cacheControl = helpers.cacheControl;

    it("should handle zero or less than 1", function () {
      assert.equal(cacheControl(0), "no-cache");
      assert.equal(cacheControl(-1), "no-cache");
    });

    it("should handle null", function () {
      assert.equal(cacheControl(null), "no-cache");
    });

    it("should handle greater than 1", function () {
      assert.equal(cacheControl(1),         "public, max-age=1");
      assert.equal(cacheControl(123456),    "public, max-age=123456");
      assert.equal(cacheControl("123456"),  "public, max-age=123456");
      assert.equal(cacheControl(123.456),   "public, max-age=123");
      assert.equal(cacheControl("123.456"), "public, max-age=123");
    });

  });
});

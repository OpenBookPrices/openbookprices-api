"use strict";

require("./setup");

var request = require("supertest"),
    apiApp  = require("../"),
    helpers = require("../src/helpers");

request = request(apiApp());

describe("/v1/echo", function () {

  it("should return correct details for valid isbn", function (done) {
    request
      .get("/v1/echo/foo/bar")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect("Cache-Control", helpers.cacheControl(0))
      // .expect({ ... })
      .end(done);
  });

});

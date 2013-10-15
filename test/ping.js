"use strict";

require("./setup");

var request = require("supertest"),
    apiApp  = require("../"),
    helpers = require("../src/helpers");

request = request(apiApp());

describe("/v1/ping", function () {

  it("should pong back as expected", function (done) {
    request
      .get("/v1/ping/foo/bar")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect("Cache-Control", helpers.cacheControl(0))
      .expect({
        timestamp: 1000000000,
        network: {
          ip: "127.0.0.1",
          ips: []
        }
      })
      .end(done);
  });

});

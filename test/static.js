"use strict";

require("./setup");

var request = require("supertest"),
    apiApp  = require("../"),
    helpers = require("../src/helpers");

request = request(apiApp());

describe("static pages", function () {

  it("/robots.txt", function (done) {
    request
      .get("/robots.txt")
      .expect(200)
      .expect("Content-Type", "text/plain; charset=UTF-8")
      .expect("Cache-Control", helpers.cacheControl(5 * 60 * 60))
      .end(done);
  });

  it("/favicon.ico", function (done) {
    request
      .get("/favicon.ico")
      .expect(200)
      .expect("Content-Type", "image/x-icon")
      .expect("Cache-Control", helpers.cacheControl(5 * 60 * 60))
      .end(done);
  });

  it("/../config/default.js", function (done) {

    request
      .get("/../config/default.js")
      .expect(403)
      .end(done);
  });

});

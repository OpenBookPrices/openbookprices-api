"use strict";

require("./setup");

var request = require("supertest"),
    apiApp  = require("../");

request = request(apiApp());

describe("/", function () {

  it("should redirect to current version of API (v1)", function (done) {
    request
      .get("/")
      .expect(302)
      .expect("Location", "/v1")
      .end(done);
  });

});

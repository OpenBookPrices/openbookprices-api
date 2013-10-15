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

describe("/v1", function () {

  it("should list endpoints that can be reached", function (done) {
    request
      .get("/v1")
      .expect(200)
      .expect({
        books: "http://api.127.0.0.1.xip.io:3000/v1/books",
        ping: "http://api.127.0.0.1.xip.io:3000/v1/ping",
      })
      .end(done);
  });

});

describe("/does/not/exist", function () {

  it("should 404", function (done) {
    request
      .get("/does/not/exist")
      .expect(404)
      .expect({ error: "404 - page not found" })
      .end(done);
  });

});

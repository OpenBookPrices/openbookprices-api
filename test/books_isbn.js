"use strict";

require("./setup");

var assert = require("assert"),
    request = require("supertest"),
    config = require("config"),
    fetcher = require("openbookprices-fetchers"),
    apiApp  = require("../"),
    samples = require("./samples");

var testBaseUrl = config.api.protocol + "://" + config.api.hostport;

request = request(apiApp());

describe("/books/:isbn", function () {

  var fetchStub;

  beforeEach(function () {
    // stub the fetch so that it does not do a scrape
    fetchStub = this.sandbox
      .stub(fetcher, "fetch")
      .yields(null, samples.fetch["9780340831496"]);
  });

  it("should redirect to normalised isbn13", function (done) {
    request
      .get("/books/0340831499")
      .expect(301)
      .expect("Location", testBaseUrl + "/books/9780340831496")
      .end(function (err) {
        assert(!fetchStub.called);
        done(err);
      });
  });

  it("should return 404 when the isbn is not valid", function (done) {
    request
      .get("/books/123456789")
      .expect(404)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect({ error: "isbn '123456789' is not valid" })
      .end(function (err) {
        assert(!fetchStub.called);
        done(err);
      });
  });

});

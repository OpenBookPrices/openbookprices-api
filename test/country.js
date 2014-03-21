"use strict";

require("./setup");

// var assert = require("assert");
var request = require("supertest"),
    apiApp  = require("../");

request = request(apiApp());

describe("/v1/country", function () {
  describe("/determineFromIPAddress", function () {

    it("should return default for non-geo ip", function (done) {
      request
        .get("/v1/country/determineFromIPAddress")
        .expect(200)
        .expect("Cache-Control", "private, max-age=600")
        .expect({ id: "", code: "", name: "", currencies: [], ip: "127.0.0.1" })
        .end(done);
    });

    it("UK IP address", function (done) {
      request
        .get("/v1/country/determineFromIPAddress")
        .set("X-Forwarded-For", "217.64.234.65, 127.0.0.1") // nhs.uk
        .expect(200)
        .expect("Cache-Control", "private, max-age=600")
        .expect({
          id: "GB",
          code: "GB",
          name: "United Kingdom",
          currencies: [{code: "GBP", name: "Pound sterling"}],
          ip: "217.64.234.65"
        })
        .end(done);
    });

    it("US IP address", function (done) {
      request
        .get("/v1/country/determineFromIPAddress")
        .set("X-Forwarded-For", "173.223.104.110, 127.0.0.1") // whitehouse.gov
        .expect(200)
        .expect("Cache-Control", "private, max-age=600")
        .expect({
          id:   "US",
          code: "US",
          name: "United States",
          currencies: [{code: "USD", name: "United States dollar"}],
          ip: "173.223.104.110"
        })
        .end(done);
    });

    it("French IP address", function (done) {
      request
        .get("/v1/country/determineFromIPAddress")
        .set("X-Forwarded-For", "217.70.184.1, 127.0.0.1") // gandi.net
        .expect(200)
        .expect("Cache-Control", "private, max-age=600")
        .expect({
          id:   "FR",
          code: "FR",
          name: "France",
          currencies: [{code: "EUR", name: "Euro"}],
          ip: "217.70.184.1"
        })
        .end(done);
    });

    it("IP address specified as parameter", function (done) {
      request
        .get("/v1/country/determineFromIPAddress?ip=217.64.234.65") // UK
        .set("X-Forwarded-For", "217.70.184.1, 127.0.0.1") // French
        .expect(200)
        .expect("Cache-Control", "private, max-age=600")
        .expect({
          id: "GB",
          code: "GB",
          name: "United Kingdom",
          currencies: [{code: "GBP", name: "Pound sterling"}],
          ip: "217.64.234.65"
        })
        .end(done);
    });

    it("invalid IP address specified as parameter", function (done) {
      request
        .get("/v1/country/determineFromIPAddress?ip=foobar") // invalid
        .set("X-Forwarded-For", "217.70.184.1, 127.0.0.1") // French
        .expect(404)
        .expect({
          error: "'foobar' is not a valid IP address"
        })
        .end(done);
    });


  });
});

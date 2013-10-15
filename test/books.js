"use strict";

require("./setup");

var request = require("supertest"),
    config = require("config"),
    apiApp  = require("../");

request = request(apiApp());

describe("/v1/books", function () {

  it("should give some examples", function (done) {

    var testBaseUrl = config.api.protocol + "://" + config.api.hostport + "/v1/books/";

    request
      .get("/v1/books")
      .expect(200)
      .expect({
        examples: {
          "Code Complete by Steve McConnell": testBaseUrl + "9780735619678",
          "Walden by Henry David Thoreau":    testBaseUrl + "9781619493919",
        },
      })
      .end(done);
  });


});

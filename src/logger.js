var bunyan = require("bunyan");
var log = bunyan.createLogger({name: "api"});

log.level("info");

module.exports = log;

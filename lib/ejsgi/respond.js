
var http = require("http");

module.exports = Respond;

function Respond (res, emitter) {
  // first, send the header appropriately.
  res.sendHeader(emitter.status, emitter.headers);
  // now listen for body and finish.
  emitter.addListener("body", function (chunk) {
    res.sendBody(chunk);
  });
  emitter.addListener("finish", function () { res.finish() });
};


var http = require("http");

module.exports = Respond;

function Respond (res, stream) {
  // first, send the header appropriately.
  res.sendHeader(stream.status, stream.headers);
  // now listen for body and finish.
  stream.addListener("data", function (chunk) {
    res.sendBody(chunk);
  });
  stream.addListener("eof", function () { res.finish() });
};

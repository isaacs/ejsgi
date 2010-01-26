
var http = require("http");

module.exports = Respond;

function Respond (res, jsgiResp) {
  // first, send the header appropriately.
  res.sendHeader(jsgiResp.status, jsgiResp.headers);
  // now listen for body and finish.
  jsgiResp.body.addListener("data", function (chunk) {
    res.sendBody(chunk);
  });
  jsgiResp.body.addListener("eof", function () { res.finish() });
};


var http = require("http"),
  Promise = require("events").Promise;

module.exports = Respond;

function Respond (res, jsgiResp) {
  
  if (jsgiResp instanceof Promise) {
    jsgiResp.addCallback(function (jsgiResp) { Respond(res, jsgiResp) });
    return
  }
  
  // first, send the header appropriately.
  res.sendHeader(jsgiResp.status, jsgiResp.headers);
  // now listen for body and finish.
  jsgiResp.body.addListener("data", function (chunk) {
    res.sendBody(chunk);
  });
  jsgiResp.body.addListener("end", function () { res.finish() });
};


var url = require("url"),
  querystring = require("querystring"),
  sys = require("sys"),
  Stream = require("./stream");

module.exports = Request;

function Request (req, res, hostname, port, server, secure) {
  this.env = {ejsgi:{
    request:req,
    server:server
  }};
  this.jsgi = {
    version : [0,3],
    multithread : false,
    multiprocess : false,
    runOnce : false,
    cgi : false,
    ext : { stream : [0,1] },
    errors : new Stream,
    stream : Stream,
    async : true
  };
  
  var requrl = url.parse(req.url),
    reqhost = (req.headers.host||"").split(":").shift();
  
  this.version = [req.httpVersionMajor, req.httpVersionMinor];
  this.method = req.method;
  this.scriptName = "";
  this.url = req.url;
  this.pathInfo = requrl.pathname;
  this.queryString = requrl.querystring;
  this.host = requrl.hostname || reqhost || hostname;
  this.port = port;

  this.scheme = secure ? "https" : "http";
  
  this.headers = objToLower(req.headers);
  this.remoteAddr = req.client.remoteAddress;
  this.httpVersion = req.httpVersion;

  // push the request through the stream.
  // This should be obsolete soon, once Streams are first class citizens.
  var body = this.input = new Stream();
  req.addListener("body", function (chunk) { body.write(chunk) });
  req.addListener("complete", function () { body.close() });
  body.addListener("pause", function () { req.pause() });
  body.addListener("resume", function () { req.resume() });
};

function objToLower (obj) {
  var out = {};
  for (var i in obj) out[i.toLowerCase()] = obj[i];
  return out;
};


var url = require("url"),
  querystring = require("querystring"),
  sys = require("sys"),
  events = require("events");

module.exports = Request;

function Request (req, res, hostname, port) {
  events.EventEmitter.call(this);
  this._request = req;
  
  this.env = {};
  this.ejsgi = {
    version : [0,0],
    multithread : false,
    multiprocess : false,
    runOnce : false,
    cgi : false,
    ext : ""
  };
  
  var requrl = url.parse(req.url),
    reqhost = req.headers.host.split(":").shift();
  
  this.method = req.method;
  this.scriptName = "";
  this.url = req.url;
  this.pathInfo = requrl.pathname;
  this.queryString = requrl.querystring;
  this.hostName = requrl.hostname || reqhost || hostname;
  this.port = port;
  
  // todo: determine whether it's http or https.
  this.scheme = "http";
  
  this.headers = req.headers;
  this.remoteAddr = req.client.remoteAddress;
  this.httpVersion = req.httpVersion;
  
  // fire the first wave of events.
  this.emit("request", req.method+" "+req.url+" HTTP/"+req.httpVersion);
  for (var h in req.headers) this.emit("headerField", h, req.headers[h]);
  this.emit("header", req.headers);
  var self = this;
  req.addListener("body", function (chunk) { self.emit("body", chunk) });
  req.addListener("complete", function () { self.emit("finish") });
};
Request.prototype.__proto__ = events.EventEmitter.prototype;

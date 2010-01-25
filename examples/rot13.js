// an example of streaming the body through a middleware.
// this turns the echo app into a simple rot13 encoder/decoder.

var ejsgi = require("../lib/ejsgi"),
  sys = require("sys"),
  Emitter = require("events").EventEmitter,
  echoApp = require("./echo").app,
  letters = "abcdefghijklmnopqrstuvwxyz",
  rot13 = function (str) {
    var out = "";
    for (var i = 0, l = str.length; i < l; i ++) {
      var chr = str.charAt(i).toLowerCase(),
        where = letters.indexOf(chr);
      if (where === -1) out += chr;
      else out += letters.charAt((where + 13)%26);
    }
    return out;
  },
  rot13Middleware = function (app) { return function (req) {
    var out = new Emitter, orig = app(req);
    out.status = orig.status;
    out.headers = orig.headers;
    orig
      .addListener("body", function (chunk) { out.emit("body", rot13(chunk)) })
      .addListener("finish", function () { out.emit("finish") });
    return out;
  }};

ejsgi.Server(rot13Middleware(echoApp), "localhost", 8000).start();

sys.error("Running on http://localhost:8000/");

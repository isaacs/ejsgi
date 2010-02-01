
// an example of streaming the body through a middleware.
// this turns the echo app into a simple rot13 encoder/decoder.

var ejsgi = require("../lib/ejsgi"),
  sys = require("sys"),
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
    var out = { body : new (req.jsgi.stream) },
      orig = app(req);
    out.status = orig.status;
    out.headers = orig.headers;
    orig.body.addListener("data", function (chunk) { out.body.write(rot13(chunk)) });
    orig.body.addListener("end", function () { out.body.close() });
    return out;
  }};

ejsgi.Server(rot13Middleware(echoApp), "localhost", 8000).start();

sys.error("Running on http://localhost:8000/");

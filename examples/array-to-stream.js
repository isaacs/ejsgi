
// like hello world, but with a string and some handy middleware,
// rather than with just a stream.

var ejsgi = require("../lib/ejsgi"),
  helloApp = function (req) {
    var out = {};
    var message = ["Hel","lo,"," worl","d!"];
    out.status = 200;
    out.headers = {
      "content-type" : "text/plain"
    };
    out.body = message;
    return out;
  },
  foreachableToStream = function (app) { return function (req) {
    var out = app(req);
    if (typeof(out.body.forEach) === "function") {
      var body = new (req.jsgi.stream);
      out.body.forEach(function (chunk) { body.write(chunk) });
      body.close();
      out.body = body;
    }
    return out;
  }};

ejsgi.Server(foreachableToStream(helloApp), "localhost", 8000).start();

require("sys").error("Running on http://localhost:8000/");

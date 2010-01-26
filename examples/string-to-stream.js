
// like hello world, but with a string and some handy middleware,
// rather than with just a stream.

var ejsgi = require("../lib/ejsgi"),
  Stream = require("../lib/ejsgi/stream"),
  helloApp = function (req) {
    var out = {};
    var message = "Hello, world!";
    out.status = 200;
    out.headers = {
      "content-type" : "text/plain",
      "content-length" : message.length
    };
    out.body = message;
    return out;
  },
  stringToStream = function (app) { return function (req) {
    var out = app(req);
    if (typeof(out.body) === "string") {
      var body = new Stream;
      body.write(out.body);
      body.close();
      out.body = body;
    }
    return out;
  }};

ejsgi.Server(stringToStream(helloApp), "localhost", 8000).start();

require("sys").error("Running on http://localhost:8000/");

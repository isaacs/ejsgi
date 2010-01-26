
var ejsgi = require("../lib/ejsgi"),
  Stream = require("../lib/ejsgi/stream");

ejsgi.Server(function (req) {
  var out = new Stream;
  var message = "Hello, world!";
  out.status = 200;
  out.headers = {
    "content-type" : "text/plain",
    "content-length" : message.length
  };
  out.write(message);
  out.close();
  return out;
}, "localhost", 8000).start();

require("sys").error("Running on http://localhost:8000/");

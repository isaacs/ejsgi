
var ejsgi = require("../lib/ejsgi");

ejsgi.Server(function (req) {
  var out = { body : new (req.jsgi.stream) };
  var message = "Hello, world!";
  out.status = 200;
  out.headers = {
    "content-type" : "text/plain",
    "content-length" : message.length
  };
  out.body.write(message);
  out.body.close();
  return out;
}, "localhost", 8000).start();

require("sys").error("Running on http://localhost:8000/");

var ejsgi = require("../lib/ejsgi"),
  Emitter = require("events").EventEmitter;

ejsgi.Server(function (req) {
  var out = new Emitter;
  var message = "Hello, world!";
  out.status = 200;
  out.headers = {
    "content-type" : "text/plain",
    "content-length" : message.length
  };
  process.nextTick(function () {
    out.emit("body", message);
    out.emit("finish");
  });
  return out;
}, "localhost", 8000).start();

require("sys").error("Running on http://localhost:8000/");
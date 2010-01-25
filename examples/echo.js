
exports.app = function (req) {
  var out = new Emitter;
  var message = decodeURIComponent(req.url);
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
};
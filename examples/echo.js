
var Stream = require("../lib/ejsgi/stream");

exports.app = function (req) {
  var out = new Stream;
  var message = decodeURIComponent(req.url);
  out.status = 200;
  out.headers = {
    "content-type" : "text/plain",
    "content-length" : message.length
  };
  out.write(message);
  out.close();
  return out;
};

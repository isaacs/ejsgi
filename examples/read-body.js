var ejsgi = require("../lib/ejsgi"),
  Emitter = require("events").EventEmitter;



var form = [
  '<!doctype html>',
  '<html><head><title>A simple form</title></head>',
  '<body>',
  '<form method="post" target="">',
    '<fieldset>',
      '<label>A simple form</label>',
      '<input name="foo" type="text" value="data goes here">',
      '<input name="submit" type="submit" value="Submit Data">',
    '</fieldset>',
  '</form>',
  '</body>',
  '</html>'
].join("");
function sendForm (out) {
  out.status = 200;
  out.headers = {
    "content-type" : "text/html",
    "content-length" : form.length
  };
  return function () { out.emit("body", form); out.emit("finish") };
};

function readAndEcho (req, out) {
  out.status = 200;
  out.headers = {"content-type" : "text/plain"};
  req.addListener("body", function (chunk) { out.emit("body", chunk) });
  req.addListener("finish", function () { out.emit("finish") });
};

ejsgi.Server(function bodyEcho (req) {
  var out = new Emitter;
  switch (req.method) {
    case "POST":
      readAndEcho(req, out);
    break;
    default:
      process.nextTick(sendForm(out));
    break;
  }
  return out;
  
}, 8000, "localhost").start();



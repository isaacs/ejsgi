
var ejsgi = require("../lib/ejsgi"),
  Stream = require("../lib/ejsgi/stream");

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

ejsgi.Server(function bodyEcho (req) {
  var out = new Stream;
  switch (req.method) {
    case "POST":
      out.status = 200;
      out.headers = {"content-type" : "text/plain"};
      req.addListener("data", function (chunk) { out.write(chunk) });
      req.addListener("eof", function () { out.close() });
    break;
    default:
      out.status = 200;
      out.headers = {
        "content-type" : "text/html",
        "content-length" : form.length
      };
      out.write(form);
      out.close();
    break;
  }
  return out;
  
}, 8000, "localhost").start();

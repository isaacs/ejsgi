
var ejsgi = require("../lib/ejsgi");

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
  var out = { body : new (req.jsgi.stream) };
  switch (req.method) {
    case "POST":
      out.status = 200;
      out.headers = {"content-type" : "text/plain"};
      req.input.addListener("data", function (chunk) { out.body.write(chunk) });
      req.input.addListener("end", function () { out.body.close() });
    break;
    default:
      out.status = 200;
      out.headers = {
        "content-type" : "text/html",
        "content-length" : form.length
      };
      out.body.write(form);
      out.body.close();
    break;
  }
  return out;
  
}, 8000, "localhost").start();

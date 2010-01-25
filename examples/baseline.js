require("http").createServer(function (req,res) {
  var message = "hello, world";
  res.sendHeader(200, {"content-type":"text/plain", "content-length":message.length});
  res.sendBody(message);
  res.finish();
}).listen(8000, "localhost")

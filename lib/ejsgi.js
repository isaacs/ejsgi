var http = require("http"),
  Request = require("./ejsgi/request"),
  Respond = require("./ejsgi/respond")

exports.Server = function (app /* , port, hostname */) {
  var hostname = "localhost",
    port = 8000;
  Array.prototype.slice.call(arguments, 1).forEach(function (arg) {
    if (typeof(arg) === "string") hostname = arg;
    if (typeof(arg) === "number") port = arg;
  });
  return { start : starter(app, hostname, port), stop : stopper };
};

function starter (app, hostname, port) { return function () {
  var server = this._server = http.createServer(function handleConnection (req, res) {
    // turn the req into an emitter, and pass to the app.
    Respond(res, app(new Request(req, res, hostname, port, server)))
  });
  server.listen(port, hostname);
}};
function stopper () { this._server.close() };

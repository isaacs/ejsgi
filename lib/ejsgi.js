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
  return {
    start : starter(app, hostname, port),
    stop : stopper
  };
};

function secure () {
  this._secure = arguments;
  if (this._server) this._server.setSecure.apply(this._server, arguments);
};
function starter (app, hostname, port) { return function () {
  var secure = this._secure,
    server = this._server = http.createServer(function handleConnection (req, res) {
      // turn the req into an emitter, and pass to the app.
      Respond(res, app(new Request(req, res, hostname, port, server, !!secure)))
    });
  if (secure) server.setSecure.call(server, secure);
  server.listen(port, hostname);
}};
function stopper () { this._server.close(); delete(this._server); };

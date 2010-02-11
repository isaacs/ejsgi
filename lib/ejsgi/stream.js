
module.exports = Stream;

var Emitter = require("events").EventEmitter;

function Stream () {
  Emitter.call(this);
  
  var buffer = [];
  this.pause = function () {
    this.emit("pause");
    buffer.paused = true;
  };
  this.resume = function () {
    this.emit("resume");
    buffer.paused = false;
    flow(this, buffer);
  };
  this.write = function (data, encoding) {
    encoding = encoding || "binary";
    if (buffer.closed) throw new Error("Cannot write after EOF.");
    var now = !buffer.paused && buffer.length === 0;
    buffer.draining = !now;
    buffer.push([data, encoding]);
    flow(this, buffer);
    return now;
  };
  this.close = function () {
    buffer.closed = true;
    flow(this, buffer);
  };
};

function flow (stream, buffer) {
  if (buffer.flowing || buffer.paused) return;
  buffer.flowing = true;
  process.nextTick(function () {
    buffer.flowing = false;
    write(stream, buffer);
  });
};
function write (stream, buffer) {
  if (buffer.paused) return;
  if (buffer.length === 0) {
    if (buffer.draining) {
      buffer.draining = false;
      stream.emit("drain");
    }
    if (buffer.closed) stream.emit("end");
    return;
  }
  var chunk = buffer.shift();
  stream.emit("data", chunk[0], chunk[1]);
  flow(stream, buffer);
};

Stream.prototype.__proto__ = Emitter.prototype;

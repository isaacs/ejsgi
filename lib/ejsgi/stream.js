
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
    if (!buffer.flowing) flow(this, buffer);
  };
  this.write = function (data) {
    if (buffer.closed) throw new Error("Cannot write after EOF.");
    buffer.push(data);
    if (!buffer.flowing && !buffer.paused) flow(this, buffer);
  };
  this.close = function () {
    buffer.closed = true;
  };
};

function flow (stream, buffer) {
  process.nextTick(function () {
    buffer.flowing = false;
    write(stream, buffer);
  });
};
function write (stream, buffer) {
  buffer.flowing = true;
  if (buffer.length === 0) {
    buffer.flowing = false;
    stream.emit("drain");
    if (buffer.closed) stream.emit("eof");
    return;
  }
  var chunk = buffer.shift();
  stream.emit("data", chunk);
  flow(stream, buffer);
};

Stream.prototype.__proto__ = Emitter.prototype;

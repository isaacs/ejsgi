
module.exports = Stream;

var Emitter = require("events").EventEmitter;

function Stream () {
  Emitter.call(this);
  
  var buffer = [];
  this.pause = function () {
    buffer.paused = true;
  };
  this.resume = function () {
    buffer.paused = false;
    flow(this, buffer);
  };
  this.write = function (data) {
    if (buffer.closed) throw new Error("Cannot write after EOF.");
    if (data === null) buffer.closed = true;
    if (data || data === null) buffer.push(data);
    flow(this, buffer);
  };
  this.close = function () {
    if (buffer.closed) return;
    return this.write(null);
  };
};

function flow (emitter, buffer) {
  if (buffer.flowing || buffer.paused) return;
  buffer.flowing = true;
  if (buffer.length === 0) {
    buffer.flowing = false;
    emitter.emit("drain");
    return;
  }
  var chunk = buffer.shift();
  emitter.emit("data", chunk);
  if (chunk === null) {
    emitter.emit("eof");
    return;
  }
  process.nextTick(function () {
    buffer.flowing = false;
    flow(emitter, buffer);
  });
};

Stream.prototype.__proto__ = Emitter.prototype;

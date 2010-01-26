
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

function flow (emitter, buffer) {
  buffer.flowing = true;
  if (buffer.length === 0) {
    buffer.flowing = false;
    emitter.emit("drain");
    if (buffer.closed) emitter.emit("eof");
    return;
  }
  var chunk = buffer.shift();
  emitter.emit("data", chunk);
  process.nextTick(function () {
    buffer.flowing = false;
    flow(emitter, buffer);
  });
};

Stream.prototype.__proto__ = Emitter.prototype;

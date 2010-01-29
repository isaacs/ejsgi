# JSGI Extension Proposal - Evented Streaming JSGI

## Status: Proposed

Extension name: `stream`  
Extension version: `0.1`

## Rationale

Simplify the input, error, and response body objects to a single non-blocking data stream class.

Support reading the input request and writing the response body without ever having to hold the entire body in memory.

## Changes from JSGI 0.3

### Specification Changes

* add `url` member to the request object, which is the requested URL exactly as it appears on the first line of the HTTP request.
* `request.input` MUST be a Stream object.
* `response.body` MUST be a Stream object.
* `request.jsgi.error` MUST be a Stream object.
* `request.jsgi.stream` MUST be a reference to the Stream implementation.

### Stream Objects

Stream Objects are representations of a stream of data in an asynchronous evented paradigm.

#### Methods

Stream Objects have the following methods:

* **write** - Send data down the stream.  If the stream is closed, then throw an Error.  This is asynchronous, and must not actually perform the write until after the current scope of execution is completed.  However, the order of written data MUST be consistent with the order in which `write` is called.
* **close** - Close the stream.  Once closed, no more data may be written to the Stream.
* **pause** - Temporarily prevent the firing of `data` events.  This is useful when a reader needs to throttle a stream of incoming data.
* **resume** - Resume a paused thread, so that `data` events will begin firing again.
* **addListener** - Attach an event handler to an event.  The first argument is the event name, and the second is the callback.

#### Events

Stream Objects emit the following events

* **data** - All the data that is passed through `write` eventually triggers a `data` event.  The argument is the data that was written.
* **eof** - Emitted when all data has been written, and the stream is closed.
* **drain** - Emitted when all data has been written, and the internal buffer is empty.
* **pause** - Emitted when the stream is paused with the `pause` method.
* **resume** - Emitted when the stream is resumed with the `resume` method.

#### Timing

Stream objects MUST implement some sort of "event queue" in order to defer callbacks until after the current execution context has exited.  Specifically, the `data`, `eof`, and `drain` events MUST NOT be fired immediately after the corresponding calls to `write()`, `close()`, and `resume()`.

#### Read/Write

All streams SHOULD be both readable and writeable.  This allows for middleware to step into the flow and filter the input or output to/from an app.


# EJSGI - Evented JavaScript Gateway Interface

Like [JSGI](http://wiki.commonjs.org/wiki/JSGI), but using streams for the request bodies.

## Application

An EJSGI Application is a JavaScript Function which takes exactly one argument, the Request as a JavaScript Object, and returns its Response as a JavaScript Object with data relevant to the HTTP response.

## Middleware

EJSGI Middleware are EJSGI applications that can call other EJSGI applications.  Middleware can be stacked up into a call chain to provide useful services to Requests and Responses.

## Server 

An EJSGI Server is the glue that connects EJSGI Applications to HTTP request and response messages.

The reference implementation is built on [nodejs](http://nodejs.org/).

## Stream Objects

Stream Objects are representations of a stream of data in an asynchronous evented paradigm.

### Methods

Stream Objects have the following methods:

* **write** - Send data down the stream.  If the stream is closed, then throw an Error.  This is asynchronous, and must not actually perform the write until after the current scope of execution is completed.  However, the order of written data MUST be consistent with the order in which `write` is called.
* **close** - Close the stream.  Once closed, no more data may be written to the Stream.
* **pause** - Temporarily prevent the firing of `data` events.  This is useful when a reader needs to throttle a stream of incoming data.
* **resume** - Resume a paused thread, so that `data` events will begin firing again.

Methods inherited from EventEmitter:

* **addListener** - Attach an event handler to an event.  The first argument is the event name, and the second is the callback.
* **emit** - Emit an event.  The first argument is the event name, and the remaining arguments are passed to the callbacks.  Callbacks are applied to the EventEmitter as the `this` context object.

### Events

Stream Objects emit the following events

* **data** - All the data that is passed through `write` eventually triggers a `data` event.  The argument is the data that was written.
* **eof** - Emitted when all data has been written, and the stream is closed.
* **drain** - Emitted when all data has been written, and the internal buffer is empty.
* **pause** - Emitted when the stream is paused with the `pause` method.
* **resume** - Emitted when the stream is resumed with the `resume` method.

## Request

The request environment MUST be a Stream Object representative of an HTTP request. Applications are free to modify the Request.

### Required Keys

The Request is required to have these keys:

*  **method** - The HTTP request method, such as "GET" or "POST". Request's method cannot be undefined and so MUST be present with a value of an UPPERCASE string.
* **url** - The URL on the first line of the request. This MUST be exactly the requested URL as it appears on the first line of the HTTP request, without any modifications or corrections.  (Note that it generally will not contain the hostname.)
* **scriptName** - The initial portion of the request URL's "path" that corresponds to the Application object, so that the Application knows its virtual "location". This MAY be an empty string, if the Application corresponds to the "root" of the Server. Restriction: if non-empty `scriptName` MUST start with "/", MUST NOT end with "/" and MUST NOT be decoded.
* **pathInfo** - The remainder of the request URL's "path", designating the virtual "location" of the Request's target within the Application. This may be an empty string, if the request URL targets the Application root and does not have a trailing slash. Restriction: if non-empty `pathInfo` MUST start with "/" and MUST NOT be decoded.
* **queryString** - The portion of the request URL that follows the first "?", if any. Restriction: MAY be an empty string but `queryString` key MUST NOT be undefined.
* **host** - The portion of the request URL that follows the `scheme`. Restriction: MUST be non-empty String, MUST NOT contain a colon or slash. Note: when combined with `scheme`, `port`, `scriptName`, `pathInfo`, and `queryString` this variable can be used to complete the URL.  If not found in the request line, then the `HOST` header, can be used.  If not found in the `HOST` header.
* **port** - Representative of the Request port. If `host` is followed by a colon this is all digits following this colon. If not present in the request URL `port` can be derived from the `scheme`. Restriction: MUST NOT be undefined and MUST be an integer.
* **scheme** - URL scheme (per RFC 1738). "http", "https", etc.
* **headers** - Variables corresponding to the client-supplied HTTP request headers are stored in the `headers` object. The presence or absence of these variables should correspond with the presence or absence of the appropriate HTTP header in the request. All keys in the `headers` object MUST be the lower-case equivalent of the request's HTTP header keys. See: example requests for more details. 
* **env** - The top level of the Request object SHOULD only consist of the keys specified above. Servers and Middleware MAY add additional information the `env` key. Servers are encouraged to add any additional relevant data relating to the Request in a key in the `env` object. Requirements: MUST be an object.
* **body** - The input Stream. Requirements: MUST be a Stream Object.

### Optional Keys

The Request MAY contain contain these keys: 

* **authType** - Corresponds to the CGI key AUTH_TYPE
* **pathTranslated** - Corresponds to the CGI key PATH_TRANSLATED
* **remoteAddr** - Corresponds to the CGI key REMOTE_ADDR
* **remoteHost** - Corresponds to the CGI key REMOTE_HOST
* **remoteIdent** - Corresponds to the CGI key REMOTE_IDENT
* **remoteUser** - Corresponds to the CGI key REMOTE_USER
* **serverSoftware** - Corresponds to the CGI key SERVER_SOFTWARE

### Events

The Request body object is required to emit the following events at the appropriate time, in this order:

* **data** - Fired as each chunk of the body is uploaded.
  Argument: the data that has been uploaded in this chunk
* **eof** - Fired when the entire body has been uploaded, and the request is completed.
  Argument: none.

The app may call the following methods on the request body:

* **pause** - Pause the incoming stream of data.
* **resume** - Resume the incoming stream.

## Response

Applications MUST return a JavaScript object.

### Required Keys

The Response is required to have these fields:

* **status** -  The status MUST be a three-digit integer ([RFC 2616 Section 6.1.1](http://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html#sec6.1.1))
* **headers** - MUST be a JavaScript object containing key/value pairs of Strings or Arrays. Servers SHOULD output multiple headers for `header` values supplied as Arrays. All keys MUST be lower-case. The `headers` object MUST NOT contain a `status` key and MUST NOT contain key names that end in `-` or `_`. It MUST contain keys that consist of letters, digits, `_` or `-` and start with a letter. Header values MUST NOT contain characters below 037.  Additionally:
  * **content-type** - There MUST be a `content-type` header key, except when the Status is 1xx, 204 or 3xx, in which case `content-type MUST NOT be present.
  * **content-length** - There MUST NOT be `content-length` header key when the Status is 1xx, 204 or 3xx.
* **body** - A Stream representing the response body.

The application should call the following methods on the response body stream:

* **write** - To send data to the client, call the `write` method, passing the data as an argument. This is optional; in cases where a response body is not appropriate, don't do it.
* **close** - To complete the request, `close` the output stream.  This signals the end of the connection.  This event is optional; in cases where it is not appropriate to terminate the connection (such as long-polling comet connections), do not call it.

# TODO

* Figure out how to indicate the correct http/https scheme in nodejs.
* Body encoding needs to be sorted out.  Right now, it's just sending everything binary, and that's not ideal for UTF-8 text.
* Use a vendor/submodule pattern for the stream lib.
* Add all the .jsgi stuff.
* Figure out how to merge this into JSGI proper.
* Port Jack's middleware.

# Changes

 * `0.0.3` - More JSGI compliance.  At this point, it's ready to be written up as an extension.
 * `0.0.2` - Updated to use Streams instead of direct Emitters. (Makes the name make less sense, but the code make more sense.)
 * `0.0.1` - Initial pass.
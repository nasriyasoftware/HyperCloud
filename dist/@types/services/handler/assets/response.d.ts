/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import HyperCloudRequest from './request';
import HyperCloudServer from '../../../server';
import Cookies from './cookies';
import http2 from 'http2';
import stream from 'stream';
import net from 'net';
import tls from 'tls';
import { NotFoundResponseOptions, RenderingOptions, ForbiddenAndUnauthorizedOptions, ServerErrorOptions, RedirectCode, DownloadFileOptions, SendFileOptions, MimeType } from '../../../docs/docs';
interface ResponseEndOptions {
    data?: string | Uint8Array;
    encoding?: BufferEncoding;
    callback?: () => void;
}
interface WriteOptions {
    chunk: string | Uint8Array;
    encoding?: BufferEncoding;
    callback?: (err: Error) => void;
}
type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'utf-16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';
type EventType = 'pipe' | 'unpipe' | 'close' | 'drain' | 'finish' | 'error';
interface EventConfig {
    event: EventType;
    listener: EventCallback;
}
type EventCallback = (...args: any[]) => void;
/**
 * TODO: Change all the server examples to use my own server class
 */
/**This class is used internallly, not by the user */
declare class HyperCloudResponse {
    #private;
    constructor(server: HyperCloudServer, req: HyperCloudRequest, res: http2.Http2ServerResponse);
    get pages(): Readonly<{
        /**
         * Return a not found `404` response.
         *
         * By default, **HyperCloud** returns its own `404` page. To return your
         * own page use the {@link HyperCloudServer.setHandler} method.
         * @example
         * // Use the default 404 page
         * response.pages.notFound({
         *      lang: 'en',
         *      title: '404 - Not Found',
         *      subtitle: 'This page cannot be found',
         *      home: 'Home'
         * });
         *
         * // All options are "optional" and can be omitted
         * response.pages.notFound(); // Renders the default 404 page
         * @example
         * // Setting your own handler
         * server.setHandler('notFound', (request, response, next) => {
         *      // Decide what to do here
         * })
         * @param {NotFoundResponseOptions} [options] Rendering options
         */
        notFound: (options?: NotFoundResponseOptions) => HyperCloudResponse | undefined;
        /**
         * Return an unauthorized `401` response.
         *
         * By default, **HyperCloud** returns its own `401` page. To return your
         * own page use the {@link HyperCloudServer.setHandler} method.
         * @example
         * // Use the default 401 page
         * response.pages.unauthorized({
         *      lang: 'en',
         *      title: '401 - Unauthorized',
         *      commands: {*
         *          code: 'ERROR CODE',
         *          description: 'ERROR DESCRIPTION',
         *          cause: 'ERROR POSSIBLY CAUSED BY',
         *          allowed: 'SOME PAGES ON THIS SERVER THAT YOU DO HAVE PERMISSION TO ACCESS',
         *          regards: 'HAVE A NICE DAY :-)'
         *        },
         *        content: {
         *          code: 'HTTP 401 Unauthorized',
         *          description: 'Access Denied. You Do Not Have The Permission To Access This Page',
         *          cause: 'execute access unauthorized, read access unauthorized, write access unauthorized',
         *          allowed: [{ label: 'Home', link: '/' }, { label: 'About Us', link: '/about' }, { label: 'Contact Us', link: '/support/contact' }],
         *        }
         * });
         *
         * // All options are "optional" and can be omitted
         * response.pages.unauthorized(); // Renders the default 401 page
         * @example
         * // Setting your own handler
         * server.setHandler('unauthorized', (request, response, next) => {
         *      // Decide what to do here
         * })
         * @param {ForbiddenAndUnauthorizedOptions} [options]
         */
        unauthorized: (options?: ForbiddenAndUnauthorizedOptions) => HyperCloudResponse | undefined;
        /**
         * Return a forbidden `403` response.
         *
         * By default, **HyperCloud** returns its own `403` page. To return your
         * own page use the {@link HyperCloudServer.setHandler} method.
         * @example
         * // Use the default 403 page
         * response.pages.forbidden({
         *      lang: 'en',
         *      title: '403 - Forbidden',
         *      commands: {*
         *          code: 'ERROR CODE',
         *          description: 'ERROR DESCRIPTION',
         *          cause: 'ERROR POSSIBLY CAUSED BY',
         *          allowed: 'SOME PAGES ON THIS SERVER THAT YOU DO HAVE PERMISSION TO ACCESS',
         *          regards: 'HAVE A NICE DAY :-)'
         *        },
         *        content: {
         *          code: 'HTTP 403 Forbidden',
         *          description: 'Access Denied. You Do Not Have The Permission To Access This Page',
         *          cause: 'execute access forbidden, read access forbidden, write access forbidden',
         *          allowed: [{ label: 'Home', link: '/' }, { label: 'About Us', link: '/about' }, { label: 'Contact Us', link: '/support/contact' }],
         *        }
         * });
         *
         * // All options are "optional" and can be omitted
         * response.pages.forbidden(); // Renders the default 403 page
         * @example
         * // Setting your own handler
         * server.setHandler('forbidden', (request, response, next) => {
         *      // Decide what to do here
         * })
         * @param {ForbiddenAndUnauthorizedOptions} options
         */
        forbidden: (options: ForbiddenAndUnauthorizedOptions) => HyperCloudResponse | undefined;
        /**
         * Return a server error `500` response.
         *
         * By default, **HyperCloud** returns its own `500` page. To return your
         * own page use the {@link HyperCloudServer.setHandler} method.
         * @example
         * // Use the default 500 page
         * response.pages.serverError({
         *      lang: 'en',
         *      title: '500 - Server Error',
         *      subtitle: 'Internal <code>Server error<span>!</span></code>',
         *      message: '<p> We\'re sorry, but something went wrong on our end. </p>'
         * });
         *
         * // All options are "optional" and can be omitted
         * response.pages.serverError(); // Renders the default 500 page
         * @example
         * // Setting your own handler
         * server.setHandler('serverError', (request, response, next) => {
         *      // Decide what to do here
         * })
         * @param {ServerErrorOptions} options
         */
        serverError: (options: ServerErrorOptions) => HyperCloudResponse | undefined;
    }>;
    /**
     * Redirect the client to a new location
     * @param {string} url A relative or full path URL.
     * @param {RedirectCode} [code] A redirect code. Default `307`. Learn more about [redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections).
     */
    redirect(url: string, code?: RedirectCode): this;
    /**
     * Render an `ejs` template with the provided options.
     * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the
     * @param {RenderingOptions} options
     * @returns {HyperCloudResponse}
     */
    render(name: string, options: RenderingOptions): HyperCloudResponse;
    /**
     * Download a file using the `response.sendFile` method.
     * @param {string} filePath The file path (relative/absolute). When providing a relative path, you must specify the `root` in the `options` argument
     * @param {DownloadFileOptions} options Options for sending the file
     * @returns {http2.Http2ServerResponse|undefined}
     */
    downloadFile(filePath: string, options: DownloadFileOptions): http2.Http2ServerResponse | undefined;
    /**
     * Send a file back to the client
     * @param {string} filePath The file path (relative/absolute). When providing a relative path, you must specify the `root` in the `options` argument
     * @param {SendFileOptions} [options] Options for sending the file
     * @returns {http2.Http2ServerResponse|undefined}
     */
    sendFile(filePath: string, options: SendFileOptions): http2.Http2ServerResponse | undefined;
    /**
     * Send a response.
     *
     * Examples:
     * @example
     * // Send buffer
     * response.send(Buffer.from('wahoo'));
     * // Send JSON
     * response.send({ some: 'json' });
     * //Send HTML content
     * response.send('<p>some html</p>');
     * // Sending plain text
     * response.status(404).send('Sorry, cant find that');
     * // Sending a file
     * const fs = require('fs');
     * response.status(200).send(fs.readFileSync('./style.css', { encoding: 'utf8' }), 'text/css');
     * @param {string|object|Buffer} data The data to be sent
     * @param {MimeType} [contentType] Specify  the type of content
     */
    send(data: string | object | Buffer, contentType: MimeType): this;
    /**
     * Send JSON response.
     * *Examples:*
     * @example
     * response.json(null);
     * response.json({ user: 'tj' });
     * response.status(500).json('oh noes!');
     * response.status(404).json('I dont have that');
     * @param {object|Array} data
     */
    json(data: object | Array<any>): this;
    /**
     * When using implicit headers (not calling `response.writeHead()` explicitly),
     * this method controls the status code that will be sent to the client when
     * the headers get flushed.
     *
     * ```js
     * response.status(404);
     * ```
     * @param {number} statusCode The status code of the request
     * @returns {this}
     */
    status(statusCode: number): this;
    /**
     * Add an event handler
     * @param {EventConfig} config
     */
    addListener(config: EventConfig): this;
    /**
     * Returns a copy of the array of listeners for the event named eventName.
     *
     * ```js
     * server.on('connection', (stream) => {
     *      console.log('someone connected!');
     * });
     *
     * console.log(util.inspect(server.listeners('connection')));
     * // Prints: [ [Function] ]
     * ```
     * @param {string|symbol} eventName The event name
     */
    listeners(eventName: string | symbol): Function[];
    /**
     * This method adds HTTP trailing headers (a header but at the end of the message) to the response.
     *
     * Attempting to set a header field name or value that contains invalid characters will result in a ```TypeError``` being thrown.
     * @param {http2.OutgoingHttpHeaders} trailers
     */
    addTrailers(trailers: http2.OutgoingHttpHeaders): void;
    /**
     * This method signals to the server that all of
     * the response headers and body have been sent;
     * that server should consider this message complete.
     * The method, ```response.end()```, MUST be called on each response.
     *
     * If data is specified, it is equivalent to calling
     * ```response.write(data, encoding)``` followed by ```response.end(callback)```.
     *
     * If ```callback``` is specified, it will be called when the response stream is finished.
     * @param {ResponseEndOptions} [options] End stream options
     * @returns {this}
     */
    end(options?: ResponseEndOptions): this;
    /**
     * Reads out a header that has already been queued but not sent to the client. The name is case-insensitive.
     *
     * ```js
     * const contentType = response.getHeader('content-type');
     * ```
     * @param {string} name The header name
     * @returns {string} The header value
     */
    getHeader(name: string): string;
    /**
     * Returns an array containing the unique names of the current outgoing headers. All header names are lowercase.
     *
     * ```js
     *  response.setHeader('Foo', 'bar');
     *  response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);
     *
     *  const headerNames = response.getHeaderNames();
     *  // headerNames === ['foo', 'set-cookie']
     * ```
     * @returns {string[]} The names of the provided headers
     */
    getHeaderNames(): string[];
    /**
     * Returns a shallow copy of the current outgoing headers.
     * Since a shallow copy is used, array values may be mutated
     * without additional calls to various header-related http
     * module methods. The keys of the returned object are the
     * header names and the values are the respective header values.
     * All header names are lowercase.
     *
     * The object returned by the ```response.getHeaders()``` method *does
     * not* prototypically inherit from the JavaScript ```Object```. This means
     * that typicalObject methods such as ```obj.toString()```, ```obj.hasOwnProperty()```,
     * and others are not defined and *will not work*.
     * @returns {http2.OutgoingHttpHeaders}
     */
    getHeaders(): http2.OutgoingHttpHeaders;
    /**
     * Returns ```true``` if the header identified by name is currently
     * set in the outgoing headers. The header ```name``` matching is case-insensitive.
     *
     * ```js
     * const hasContentType = response.hasHeader('content-type');
     * ```
     * @param {string} name The name of the header
     * @returns {boolean}
     */
    hasHeader(name: string): boolean;
    /**
     * Returns the number of listeners listening for the event named ```eventName```.
     * If ```listener``` is provided, it will return how many times the listener is
     * found in the list of the listeners of the event.
     * @param {string|symbol} eventName The name of the event being listened for
     * @param {function} [listener] The event handler function
     * @returns {number}
     */
    listenerCount(eventName: string | symbol, listener: Function): number;
    /**
     * Alias for ```emitter.removeListener()```.
     * @param {string|symbol} eventName he name of the event being listened for
     * @param {EventCallback} listener The event handler function
     * @returns {this}
     */
    off(eventName: string | symbol, listener: EventCallback): this;
    /**
     * Adds the ```listener``` function to the end of the listeners array
     * for the event named ```event```. No checks are made to see if
     * the ```listener``` has already been added. Multiple calls passing
     * the same combination of ```event``` and ```listener``` will result in
     * the ```listener``` being added, and called, multiple times.
     *
     * ```js
     * server.on({ event: 'connection', listener: (stream) => {
     *      console.log('someone connected!');
     * }});
     * ```
     *
     * Returns a reference to the ```EventEmitter```, so that calls can be chained.
     *
     * By default, event listeners are invoked in the order they are added.
     * The ```emitter.prependListener()``` method can be used as an alternative to
     * add the event listener to the beginning of the listeners array.
     *
     * ```js
     * import { EventEmitter } from 'node:events';
     * const myEE = new EventEmitter();
     * myEE.on('foo', () => console.log('a'));
     * myEE.prependListener('foo', () => console.log('b'));
     * myEE.emit('foo');
     * // Prints:
     * //   b
     * //   a
     * ```
     * @param {EventConfig} config
     * @returns {this}
     */
    on(config: EventConfig): this;
    /**
     * Adds a **one-time** ```listener``` function for the event named ```eventName```.
     * The next time ```eventName``` is triggered, this ```listener``` is removed and then invoked.
     *
     * ```js
     * server.once({event: 'connection', listener: (stream) => {
     *      console.log('Ah, we have our first user!');
     * }});
     * ```
     *
     * Returns a reference to the ```EventEmitter```, so that calls can be chained.
     * @param {EventConfig} config
     * @returns {this}
     */
    once(config: EventConfig): this;
    /**
     *
     * @param {stream.Writable} destination
     * @param {object} [options]
     * @param {boolean} [options.end]
     * @returns {stream.Writable}
     */
    pipe(destination: stream.Writable, options: {
        end?: boolean;
    }): stream.Writable;
    /**
     * Removes all listeners, or those of the specified ```eventName```.
     *
     * It is bad practice to remove listeners added elsewhere in the code,
     * particularly when the ```EventEmitter``` instance was created by some other
     * component or module (e.g. sockets or file streams).
     *
     * Returns a reference to the ```EventEmitter```, so that calls can be chained.
     * @param {EventType} [event] The event to remove all of its listeners, or nothing to remove all listeners from all events
     * @returns {this}
     */
    removeAllListeners(event: EventType): this;
    /**
     * Removes the specified ```listener``` from the listener array for the event named ```eventName```.
     *
     * ```js
     * const callback = (stream) => {
     *      console.log('someone connected!');
     * };
     * server.on('connection', callback);
     * // ...
     * server.removeListener('connection', callback);
     * ```
     *
     * ```removeListener()``` will remove, at most, one instance of a listener from
     * the listener array. If any single listener has been added multiple times to
     * the listener array for the specified ```eventName```, then ```removeListener()``` must be
     * called multiple times to remove each instance.
     *
     * Once an event is emitted, all listeners attached to it at the time of emitting
     * are called in order. This implies that any ```removeListener()``` or ```removeAllListeners()```
     * calls after emitting and before the last listener finishes execution will not
     * remove them from ```emit()``` in progress. Subsequent events behave as expected.
     *
     * ```js
     * import { EventEmitter } from 'node:events';
     * class MyEmitter extends EventEmitter {}
     * const myEmitter = new MyEmitter();

     * const callbackA = () => {
     *      console.log('A');
     *      myEmitter.removeListener('event', callbackB);
     * };
     *
     * const callbackB = () => {
     *      console.log('B');
     * };
     *
     * myEmitter.on('event', callbackA);
     * myEmitter.on('event', callbackB);
     *
     * // callbackA removes listener callbackB but it will still be called.
     * // Internal listener array at time of emit [callbackA, callbackB]
     * myEmitter.emit('event');
     * // Prints:
     * //   A
     * //   B
     *
     * // callbackB is now removed.
     * // Internal listener array [callbackA]
     * myEmitter.emit('event');
     * // Prints:
     * //   A
     * ```
     *
     * Because listeners are managed using an internal array, calling this will
     * change the position indices of any listener registered after the listener
     * being removed. This will not impact the order in which listeners are called,
     * but it means that any copies of the listener array as returned by the
     * ```emitter.listeners()``` method will need to be recreated.
     *
     * When a single function has been added as a handler multiple times for a single
     * event (as in the example below), ```removeListener()``` will remove the most
     * recently added instance. In the example the ```once('ping')``` listener is removed:
     *
     * ```js
     * import { EventEmitter } from 'node:events';
     * const ee = new EventEmitter();
     *
     * function pong() {
     *      console.log('pong');
     * }
     *
     * ee.on('ping', pong);
     * ee.once('ping', pong);
     * ee.removeListener('ping', pong);
     *
     * ee.emit('ping');
     * ee.emit('ping');
     * ```
     *
     * Returns a reference to the ```EventEmitter```, so that calls can be chained.
     * @param {EventConfig} config
     * @returns {this}
     */
    removeListener(config: EventConfig): this;
    /**
     * Removes a header that has been queued for implicit sending.
     *
     * ```js
     * response.removeHeader('Content-Encoding');
     * ```
     * @param {string} name The name of the header to be removed
     * @returns {void}
     */
    removeHeader(name: string): void;
    /**
     * The ```writable.setDefaultEncoding()``` method sets the default ```encoding``` for a ```Writable``` stream.
     * @param {BufferEncoding} encoding The new default encoding
     * @returns {this}
     */
    setDefaultEncoding(encoding: BufferEncoding): this;
    /**
     * Sets a single header value for implicit headers. If this
     * header already exists in the to-be-sent headers, its value
     * will be replaced. Use an array of strings here to send
     * multiple headers with the same name.
     *
     * ```js
     * response.setHeader('Content-Type', 'text/html; charset=utf-8');
     * ```
     * or
     * ```js
     * response.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
     * ```
     *
     * Attempting to set a header field name or value that contains invalid characters will result in a ```TypeError``` being thrown.
     *
     * When headers have been set with ```response.setHeader()```, they will
     * be merged with any headers passed to ```response.writeHead()```, with
     * the headers passed to ```response.writeHead()``` given precedence.
     *
     * ```js
     * const hypercloud = require('nasriya-hypercloud');
     * // Returns content-type = text/plain
     * const server = hypercloud.Server();
     *
     * server.on('request)
     *
     * ((req, res) => {
     *      res.setHeader('Content-Type', 'text/html; charset=utf-8');
     *      res.setHeader('X-Foo', 'bar');
     *      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
     *      res.end('ok');
     * });
     * ```
     * @param {string} name The header name
     * @param {string | number | readonly string[]} value The header value
     * @returns {this}
     */
    setHeader(name: string, value: string | number | readonly string[]): this;
    /**
     * By default `EventEmitter`s will print a warning if more than `10` listeners are
     * added for a particular event. This is a useful default that helps finding
     * memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
     * modified for this specific `EventEmitter` instance. The value can be set to`Infinity` (or `0`) to indicate an unlimited number of listeners.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     * @param {number} n The maximum number of listeners
     * @returns {this}
     */
    setMaxListeners(n: number): this;
    /**
     * Sets the `Http2Stream`'s timeout value to `msecs`. If a callback is
     * provided, then it is added as a listener on the `'timeout'` event on
     * the response object.
     *
     * If no `'timeout'` listener is added to the request, the response, or
     * the server, then `Http2Stream` s are destroyed when they time out. If a
     * handler is assigned to the request, the response, or the server's `'timeout'`events, timed out sockets must be handled explicitly.
     * @param {number} msecs The number of milliseconds
     * @param {() => {}} [callback] An optional callback function to run when the time is over.
     * @returns {void}
     */
    setTimeout(msecs: number, callback: () => {}): void;
    /**
     * The `writable.cork()` method forces all written data to be buffered in memory.
     * The buffered data will be flushed when either the {@link uncork} or {@link end} methods are called.
     *
     * The primary intent of `writable.cork()` is to accommodate a situation in which
     * several small chunks are written to the stream in rapid succession. Instead of
     * immediately forwarding them to the underlying destination, `writable.cork()`buffers all the chunks until `writable.uncork()` is called, which will pass them
     * all to `writable._writev()`, if present. This prevents a head-of-line blocking
     * situation where data is being buffered while waiting for the first small chunk
     * to be processed. However, use of `writable.cork()` without implementing`writable._writev()` may have an adverse effect on throughput.
     *
     * See also: `writable.uncork()`, `writable._writev()`.
     * @returns {void}
     */
    cork(): void;
    /**
     * The `writable.uncork()` method flushes all data buffered since {@link cork} was called.
     *
     * When using `writable.cork()` and `writable.uncork()` to manage the buffering
     * of writes to a stream, defer calls to `writable.uncork()` using`process.nextTick()`. Doing so allows batching of all`writable.write()` calls that occur within a given Node.js event
     * loop phase.
     *
     * ```js
     * stream.cork();
     * stream.write('some ');
     * stream.write('data ');
     * process.nextTick(() => stream.uncork());
     * ```
     *
     * If the `writable.cork()` method is called multiple times on a stream, the
     * same number of calls to `writable.uncork()` must be called to flush the buffered
     * data.
     *
     * ```js
     * stream.cork();
     * stream.write('some ');
     * stream.cork();
     * stream.write('data ');
     * process.nextTick(() => {
     *   stream.uncork();
     *   // The data will not be flushed until uncork() is called a second time.
     *   stream.uncork();
     * });
     * ```
     *
     * See also: `writable.cork()`.
     * @returns {void}
     */
    uncork(): void;
    /**
     * If this method is called and `response.writeHead()` has not been called,
     * it will switch to implicit header mode and flush the implicit headers.
     *
     * This sends a chunk of the response body. This method may
     * be called multiple times to provide successive parts of the body.
     *
     * In the `node:http` module, the response body is omitted when the
     * request is a HEAD request. Similarly, the `204` and `304` responses _must not_ include a message body.
     *
     * `chunk` can be a string or a buffer. If `chunk` is a string,
     * the second parameter specifies how to encode it into a byte stream.
     * By default the `encoding` is `'utf8'`. `callback` will be called when this chunk
     * of data is flushed.
     *
     * This is the raw HTTP body and has nothing to do with higher-level multi-part
     * body encodings that may be used.
     *
     * The first time `response.write()` is called, it will send the buffered
     * header information and the first chunk of the body to the client. The second
     * time `response.write()` is called, Node.js assumes data will be streamed,
     * and sends the new data separately. That is, the response is buffered up to the
     * first chunk of the body.
     *
     * Returns `true` if the entire data was flushed successfully to the kernel
     * buffer. Returns `false` if all or part of the data was queued in user memory.`'drain'` will be emitted when the buffer is free again.
     * @param {WriteOptions} options The `write` options
     * @returns {boolean}
     */
    write(options: WriteOptions): boolean;
    /**
     * Sends a status `100 Continue` to the client, indicating that
     * the request body should be sent. See the `'checkContinue'`
     * event on `Http2Server` and `Http2SecureServer`.
     * @returns {void}
     */
    writeContinue(): void;
    /**
     * Sends a status `103 Early` Hints to the client with a Link header,
     * indicating that the user agent can preload/preconnect the linked
     * resources. The `hints` is an object containing the values of
     * headers to be sent with early hints message.
     * @example
     * **Example**
     * ```js
     * const earlyHintsLink = '</styles.css>; rel=preload; as=style';
     * response.writeEarlyHints({
     *   'link': earlyHintsLink,
     * });
     *
     * const earlyHintsLinks = [
     *   '</styles.css>; rel=preload; as=style',
     *   '</scripts.js>; rel=preload; as=script',
     * ];
     * response.writeEarlyHints({
     *   'link': earlyHintsLinks,
     * });
     * ```
     * @param {Record<string, string | string[]>} hints
     * @returns {void}
     */
    writeEarlyHints(hints: Record<string, string | string[]>): void;
    /**
     * Sends a response header to the request. The status code is a 3-digit HTTP
     * status code, like `404`. The last argument, `headers`, are the response headers.
     *
     * Returns a reference to the `Http2ServerResponse`, so that calls can be chained.
     *
     * For compatibility with `HTTP/1`, a human-readable `statusMessage` may be
     * passed as the second argument. However, because the `statusMessage` has no
     * meaning within HTTP/2, the argument will have no effect and a process warning
     * will be emitted.
     *
     * ```js
     * const body = 'hello world';
     * response.writeHead(200, {
     *   'Content-Length': Buffer.byteLength(body),
     *   'Content-Type': 'text/plain; charset=utf-8',
     * });
     * ```
     *
     * `Content-Length` is given in bytes not characters. The`Buffer.byteLength()` API may be used to determine the number of bytes in a
     * given encoding. On outbound messages, Node.js does not check if Content-Length
     * and the length of the body being transmitted are equal or not. However, when
     * receiving messages, Node.js will automatically reject messages when the`Content-Length` does not match the actual payload size.
     *
     * This method may be called at most one time on a message before `response.end()` is called.
     *
     * If `response.write()` or `response.end()` are called before calling
     * this, the implicit/mutable headers will be calculated and call this function.
     *
     * When headers have been set with `response.setHeader()`, they will be merged
     * with any headers passed to `response.writeHead()`, with the headers passed
     * to `response.writeHead()` given precedence.
     *
     * ```js
     * // Returns content-type = text/plain
     * const server = http2.createServer((req, res) => {
     *   res.setHeader('Content-Type', 'text/html; charset=utf-8');
     *   res.setHeader('X-Foo', 'bar');
     *   res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
     *   res.end('ok');
     * });
     * ```
     *
     * Attempting to set a header field name or value that contains invalid characters
     * will result in a `TypeError` being thrown.
     * @param {number} statusCode The response status code. Example `200` for `ok`
     * @param {http2.OutgoingHttpHeaders} [headers] The headers you want to send;
     * @returns {this}
     */
    writeHead(statusCode: number, headers: http2.OutgoingHttpHeaders): this;
    /**
     * True if headers were sent, false otherwise (read-only).
     * @returns {boolean}
     */
    get headersSent(): boolean;
    /**
     * A reference to the original HyperCloud server object.
     * @returns {HyperCloudServer}
     */
    get server(): HyperCloudServer;
    /**
     * A reference to the original HyperCloud request object.
     * @returns {HyperCloudRequest}
     */
    get req(): HyperCloudRequest;
    /**
     * Returns a `Proxy` object that acts as a `net.Socket` (or `tls.TLSSocket`) but
     * applies getters, setters, and methods based on HTTP/2 logic.
     *
     * `destroyed`, `readable`, and `writable` properties will be retrieved from and
     * set on `response.stream`.
     *
     * `destroy`, `emit`, `end`, `on` and `once` methods will be called on`response.stream`.
     *
     * `setTimeout` method will be called on `response.stream.session`.
     *
     * `pause`, `read`, `resume`, and `write` will throw an error with code`ERR_HTTP2_NO_SOCKET_MANIPULATION`. See `Http2Session and Sockets` for
     * more information.
     *
     * All other interactions will be routed directly to the socket.
     *
     * ```js
     * const http2 = require('node:http2');
     * const server = http2.createServer((req, res) => {
     *      const ip = req.socket.remoteAddress;
     *      const port = req.socket.remotePort;
     *      res.end(`Your IP address is ${ip} and your source port is ${port}.`);
     * }).listen(3000);
     * ```
     * @returns {net.Socket|tls.TLSSocket}
     */
    get socket(): net.Socket | tls.TLSSocket;
    /**
     * The Http2Stream object backing the response.
     * @returns {http2.Http2Stream}
     */
    get stream(): http2.Http2Stream;
    /**
     * Is ```true``` if it is safe to call ```writable.write()```, which means the stream has not been destroyed, errored, or ended.
     * @returns {boolean}
     */
    get writable(): boolean;
    /**
     * Number of times ```writable.uncork()``` needs to be called in order to fully uncork the stream.
     * @returns {number}
     */
    get writableCorked(): number;
    /**
     * Is `true` after `writable.end()` has been called. This property
     * does not indicate whether the data has been flushed, for this
     * use `writable.writableFinished` instead.
     * @returns {boolean}
     */
    get writableEnded(): boolean;
    /**
     * Is set to `true` immediately before the `'finish'` event is emitted.
     * @returns {boolean}
     */
    get writableFinished(): boolean;
    /**
     * Return the value of `highWaterMark` passed when creating this `Writable`.
     * @returns {number}
     */
    get writableHighWaterMark(): number;
    /**
     * This property contains the number of bytes (or objects)
     * in the queue ready to be written. The value provides
     * introspection data regarding the status of the `highWaterMark`.
     * @returns {number}
     */
    get writableLength(): number;
    /**
     * Is `true` if the stream's buffer has been full and stream will emit `'drain'`.
     * @returns {boolean}
     */
    get writableNeedDrain(): boolean;
    /**
     * Getter for the property `objectMode` of a given `Writable` stream.
     * @returns {boolean}
     */
    get writableObjectMode(): boolean;
    /**
     * When using implicit headers (not calling `response.writeHead()` explicitly),
     * this property controls the status code that will be sent to the client when
     * the headers get flushed.
     *
     * ```js
     * response.statusCode = 404;
     * ```
     *
     * After response header was sent to the client, this property indicates the
     * status code which was sent out.
     * @param {number} status The status code of the request
     */
    set statusCode(status: number);
    /**
     * Status message is not supported by HTTP/2 (RFC 7540 8.1.2.4). It returns an empty string.
     *
     * Setting this property will throw an `Error`.
     * @param {string} message The status message
     * @deprecated @since RFC 7540 8.1.2.4
     */
    set statusMessage(message: string);
    /**
     * A module that allows you to create or get a list of cookies
     */
    get cookies(): Cookies;
    /**Check whether the `response` has been closed or not */
    get closed(): boolean;
    /**
     * Change the response's `closed` value
     * @param {true} value
     */
    set _closed(value: true);
}
export default HyperCloudResponse;

const Docs = require('../../../utils/docs');
const helpers = require('../../../utils/helpers');

class Route {
    #caseSensitive = false
    /**@type {'*'|string} */
    #subDomain = '*';
    /**@type {'USE'|Docs.HttpMethod} */
    #method = 'USE';
    /**@type {string[]} */
    #path = [];
    /**@type {Docs.HyperCloudRequestHandler} */
    #handler;
    #params = {}    

    /**
     * @param {Docs.RouteOptions} options 
     */
    constructor(options) {
        this.#method = options.method;

        this.#helpers.initialize.path(options);
        this.#helpers.initialize.handler(options)
        this.#helpers.initialize.subDomain(options);
        this.#helpers.initialize.caseSensitive(options);       
    }

    #helpers = Object.freeze({
        initialize: {
            handler: (options) => {
                if ('handler' in options) {
                    if (typeof options.handler !== 'function') { throw new TypeError(`The rout's handler only accepts a callback function, instead got ${typeof options.handler}`) }
                    this.#handler = options.handler;
                }
            },
            path: (options) => {
                if ('path' in options) {
                    if (typeof options.path !== 'string') { throw new TypeError(`The route's path only accepts a string value, but instead got ${typeof options.path}`) }
                    if (options.path.length === 0) { throw new SyntaxError(`The rout's path cannot be an empty string`) }
                    this.#path = options.path.split('/').filter(i => i.length > 0);
                }
            },
            /**@param {Docs.RouteOptions} options */
            subDomain: (options) => {
                if ('subDomain' in options) {
                    if (typeof options.subDomain !== 'string') { throw new TypeError(`The route's subDomain option is expecting a string value, but instead got ${typeof options.subDomain}`) }
                    this.#subDomain = options.subDomain;
                }
            },
            /**@param {Docs.RouteOptions} options */
            caseSensitive: (options) => {
                if ('caseSensitive' in options) {
                    if (typeof options.caseSensitive !== 'boolean') { throw new TypeError(`The Route's caseSensitive option is expecting a boolean value, but instead got ${typeof options.caseSensitive}`) }
                    this.#caseSensitive = options.caseSensitive;
                }
            }
        }
    })

    /**@returns {'*'|string} */
    get subDomain() { return this.#subDomain }
    get caseSensitive() { return this.#caseSensitive }
    get method() { return this.#method }
    get path() { return this.#path }
    get handler() { return this.#handler }

    get params() { return this.#params }
    set params(value) {
        if (helpers.isRealObject(value)) {
            this.#params = value;
        } else {
            throw `The route.params has been set with an invalid value. Expected an object but got ${typeof value}`
        }
    }
}

module.exports = Route
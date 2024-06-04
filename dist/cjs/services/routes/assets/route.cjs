"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../../../utils/helpers"));
class Route {
    #_caseSensitive = false;
    #_subDomain = '*';
    #_method = 'USE';
    #_path = [];
    #_handler = () => { };
    #_params = {};
    #_utils = Object.freeze({
        initialize: {
            handler: (options) => {
                if ('handler' in options) {
                    if (typeof options.handler !== 'function') {
                        throw new TypeError(`The rout's handler only accepts a callback function, instead got ${typeof options.handler}`);
                    }
                    this.#_handler = options.handler;
                }
            },
            path: (options) => {
                if ('path' in options) {
                    if (typeof options.path !== 'string') {
                        throw new TypeError(`The route's path only accepts a string value, but instead got ${typeof options.path}`);
                    }
                    if (options.path.length === 0) {
                        throw new SyntaxError(`The rout's path cannot be an empty string`);
                    }
                    this.#_path = options.path.split('/').filter(i => i.length > 0);
                }
            },
            /**@param {RouteOptions} options */
            subDomain: (options) => {
                if ('subDomain' in options) {
                    if (typeof options.subDomain !== 'string') {
                        throw new TypeError(`The route's subDomain option is expecting a string value, but instead got ${typeof options.subDomain}`);
                    }
                    this.#_subDomain = options.subDomain;
                }
            },
            /**@param {RouteOptions} options */
            caseSensitive: (options) => {
                if ('caseSensitive' in options) {
                    if (typeof options.caseSensitive !== 'boolean') {
                        throw new TypeError(`The Route's caseSensitive option is expecting a boolean value, but instead got ${typeof options.caseSensitive}`);
                    }
                    this.#_caseSensitive = options.caseSensitive;
                }
            }
        }
    });
    constructor(options) {
        this.#_method = options.method;
        this.#_utils.initialize.path(options);
        this.#_utils.initialize.handler(options);
        this.#_utils.initialize.subDomain(options);
        this.#_utils.initialize.caseSensitive(options);
    }
    get subDomain() { return this.#_subDomain; }
    get caseSensitive() { return this.#_caseSensitive; }
    get method() { return this.#_method; }
    get path() { return this.#_path; }
    get handler() { return this.#_handler; }
    get params() { return this.#_params; }
    set params(value) {
        if (helpers_1.default.is.realObject(value)) {
            this.#_params = value;
        }
        else {
            throw `The route.params has been set with an invalid value. Expected an object but got ${typeof value}`;
        }
    }
}
exports.default = Route;

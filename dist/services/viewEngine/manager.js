"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../../utils/helpers"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * This class is used inside a {@link HyperCloudServer} as
 * `{@link HyperCloudServer.rendering}`
 */
class RenderingManager {
    #_server;
    #_constants = Object.freeze({
        viewEngines: ['nhc', 'ejs']
    });
    #_viewEngine = 'ejs';
    #_views = {};
    constructor(server) {
        this.#_server = server;
    }
    /**
     * Register a directory as views folder
     * @param {string} directory
     */
    #_registerTemplates(directory) {
        try {
            const files = fs_1.default.readdirSync(directory);
            files.forEach(file => {
                const parsed = path_1.default.parse(file);
                if (parsed.ext === `.${this.#_viewEngine}`) {
                    const filePath = path_1.default.join(directory, file);
                    const viewName = parsed.name;
                    const template = fs_1.default.readFileSync(filePath, 'utf8');
                    this.views[viewName] = template;
                }
            });
        }
        catch (error) {
            helpers_1.default.printConsole(error);
            throw `Unable to register template: ${directory}`;
        }
    }
    /**
     * Add `views` folder(s) to the server
     * @param {string|string[]} paths A path to a views directory or an array of views' paths.
     */
    addViews(paths) {
        if (!(Array.isArray(path_1.default) || typeof paths === 'string')) {
            throw new TypeError(`The server.renderer.addViews method accepts a string or an array of of valid views folders, but instead got ${typeof paths}`);
        }
        const errors = [];
        // If the argument is a single path, put it inside an array
        if (typeof paths === 'string') {
            paths = [paths];
        }
        // Validating input
        for (const viewsPath of paths) {
            const validity = helpers_1.default.checkPathAccessibility(viewsPath);
            if (validity.valid) {
                this.#_registerTemplates(viewsPath);
                continue;
            }
            const error = { path: viewsPath, type: 'invalid_path', errors: [] };
            if (validity.errors.isString !== true) {
                error.errors.push('Not a string');
            }
            if (validity.errors.exist !== true) {
                error.errors.push('Path doesn\'t exist');
            }
            if (validity.errors.accessible !== true) {
                error.errors.push('access denied: no read permissions');
            }
            errors.push(error);
        }
        if (errors.length > 0) {
            throw errors;
        }
    }
    /**
     * Get an object of the registered templates
     * @returns {Record<string, string>}
     */
    get views() { return this.#_views; }
    /**
     * Get or set the view engine of the server
     * @returns {ViewEngine}
     */
    get viewEngine() { return this.#_viewEngine; }
    /**@param {ViewEngine} engine The view engine you want to choose */
    set viewEngine(engine) {
        if (this.#_constants.viewEngines.includes(engine)) {
            this.#_viewEngine = engine;
        }
        else {
            throw new RangeError(`${engine} is not a supportd view engine. You can only use ${this.#_constants.viewEngines.join(', ')}`);
        }
    }
}
exports.default = RenderingManager;

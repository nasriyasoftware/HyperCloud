const helpers = require('../../utils/helpers');
const Docs = require('../../utils/docs');

const path = require('path');
const fs = require('fs');
const HyperCloudServer = require('../../server')

/**
 * This class is used inside a {@link HyperCloudServer} as
 * `{@link HyperCloudServer.rendering}`
 */
class RenderingManager {
    /**@type {HyperCloudServer} */
    #server;
    #_constants = Object.freeze({
        viewEngines: ['nhc', 'ejs']
    })

    /**@type {Docs.ViewEngine} */
    #viewEngine;
    #views = {}

    /**@param {HyperCloudServer} server */
    constructor(server) {
        this.#server = server;
    }

    /**
     * Register a directory as views folder
     * @param {string} directory 
     */
    #registerTemplates(directory) {
        try {
            const files = fs.readdirSync(directory);
            files.forEach(file => {
                const parsed = path.parse(file);
                if (parsed.ext === `.${this.#viewEngine}`) {
                    const filePath = path.join(directory, file);
                    const viewName = parsed.name;
                    const template = fs.readFileSync(filePath, 'utf8');
                    this.views[viewName] = template;
                }
            });
        } catch (error) {
            helpers.printConsole(error);
            throw `Unable to register template: ${directory}`;
        }
    }

    /**
     * Add `views` folder(s) to the server
     * @param {string|string[]} paths A path to a views directory or an array of views' paths.
     */
    addViews(paths) {
        if (!(Array.isArray(path) || typeof paths === 'string')) { throw new TypeError(`The server.renderer.addViews method accepts a string or an array of of valid views folders, but instead got ${typeof paths}`) }
        const errors = [];

        // If the argument is a single path, put it inside an array
        if (typeof paths === 'string') { paths = [paths] }

        // Validating input
        for (const viewsPath of paths) {
            const validity = helpers.checkPathAccessibility(viewsPath);
            if (validity.valid) {
                this.#registerTemplates(viewsPath);
                continue;
            }

            const error = { path: viewsPath, type: 'invalid_path', errors: [] }
            if (validity.errors.isString) { error.errors.push('Not a string') }
            if (validity.errors.exist) { error.errors.push('Path doesn\'t exist') }
            if (validity.errors.accessible) { error.errors.push('access denied: no read permissions') }
            errors.push(error);
        }

        if (errors.length > 0) { throw errors }
    }

    /**
     * Get an object of the registered templates
     * @returns {Object}
     */
    get views() { return this.#views }

    /**
     * Get or set the view engine of the server
     * @returns {Docs.ViewEngine}
     */
    get viewEngine() { return this.#viewEngine }
    /**@param {Docs.ViewEngine} engine The view engine you want to choose */
    set viewEngine(engine) {
        if (this.#_constants.viewEngines.includes(engine)) {
            this.#viewEngine = engine;
        } else {
            throw new RangeError(`${engine} is not a supportd view engine. You can only use ${this.#_constants.viewEngines.join(', ')}`)
        }
    }
}

module.exports = RenderingManager;
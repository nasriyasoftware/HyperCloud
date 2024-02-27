const HyperCloudResponse = require('../handler/assets/response');
const helpers = require('../../utils/helpers');

class Renderer {
    /**@type {HyperCloudResponse} */
    #response;

    #data = {
        locals: {},
        /**@type {string} */
        filePath: null
    }

    /**@param {HyperCloudResponse} res */
    constructor(res) {
        this.#response = res;
    }

    set locals(value) {
        if (helpers.isRealObject(value)) {
            this.#data.locals = value;
        } else {
            throw new TypeError(`The ViewEngine.locals expected an object of key:value pairs but instead got ${typeof value}`)
        }
    }

    get locals() { return this.#data.locals }
    get viewEngine() { return this.#response.server.rendering.viewEngine }

    /**
     * 
     * @param {string} fileName The view name in the views object
     * @param {object} locals A `key:value` pairs object for variables
     * @returns {string} The rendered `HTML` page
     */
    render(fileName, locals = {}) {
        try {
            // Make sure the view name exist
            if (!(fileName in this.#response.server.rendering.views)) { throw `${fileName} view is not defined in the views object` }
            // If provided, make sure the locals is a real object
            if (!helpers.isRealObject(locals)) { throw `The locals should be an object of key:value pairs, but instead got ${typeof locals}` }

            // Determine the engine
            const viewEngine = this.viewEngine;
            let engine;

            try {
                switch (viewEngine) {
                    case 'ejs': engine = require('ejs');
                        break;
                }
            } catch (error) {
                helpers.printConsole(error);
                throw `${viewEngine} engine is chosen but is not installed.`
            }

            // Attempt to render
            engine
            return engine.render(
                this.#response.server.rendering.views[fileName],
                { ...this.#response.server.locals, ...locals }
            );
        } catch (error) {
            if (typeof error === 'string') { error = `Failed to render ${fileName}: ${error}` }
            if (typeof error?.message === 'string') { error.message = `Failed to render ${fileName}: ${error.message}` }
            throw error;
        }
    }
}

module.exports = Renderer;
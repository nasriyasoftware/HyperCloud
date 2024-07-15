import { ExternalScriptOptions, ExternalScriptRecord, ExternalStylesheetRecord, HTMLMetaName, HttpEquivType, InternalScriptOptions, InternalScriptRecord, InternalStylesheetRecord, OnPageScriptOptions, OnPageScriptRecord, PageRenderingCacheAsset } from "../../../docs/docs";
import HyperCloudServer from "../../../server";
import helpers from "../../../utils/helpers";
import fs from 'fs';
import path from 'path';

class GlobalAssets {
    readonly #_server: HyperCloudServer
    readonly #_stylesheets: (InternalStylesheetRecord | ExternalStylesheetRecord)[] = [];
    readonly #_scripts: (InternalScriptRecord | ExternalScriptRecord | OnPageScriptRecord)[] = [];
    readonly #_metaTags = [] as ({ attributes: Record<string, string> })[];
    readonly #_locals: Record<string, any> = { default: {} }

    readonly #_cache = Object.seal({
        extensions: { css: false, js: false }
    })

    constructor(server: HyperCloudServer) {
        this.#_server = server;
    }

    readonly #_helpers = {
        checkPath: (pathToCheck: string, type: 'Template' | 'CSS' | 'JS') => {
            const validity = helpers.checkPathAccessibility(pathToCheck);
            if (!validity.valid) {
                if (validity.errors.notString) { return this.#_helpers.createError(`The ${type.toLowerCase()} path that was passed to the rendering's global assets is not a valid string`) }
                if (validity.errors.doesntExist) { return this.#_helpers.createError(`The ${type.toLowerCase()} path (${pathToCheck}) that was passed to the rendering's global assets doesn't exist`) }
                if (validity.errors.notAccessible) { return this.#_helpers.createError(`The ${type.toLowerCase()} path (${pathToCheck}) that was passed to the rendering's global assets isn't accessible`) }
            }

            const ext = type === 'Template' ? '.ejs' : type === 'CSS' ? '.css' : type === 'JS' ? '.js' : ''
            if (!path.basename(pathToCheck).endsWith(ext)) { return this.#_helpers.createError(`The ${type.toLowerCase()} path you provided for the rendering's global assets isn't a ${ext.substring(1)} file`) }
            return true;
        },
        createError: (message: string) => {
            const error = new Error(message);
            error.name = `Global-Assets_Error`;
            return error;
        },
        validate: {
            scriptConfigs: (config: InternalScriptOptions | ExternalScriptOptions) => {
                if ('async' in config) {
                    if (typeof config.async !== 'boolean') { throw this.#_helpers.createError(`The script's "async" property can only be boolean, instead got ${typeof config.async}`) }
                }

                if ('crossorigin' in config) {
                    if (typeof config.crossorigin !== 'string') { throw this.#_helpers.createError(`The script's "crossorigin" value can only be a string value, instead got ${typeof config.crossorigin}`) }
                    if (!(config.crossorigin === 'anonymous' || config.crossorigin === 'use-credentials')) { throw this.#_helpers.createError(`The script's "crossorigin" can only be 'anonymous' or 'use-credentials'. You passed: ${config.crossorigin}`) }
                }

                if ('defer' in config) {
                    if (typeof config.defer !== 'boolean') { throw this.#_helpers.createError(`The script's "defer" property can only be boolean, instead got ${typeof config.defer}`) }
                }

                if ('integrity' in config) {
                    if (typeof config.integrity !== 'string') { throw this.#_helpers.createError(`The script's "integrity" value can only be a string value, instead got ${typeof config.integrity}`) }
                }

                if ('nomodule' in config) {
                    if (typeof config.nomodule !== 'boolean') { throw this.#_helpers.createError(`The script's "nomodule" property can only be boolean, instead got ${typeof config.nomodule}`) }
                }

                if ('referrerpolicy' in config) {
                    if (typeof config.referrerpolicy !== 'string') { throw this.#_helpers.createError(`The script's "referrerpolicy" value can only be a string value, instead got ${typeof config.referrerpolicy}`) }
                    const pol = ["no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url"];
                    if (!pol.includes(config.referrerpolicy)) { throw this.#_helpers.createError(`The script's "referrerpolicy" value (${config.referrerpolicy}) is not a valid referrer policy`) }
                }

                if ('type' in config) {
                    if (typeof config.type !== 'string') { throw this.#_helpers.createError(`The script's "type" value can only be a string value, instead got ${typeof config.type}`) }
                    if (config.type !== 'text/javascript') { throw this.#_helpers.createError(`The script's "type" value can only be "text/javascript"`) }
                }
            }
        }
    }

    readonly metaTags = {
        add: {
            /**
             * This attribute declares the document's character encoding.
             * Read more [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#charset).
             * @param charset 
             */
            charset: (charset: string) => {
                if (!helpers.is.validString(charset)) { throw this.#_helpers.createError(`The site's charset is expected to be a string, instead got ${typeof charset}`) }
                this.#_metaTags.push({ attributes: { charset } });
            },
            /**
             * Defines a pragma directive. Read more [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#http-equiv)
             * @param type The `http-equiv` type
             * @param content The content for the `http-equiv` type.
             */
            httpEquiv: (type: HttpEquivType, content: string) => {
                const types = ['content-security-policy', 'content-type', 'default-style', 'x-ua-compatible', 'refresh'];
                if (!helpers.is.validString(type)) { throw this.#_helpers.createError(`Unable to create an "http-equiv" tag. The tag "type" is expected to be a string, instead got ${typeof type}`) }
                if (!types.includes(type)) { throw this.#_helpers.createError(`Unable to create an "http-equiv" tag. The tag type (${type}) is NOT a valid "http-equiv" value`) }

                if (content === undefined || content === null) { throw this.#_helpers.createError(`Unable to create an "http-equiv" tag. The tag "content" cannot be null or undefined`) }
                if (!helpers.is.validString(content)) { throw this.#_helpers.createError(`Unable to create an "http-equiv" tag. The tag "content" cannot is expecting a string value, but instead got ${typeof content}`) }

                const attributes: Record<string, string> = { httpEquiv: type, content }
                switch (type) {
                    case 'refresh': {
                        const [timeStr, urlPart] = content.split(';');
                        const time = Number.parseInt(timeStr);
                        if (Number.isNaN(time)) { throw this.#_helpers.createError(`Unable to create an "http-equiv=refresh" tag. The time value in the "content" property should only be a number`) }
                        if (time < 0) { throw this.#_helpers.createError(`Unable to create an "http-equiv=refresh" tag. The time value in the "content" property cannot be a negative number`) }
                        if (String(time).length !== timeStr.length) { throw this.#_helpers.createError(`Unable to create an "http-equiv=refresh" tag. Only add numbers for as the "refresh" content. Do not add anything after the number like "content='30s'`) }

                        if (urlPart !== undefined) {
                            const [varName, url] = urlPart.split('=');
                            if (varName !== 'url') { throw this.#_helpers.createError(`Unable to create an "http-equiv=refresh" tag. The "content" value included the (;) sign but doesn't specify a "url" afterward`) }
                            if (url === undefined) { throw this.#_helpers.createError(`Unable to create an "http-equiv=refresh" tag. The content indicates the use of a "url" but doesn't include one`) }
                            if (!url.startsWith('/')) {
                                if (!helpers.is.validURL(url)) { throw this.#_helpers.createError(`Unable to create an "http-equiv=refresh" tag. The provided "url" is not a valid URL`) }
                            }
                        }
                    }
                        break;

                    case 'default-style': {
                        if (!helpers.is.validString(content)) { throw this.#_helpers.createError(`Unable to create an "http-equiv=default-style" tag. The tag content is expected to be a string, instead got ${typeof content}`) }
                    }
                        break;

                    case 'content-type': {
                        if (!helpers.is.validMime(content)) { throw this.#_helpers.createError(`Unable to create an "http-equiv=content-type" tag. The provided value is not a valid Mime type`) }
                        attributes.charset = 'UTF-8';
                    }
                        break;

                    case 'x-ua-compatible': {
                        const possibleValues = ['IE=edge', 'IE=11', 'IE=EmulateIE11', 'IE=10', 'IE=EmulateIE10', 'IE=9', 'IE=EmulateIE9', 'IE=8', 'IE=EmulateIE8', 'IE=7', 'IE=EmulateIE7', 'IE=5'];
                        if (!helpers.is.validString(content)) { throw this.#_helpers.createError(`Unable to create an "http-equiv=x-ua-compatible" tag. The content value is expected to be a string, instead got ${typeof content}`) }
                        if (!possibleValues.includes) { throw this.#_helpers.createError(`Unable to create an "http-equiv=x-ua-compatible" tag. The "content" value (${content}) is not a supported "x-ua-compatible" content value. Supported values are: ${possibleValues.join(', ')}`) }
                    }
                        break;

                    case 'content-security-policy': {
                        if (!helpers.is.validString(content)) { throw this.#_helpers.createError(`Unable to create an "http-equiv=content-security-policy" tag. The content value is expected to be a string, instead got ${typeof content}`) }
                    }

                }

                this.#_metaTags.push({ attributes });
            },
            /**
             * The `name` and `content` attributes can be used together to provide document
             * metadata in terms of name-value pairs, with the `name` attribute giving
             * the metadata name, and the `content` attribute giving the value.
             * @param name The name of the meta tag
             * @param content The value/content of the tag
             */
            name: (name: HTMLMetaName, content: string) => {
                if (!helpers.is.validString(name)) { throw this.#_helpers.createError(`Unable to create a "name" meta tag. The name is expected to be a string value, instead got ${typeof name}`) }
                if (!helpers.is.validString(content)) { throw this.#_helpers.createError(`Unable to create a "name" meta tag. The "content" is expected to be a string value, instead got ${typeof content}`) }
                this.#_metaTags.push({ attributes: { name, content } });
            },
            /**
             * Create a custom meta tag with any attributes you want
             * @param attributes 
             */
            customTag: (attributes: Record<string, string>) => {
                if (helpers.isNot.realObject(attributes)) { throw this.#_helpers.createError(`Unable to create a custom meta tag. The method expects an "attributes" object, but instead got ${typeof attributes}`) }
                const attrs: Record<string, string> = {}
                for (const prop in attributes) {
                    const value = attributes[prop];
                    if (!helpers.is.validString(value)) { throw this.#_helpers.createError(`Unable to create a custom meta tag. The attributes property (${prop}) has an invalid value. Only string values are accepted but instead got ${typeof value}`) }
                    attrs[prop] = value;
                }

                this.#_metaTags.push({ attributes: attrs });
            }
        },
        get: () => { return this.#_metaTags }
    }

    readonly stylesheets = {
        /**Link global stylesheets to your site */
        link: {
            /**
             * Link an internal `css` file
             * @param filePath The path to the CSS file
             */
            internal: (filePath: string) => {
                const validity = helpers.checkPathAccessibility(filePath);
                if (!validity.valid) {
                    if (!validity.errors.notString) { throw this.#_helpers.createError(`The stylesheet path that you passed should be a string, instead got ${typeof filePath}`) }
                    if (!validity.errors.doesntExist) { throw this.#_helpers.createError(`The stylesheet path (${filePath}) doesn't exist.`) }
                    if (!validity.errors.notAccessible) { throw this.#_helpers.createError(`You don't have enough permissions to access the stylesheet path (${filePath})`) }
                }

                const name = path.basename(filePath);
                if (this.#_stylesheets.find(i => i.scope === 'Internal' && i.fileName === name)) { throw this.#_helpers.createError(`Unable to add ${name}. A similar stylesheet file name is already defined`) }
                this.#_stylesheets.push({ scope: 'Internal', fileName: name, filePath });
            },
            /**
             * Link an external `css` file
             * @param url The URL of the external stylesheet
             */
            external: (url: URL) => {
                if (!helpers.is.validURL(url)) { throw this.#_helpers.createError(`${url} is not a valid URL`) }
                if (this.#_stylesheets.find(i => i.scope === 'External' && i.url === url)) { throw this.#_helpers.createError(`Unable to add ${url}. This stylesheet is already defined`) }
                this.#_stylesheets.push({ scope: 'External', url });
            }
        },
        get: () => { return this.#_stylesheets }
    }

    readonly scripts = {
        /**
         * Add code that directly runs on your site
         * @param script The script you want to run on your site
         * @param nomodule Specifies that the script should not be executed in browsers supporting ES2015 modules. Default: `false`
         */
        add: (config: OnPageScriptOptions) => {
            if (helpers.isNot.realObject(config)) { throw this.#_helpers.createError(`The script configs you're trying to add is not a valid object`) }

            if (!('content' in config)) {
                throw this.#_helpers.createError(`The script's "content" property is missing`);
            }

            if (!helpers.is.validString(config.content)) { throw this.#_helpers.createError(`The script value you're trying to add is not a valid JavaScript code`) }
            this.#_scripts.push({
                scope: 'OnPage',
                nomodule: typeof config.nomodule === 'boolean' ? config.nomodule : undefined,
                content: config.content
            })
        },
        /**Link script files to your site */
        link: {
            /**
             * Link an internal JavaScript file (on your server) to this site
             * @param config The internal JavaScript configurations
             */
            internal: (config: InternalScriptOptions) => {
                if (helpers.isNot.realObject(config)) { throw this.#_helpers.createError(`The script configs you're trying to add is not a valid object`) }

                if ('filePath' in config) {
                    const validity = helpers.checkPathAccessibility(config.filePath);
                    if (!validity.valid) {
                        if (validity.errors.notString) { throw this.#_helpers.createError(`The script "filePath" is expecting a string value, instead got ${typeof config.filePath}`) }
                        if (validity.errors.doesntExist) { throw this.#_helpers.createError(`The script "filePath" (${config.filePath}) doesn't exist`) }
                        if (validity.errors.notAccessible) { throw this.#_helpers.createError(`You don't have enough permissions to access the script "filePath" (${config.filePath})`) }
                    }
                } else {
                    throw this.#_helpers.createError(`Unable to add internal script rendering's global assets. The config object is missing the "filePath" property`)
                }

                this.#_helpers.validate.scriptConfigs(config);
                this.#_scripts.push({
                    ...config,
                    fileName: path.basename(config.filePath),
                    scope: 'Internal'
                })
            },
            /**
             * Link an external JavaScript file (from other servers) to your site
             * @param config The external JavaScript configurations
             */
            external: (config: ExternalScriptOptions) => {
                if (helpers.isNot.realObject(config)) { throw this.#_helpers.createError(`The script configs you're trying to add is not a valid object`) }

                if ('src' in config) {
                    try {
                        new URL(config.src);
                    } catch (error) {
                        throw this.#_helpers.createError(`Unable to add external script rendering's global assets. The script's "src" value is not a valid URL`)
                    }
                } else {
                    throw this.#_helpers.createError(`Unable to add external script rendering's global assets. The config object is missing the "src" property`)
                }

                this.#_helpers.validate.scriptConfigs(config);
                this.#_scripts.push({
                    ...config,
                    scope: 'External'
                })
            }
        },
        get: () => { return this.#_scripts }
    }

    /**
     * The server locals object has properties that are local
     * variables within the application, and will be available
     * in templates rendered with `{@link HyperCloudResponse.render}`.
     */
    readonly locals = {
        /**
         * Set your server's locals
         * @param locals The locals object you want to set
         * @param lang A language to bind the locals object to (optional)
         */
        set: (locals: Record<string, any>, lang?: string) => {
            if (helpers.isNot.realObject(locals)) { throw new TypeError(`The server's rendering locals are expected to be a real object, isntead got ${typeof locals}`) }
            if (lang === undefined) {
                lang = 'default';
            } else {
                if (!this.#_server.supportedLanguages.includes(lang)) { throw new SyntaxError(`The language you used set your server locals (${lang}) is not supported by your server`) }
            }

            this.#_locals[lang] = locals;
        },
        /**Multilingual locals */
        multilingual: {
            /**
             * Set your server's multilingual locals 
             * @param locals The multilingual locals
             */
            set: (locals: Record<string, any>) => {
                if (helpers.isNot.realObject(locals)) { throw new TypeError(`The server's multilingual rendering locals are expected to be a real object, isntead got ${typeof locals}`) }

                if ('default' in locals) {
                    for (const lang in locals) {
                        this.#_locals[lang] = locals[lang];
                    }
                } else {
                    throw new Error(`The server's multilingual rendering locals object is missing the "default" property.`)
                }
            }
        },
        /**
         * Get the server's locals
         * @param lang The language of the locals
         * @returns 
         */
        get: (lang: string = 'default'): Record<string, any> => {
            return this.#_locals[lang] || this.#_locals.default;
        }
    }

    /**Control global site caching for different assets */
    readonly cache = {
        /**
         * Enable site caching.
         * @param extensions The extensions you want to enable. Default: All assets
         * @example
         * assets.cache.enable();                 // Enable caching for all assets
         * assets.cache.enable('js');             // Enable caching for JavaScript Files
         * assets.cache.enable(['js', 'css']);    // Enable caching for CSS Files
         */
        enable: (extensions?: PageRenderingCacheAsset | PageRenderingCacheAsset[]) => {
            try {
                if (extensions === undefined) {
                    this.#_cache.extensions.css = this.#_cache.extensions.js = true;
                } else {
                    if (!(typeof extensions === 'string' || Array.isArray(extensions))) { throw new TypeError(`${typeof extensions} is not a valid caching argument.`) }
                    if (typeof extensions === 'string') { extensions = [extensions] }

                    for (const ext of extensions) {
                        if (typeof ext !== 'string') { throw new TypeError(`Cache extensions are expected to be strings, instead got ${typeof ext}`) }
                        if (!Object.keys(this.#_cache.extensions).includes(ext)) { throw new Error(`${ext} is not a valid caching asset`) }
                        this.#_cache.extensions[ext] = true;
                    }
                }
            } catch (error) {
                if (error instanceof Error) { error.message = `Unable to enable rendering's global assets cache: ${error.message}` }
                throw error;
            }
        },
        /**
         * Disable site caching.
         * @param extensions The extensions you want to disble. Default: All assets
         * @example
         * assets.cache.disble();                 // Disable caching for all assets
         * assets.cache.disble('js');             // Disable caching for JavaScript Files
         * assets.cache.disble(['js', 'css']);    // Disable caching for CSS Files
         */
        disable: (extensions?: PageRenderingCacheAsset | PageRenderingCacheAsset[]) => {
            try {
                if (extensions === undefined) {
                    this.#_cache.extensions.css = this.#_cache.extensions.js = false;
                } else {
                    if (!(typeof extensions === 'string' || Array.isArray(extensions))) { throw new TypeError(`${typeof extensions} is not a valid caching argument.`) }
                    if (typeof extensions === 'string') { extensions = [extensions] }

                    for (const ext of extensions) {
                        if (helpers.is.validString(ext)) { throw new TypeError(`Cache extensions are expected to be strings, instead got ${typeof ext}`) }
                        if (!Object.keys(this.#_cache.extensions).includes(ext)) { throw new Error(`${ext} is not a valid caching asset`) }
                        this.#_cache.extensions[ext] = false;
                    }
                }
            } catch (error) {
                if (error instanceof Error) { error.message = `Unable to disable rendering's global assets cache: ${error.message}` }
                throw error;
            }
        },
        /**
         * Update site caching state.
         * - For enabled assets, content will be cached in memory and their eTags generated.
         * - For disabled assets, content will be cleared from memory and eTags will be removed.
         */
        update: async () => {
            try {
                const promises: Promise<void>[] = [];

                if (this.#_cache.extensions.css) {
                    const stylesheetPromises = this.#_stylesheets.filter(i => i.scope === 'Internal').map(i => {
                        const stylesheet = i as InternalStylesheetRecord;
                        return new Promise<void>((resolve, reject) => {
                            stylesheet.content = fs.readFileSync(stylesheet.filePath, { encoding: 'utf-8' })
                            helpers.calculateHash(stylesheet.filePath).then(hash => {
                                stylesheet.eTag = hash;
                                resolve();
                            }).catch(err => reject({ type: 'stylesheet', filePath: stylesheet.filePath, error: err }))
                        })
                    })

                    promises.push(...stylesheetPromises);
                } else {
                    for (const stylesheet of this.#_stylesheets.filter((i): i is InternalStylesheetRecord => i.scope === 'Internal')) {
                        stylesheet.content = stylesheet.eTag = undefined;
                    }
                }

                if (this.#_cache.extensions.js) {
                    const jsPromises = this.#_scripts.filter(i => i.scope === 'Internal').map(i => {
                        const script = i as InternalScriptRecord;
                        return new Promise<void>((resolve, reject) => {
                            script.content = fs.readFileSync(script.filePath, { encoding: 'utf-8' });
                            helpers.calculateHash(script.filePath).then(hash => {
                                script.eTag = hash;
                                resolve()
                            }).catch(err => reject({ type: 'script', filePath: script.filePath, error: err }))
                        })
                    })

                    promises.push(...jsPromises);
                } else {
                    for (const script of this.#_scripts.filter((i): i is InternalScriptRecord => i.scope === 'Internal')) {
                        script.content = script.eTag = undefined;
                    }
                }

                await Promise.allSettled(promises).then(results => {
                    const failed = results.filter(i => i.status === 'rejected') as PromiseRejectedResult[];
                    if (failed.length > 0) {
                        const errors = failed.map(i => i.reason);
                        console.error(errors);
                        throw new Error(`${errors.length} errors occurred. Read the errors object`)
                    }
                })
            } catch (error) {
                if (error instanceof Error) { error.message = `Unable to update the rendering's global assets cache: ${error.message}` }
                throw error;
            }
        },
        /**Read the caching status of this page */
        status: () => this.#_cache.extensions
    }
}

export default GlobalAssets;
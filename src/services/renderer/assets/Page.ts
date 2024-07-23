import { ExternalScriptOptions, ExternalScriptRecord, ExternalStylesheetRecord, HTMLMetaName, HttpEquivType, InternalScriptOptions, InternalScriptRecord, InternalStylesheetRecord, OnPageScriptOptions, OnPageScriptRecord, PageRenderingCacheAsset, ViewRenderingAsset } from "../../../docs/docs";
import helpers from "../../../utils/helpers";
import fs from 'fs';
import path from 'path';

export class Page {
    #_id = helpers.generateRandom(16, { includeSymbols: false });
    /**Page name (internally on the server) */
    readonly #_name: string;
    /**The template */
    readonly #_template: ViewRenderingAsset = { filePath: '', content: '' }

    readonly #_title: Record<string, string> = { default: '' }
    readonly #_description: Record<string, string> = { default: '' }
    /**The template's default locals */
    readonly #_locals: Record<string, any> = { default: {} }

    readonly #_stylesheets: (InternalStylesheetRecord | ExternalStylesheetRecord)[] = [];
    readonly #_scripts: (InternalScriptRecord | ExternalScriptRecord | OnPageScriptRecord)[] = [];
    readonly #_metaTags = [] as ({ attributes: Record<string, string> })[];

    readonly #_cache = Object.seal({
        extensions: { css: false, js: false }
    })

    readonly #_helpers = {
        checkPath: (pathToCheck: string, type: 'Template' | 'CSS' | 'JS') => {
            const validity = helpers.checkPathAccessibility(pathToCheck);
            if (!validity.valid) {
                if (validity.errors.notString) { return this.#_helpers.createError(`The ${type.toLowerCase()} path that was passed to the ${this.#_name} page is not a valid string`) }
                if (validity.errors.doesntExist) { return this.#_helpers.createError(`The ${type.toLowerCase()} path (${pathToCheck}) that was passed to the ${this.#_name} page doesn't exist`) }
                if (validity.errors.notAccessible) { return this.#_helpers.createError(`The ${type.toLowerCase()} path (${pathToCheck}) that was passed to the ${this.#_name} page isn't accessible`) }
            }

            const ext = type === 'Template' ? '.ejs' : type === 'CSS' ? '.css' : type === 'JS' ? '.js' : ''
            if (!path.basename(pathToCheck).endsWith(ext)) { return this.#_helpers.createError(`The ${type.toLowerCase()} path you provided for the ${this.#_name} page isn't a ${ext.substring(1)} file`) }
            return true;
        },
        createError: (message: string) => {
            const error = new Error(`(${this.#_name}) ${message}`);
            error.name = `${this.name}Error`;
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

                    const possibleOptions = ['text/javascript', 'application/ecmascript', 'text/babel', 'application/ld+json', 'module'] as InternalScriptOptions['type'][];
                    config.type = config.type.toLowerCase() as InternalScriptOptions['type'];

                    if (!possibleOptions.includes(config.type)) { throw this.#_helpers.createError(`The script's "type" value is not supported`) }
                }
            }
        }
    }

    constructor(name: string) {
        this.#_name = name;
    }

    readonly template = {
        path: {
            set: (filePath: string) => {
                const checkRes = this.#_helpers.checkPath(filePath, 'Template');
                if (checkRes instanceof Error) { throw checkRes }
                this.#_template.filePath = filePath;
                this.#_template.content = fs.readFileSync(filePath, { encoding: 'utf-8' })
            },
            get: () => { return this.#_template.filePath }
        },
        content: {
            get: () => { return this.#_template.content }
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
                if (!helpers.is.validString(charset)) { throw this.#_helpers.createError(`The page charset is expected to be a string, instead got ${typeof charset}`) }
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

    readonly title = {
        /**
         * Set a title for your page. Pass a language as the
         * second argument if you want to create language-specific
         * title.
         * 
         * **Examples:**
         * 
         * Setting a title for a page
         * ```js
         * const page = new Page('Home');
         * page.title.set('Home');
         * ```
         * 
         * Setting a title for a page in Arabic
         * ```js
         * const page = new Page('Home');
         * page.title.set('الرئيسة', 'ar');
         * ```
         * @param title The page title
         * @param lang The language you want to add. E.g: `en`, `ar`, `se`, etc.
         */
        set: (title: string, lang?: string) => {
            if (!helpers.is.validString(title)) { throw this.#_helpers.createError(`The title's value is expected to be a string, instead got ${typeof title}`) }
            if (lang === undefined) { lang = 'default' }
            this.#_title[lang] = title;
        },
        multilingual: {
            set: (titles: Record<string, string>) => {
                if (helpers.isNot.realObject(titles)) { throw this.#_helpers.createError(`Invalid titles have been passed to the ${this.#_name} page's "title.multilingual.set()". Expected a real object bust instead got ${typeof titles}`) }
                for (const lang in titles) {
                    if (!helpers.is.validString(titles[lang])) { throw this.#_helpers.createError(`One of the passed titles is not a string`) }
                }

                if ('default' in titles) {
                    for (const lang in titles) {
                        this.#_title[lang] = titles[lang];
                    }
                } else {
                    throw this.#_helpers.createError(`The object passed to "title.multilingual.set()" is missing the "default" property.`)
                }
            }
        },
        get: (lang: string = 'default') => this.#_title[lang] || this.#_title.default
    }

    readonly description = {
        /**
         * Set a description for your page. Pass a language as the
         * second argument if you want to create language-specific
         * description.
         * 
         * **Examples:**
         * 
         * Setting a description for a page
         * ```js
         * const page = new Page('Home');
         * page.description.set('This is a home page');
         * ```
         * 
         * Setting a description for a page in Arabic
         * ```js
         * const page = new Page('Home');
         * page.description.set('هذه هي الصفحة الرئيسة', 'ar');
         * ```
         * @param description The page description
         * @param lang The language you want to add. E.g: `en`, `ar`, `se`, etc.
         */
        set: (description: string, lang?: string) => {
            if (!helpers.is.validString(description)) { throw this.#_helpers.createError(`The description's value is expected to be a string, instead got ${typeof description}`) }
            if (lang === undefined) { lang = 'default' }
            this.#_description[lang] = description;
        },
        multilingual: {
            set: (descriptions: Record<string, string>) => {
                if (helpers.isNot.realObject(descriptions)) { throw this.#_helpers.createError(`Invalid descriptions have been passed to the ${this.#_name} page's "description.multilingual.set()". Expected a real object bust instead got ${typeof descriptions}`) }
                for (const lang in descriptions) {
                    if (!helpers.is.validString(descriptions[lang])) { throw this.#_helpers.createError(`One of the passed descriptions is not a string`) }
                }

                if ('default' in descriptions) {
                    for (const lang in descriptions) {
                        this.#_description[lang] = descriptions[lang];
                    }
                } else {
                    throw this.#_helpers.createError(`The object passed to "description.multilingual.set()" is missing the "default" property.`)
                }
            }
        },
        get: (lang: string = 'default') => this.#_description[lang] || this.#_description.default
    }

    readonly locals = {
        /**
         * Add a locale object for your page. If the locale is
         * language specific, specify the language in the second argument.
         * 
         * **Notes:**
         * - The `locals.add` method *adds* the given properties, it doesn't reasign
         * the locals, which means it's safe to add locals in multiple calls.
         * - Be aware that adding locals already added will overwrite them, which means
         * the newer value will replace the previous one.
         * @example
         * const page = new Page('Home');
         * 
         * page.locals.add({ name: 'John', age: 20 }); // Adds object globally
         * page.locals.add({ height: 175 }); // Adds the height globally
         * 
         * page.locals.add({ title: 'Home' }, 'en');     // Adds a title specifically under the "en" language
         * page.locals.add({ title: 'الرئيسة' }, 'ar'); // Adds a title specifically under the "ar" language
         * @param locale The locale object
         * @param lang A language supported by your server.
         */
        add: (locals: Record<string, any>, lang?: string) => {
            if (helpers.isNot.realObject(locals)) { throw this.#_helpers.createError(`An invalid locale has been passed to the ${this.#_name} page's "locals.add()". Expected a real object bust instead got ${typeof locals}`) }
            if (lang === undefined) { lang = 'default' }
            if (helpers.isNot.realObject(this.#_locals[lang])) { this.#_locals[lang] = {} }

            for (const prop in locals) {
                this.#_locals[lang][prop] = locals[prop];
            }
        },
        multilingual: {
            set: (locals: Record<string, Record<string, any>>) => {
                if (helpers.isNot.realObject(locals)) { throw this.#_helpers.createError(`An invalid locale has been passed to the ${this.#_name} page's "locals.multilingual.set()" locale. Expected a real object bust instead got ${typeof locals}`) }

                if ('default' in locals) {
                    if (helpers.isNot.realObject(locals.default)) { throw this.#_helpers.createError(`The object passed to "locals.multilingual.set()" has an invalid value type for "default". Expected a real object but instead got ${typeof locals.default}`) }
                } else {
                    throw this.#_helpers.createError(`The object passed to "locals.multilingual.set()" is missing the "default" property.`)
                }

                for (const lang in locals) {
                    this.#_locals[lang] = locals[lang];
                }
            }
        },
        get: (lang: string = 'default') => lang in this.#_locals ? this.#_locals[lang] : this.#_locals.default
    }

    readonly scripts = {
        /**
         * Add code that directly runs on your page
         * @param script The script you want to run on the page
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
        /**Link script files to your page */
        link: {
            /**
             * Link an internal JavaScript file (on your server) to this page
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
                    throw this.#_helpers.createError(`Unable to add internal script to page. The config object is missing the "filePath" property`)
                }

                this.#_helpers.validate.scriptConfigs(config);
                this.#_scripts.push({
                    ...config,
                    fileName: path.basename(config.filePath),
                    scope: 'Internal'
                })
            },
            /**
             * Link an external JavaScript file (from other servers) to this page
             * @param config The external JavaScript configurations
             */
            external: (config: ExternalScriptOptions) => {
                if (helpers.isNot.realObject(config)) { throw this.#_helpers.createError(`The script configs you're trying to add is not a valid object`) }

                if ('src' in config) {
                    try {
                        new URL(config.src);
                    } catch (error) {
                        throw this.#_helpers.createError(`Unable to add external script to page. The script's "src" value is not a valid URL`)
                    }
                } else {
                    throw this.#_helpers.createError(`Unable to add external script to page. The config object is missing the "src" property`)
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

    readonly stylesheets = {
        /**Link stylesheets to your page */
        link: {
            /**
             * Link an internal `css` file
             * @param filePath The path to the CSS file
             */
            internal: (filePath: string) => {
                const validity = helpers.checkPathAccessibility(filePath);
                if (!validity.valid) {
                    if (validity.errors.notString) { throw this.#_helpers.createError(`The stylesheet path that you passed should be a string, instead got ${typeof filePath}`) }
                    if (validity.errors.doesntExist) { throw this.#_helpers.createError(`The stylesheet path (${filePath}) doesn't exist.`) }
                    if (validity.errors.notAccessible) { throw this.#_helpers.createError(`You don't have enough permissions to access the stylesheet path (${filePath})`) }
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

    /**Page name */
    get name() { return this.#_name }
    /**Page ID */
    get _id() { return this.#_id }

    /**Control page caching for different assets */
    readonly cache = {
        /**
         * Enable caching for this page.
         * @param extensions The extensions you want to enable. Default: All assets
         * @example
         * page.cache.enable();                 // Enable caching for all assets
         * page.cache.enable('js');             // Enable caching for JavaScript Files
         * page.cache.enable(['js', 'css']);    // Enable caching for CSS Files
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
                if (error instanceof Error) { error.message = `Unable to enable ${this.#_name} page cache: ${error.message}` }
                throw error;
            }
        },
        /**
         * Disable caching for this page.
         * @param extensions The extensions you want to disable. Default: All assets
         * @example
         * page.cache.disable();                 // Disable caching for all assets
         * page.cache.disable('js');             // Disable caching for JavaScript Files
         * page.cache.disable(['js', 'css']);    // Disable caching for CSS Files
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
                if (error instanceof Error) { error.message = `Unable to disable ${this.#_name} page cache: ${error.message}` }
                throw error;
            }
        },
        /**
         * Update page caching state.
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
                if (error instanceof Error) { error.message = `Unable to update the ${this.#_name} page cache: ${error.message}` }
                throw error;
            }
        },
        /**Read the caching status of this page */
        status: () => this.#_cache.extensions
    }
}

export default Page;
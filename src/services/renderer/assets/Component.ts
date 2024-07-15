import { FileAsset, InternalScriptOptions, InternalScriptRecord, InternalStylesheetRecord, PageRenderingCacheAsset, ViewRenderingAsset } from '../../../docs/docs';
import helpers from '../../../utils/helpers';
import fs from 'fs';
import path from 'path';

export class Component {
    readonly #_id = helpers.generateRandom(16, { includeSymbols: false });
    /**Component name */
    readonly #_name: string;
    /**The EJS template */
    readonly #_template: ViewRenderingAsset = { filePath: '', content: '' }

    /**The component's stylesheet */
    #_stylesheet: InternalStylesheetRecord | undefined;
    /**The component's script */
    #_script: InternalScriptRecord | undefined;
    /**The template's default locals */
    readonly #_locals: Record<string, any> = { default: {} }

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
            scriptConfigs: (config: InternalScriptOptions) => {
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

    /**
     * Create a new component
     * @param name The component name
     */
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

    readonly stylesheet = {
        /**
         * Link an internal `css` file
         * @param filePath The path to the CSS file
         */
        set: (filePath: string) => {
            const validity = helpers.checkPathAccessibility(filePath);
            if (!validity.valid) {
                if (!validity.errors.notString) { throw this.#_helpers.createError(`The stylesheet path that you passed should be a string, instead got ${typeof filePath}`) }
                if (!validity.errors.doesntExist) { throw this.#_helpers.createError(`The stylesheet path (${filePath}) doesn't exist.`) }
                if (!validity.errors.notAccessible) { throw this.#_helpers.createError(`You don't have enough permissions to access the stylesheet path (${filePath})`) }
            }

            const name = path.basename(filePath);
            this.#_stylesheet = { scope: 'Internal', fileName: name, filePath }
        },
        get: () => this.#_stylesheet
    }

    readonly script = {
        set: (config: InternalScriptOptions) => {
            if (helpers.isNot.realObject(config)) { throw this.#_helpers.createError(`The script configs you're trying to add is not a valid object`) }

            if ('filePath' in config) {
                const validity = helpers.checkPathAccessibility(config.filePath);
                if (!validity.valid) {
                    if (validity.errors.notString) { throw this.#_helpers.createError(`The script "filePath" is expecting a string value, instead got ${typeof config.filePath}`) }
                    if (validity.errors.doesntExist) { throw this.#_helpers.createError(`The script "filePath" (${config.filePath}) doesn't exist`) }
                    if (validity.errors.notAccessible) { throw this.#_helpers.createError(`You don't have enough permissions to access the script "filePath" (${config.filePath})`) }
                }
            } else {
                throw this.#_helpers.createError(`Unable to add internal script to component. The config object is missing the "filePath" property`)
            }

            this.#_helpers.validate.scriptConfigs(config);
            this.#_script = { scope: 'Internal', fileName: path.basename(config.filePath), ...config }
        },
        get: () => this.#_script
    }

    readonly locals = {
        /**
         * Add a locale object for your component. If the locale is
         * language specific, specify the language in the second argument.
         * 
         * **Notes:**
         * - The `locals.add` method *adds* the given properties, it doesn't reasign
         * the locals, which means it's safe to add locals in multiple calls.
         * - Be aware that adding locals already added will overwrite them, which means
         * the newer value will replace the previous one.
         * @example
         * const component = new Component('LoginBar');
         * 
         * // Adds object globally
         * component.locals.add({ login: 'Login', signup: 'Signup' });
         * 
         * // Adds a title specifically under the "ar" language
         * component.locals.add({ login: 'تسجيل الدخول', signup: 'إنشاء حساب' }, 'ar');
         * @param locale The locale object
         * @param lang A language supported by your server.
         */
        add: (locals: Record<string, any>, lang?: string) => {
            if (helpers.isNot.realObject(locals)) { throw this.#_helpers.createError(`An invalid locale has been passed to the ${this.#_name} component's "locals.add()". Expected a real object bust instead got ${typeof locals}`) }
            if (lang === undefined) { lang = 'default' }
            if (helpers.isNot.realObject(this.#_locals[lang])) { this.#_locals[lang] = {} }

            for (const prop in locals) {
                this.#_locals[lang][prop] = locals[prop];
            }
        },
        multilingual: {
            set: (locals: Record<string, Record<string, any>>) => {
                if (helpers.isNot.realObject(locals)) { throw this.#_helpers.createError(`An invalid locale has been passed to the ${this.#_name} component's "locals.multilingual.set()" locale. Expected a real object bust instead got ${typeof locals}`) }

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
        get: (lang: string = 'default') => this.#_locals[lang] || this.#_locals.default
    }

    /**Component name */
    get name() { return this.#_name }
    /**Component ID */
    get _id() { return this.#_id }

    /**Control component caching for different assets */
    readonly cache = {
        /**
         * Enable caching for this component
         * @param extensions he extensions you want to enable. Default: All assets
         * @example
         * component.cache.enable();                 // Enable caching for all assets
         * component.cache.enable('js');             // Enable caching for JavaScript Files
         * component.cache.enable(['js', 'css']);    // Enable caching for CSS Files
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
                if (error instanceof Error) { error.message = `Unable to enable ${this.#_name} component cache: ${error.message}` }
                throw error;
            }
        },
        /**
         * Disable caching for this component.
         * @param extensions The extensions you want to disble. Default: All assets
         * @example
         * component.cache.disble();                 // Disable caching for all assets
         * component.cache.disble('js');             // Disable caching for JavaScript Files
         * component.cache.disble(['js', 'css']);    // Disable caching for CSS Files
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
                if (error instanceof Error) { error.message = `Unable to disable ${this.#_name} component cache: ${error.message}` }
                throw error;
            }
        },
        /**
         * Update component caching state.
         * - For enabled assets, content will be cached in memory and their eTags generated.
         * - For disabled assets, content will be cleared from memory and eTags will be removed.
         */
        update: async () => {
            try {
                const promises: Promise<void>[] = [new Promise<void>((resolve, reject) => {
                    try {
                        this.#_template.content = fs.readFileSync(this.#_template.filePath, { encoding: 'utf-8' });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                })];

                if (!helpers.is.undefined(this.#_stylesheet)) {
                    if (this.#_cache.extensions.css) {
                        promises.push(new Promise<void>((resolve, reject) => {
                            const stylesheet = this.#_stylesheet as FileAsset;
                            stylesheet.content = fs.readFileSync(stylesheet.filePath, { encoding: 'utf-8' });
                            helpers.calculateHash(stylesheet.filePath).then(hash => {
                                stylesheet.eTag = hash;
                                resolve();
                            }).catch(err => reject({ type: 'stylesheet', filePath: stylesheet.filePath, error: err }))
                        }));
                    } else {
                        this.#_stylesheet.content = this.#_stylesheet.eTag = undefined;
                    }
                }

                if (!helpers.is.undefined(this.#_script)) {
                    if (this.#_cache.extensions.js) {
                        promises.push(new Promise<void>((resolve, reject) => {
                            const script = this.#_script as InternalScriptRecord;
                            script.content = fs.readFileSync(script.filePath, { encoding: 'utf-8' });
                            helpers.calculateHash(script.filePath).then(hash => {
                                script.eTag = hash;
                                resolve();
                            }).catch(err => reject({ type: 'stylesheet', filePath: script.filePath, error: err }))
                        }))
                    } else {
                        this.#_script.content = this.#_script.eTag = undefined;
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
                if (error instanceof Error) { error.message = `Unable to update the ${this.#_name} component cache: ${error.message}` }
                throw error;
            }
        },
        /**Read the caching status of this component */
        status: () => this.#_cache.extensions
    }
}

export default Component;
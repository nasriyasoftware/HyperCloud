import helpers from '../../utils/helpers';
import { InternalScriptRecord, InternalStylesheetRecord, PageRenderingCacheAsset, RenderingCacheAsset } from '../../docs/docs';

import HyperCloudServer from '../../server';
import HyperCloudResponse from '../handler/assets/response';

import Component from './assets/Component';
import Page from './assets/Page';

import pagesManager from './managers/pagesManager';
import compsManager from './managers/componentsManager';
import GlobalAssets from './managers/globalAssetsManager';

/**
 * This class is used inside a {@link HyperCloudServer} as
 * `{@link HyperCloudServer["rendering"]}`
 */
class RenderingManager {
    readonly #_cache = Object.seal({
        pages: { extensions: { css: false, js: false, json: false } },
        components: { extensions: { css: false, js: false, json: false } },
        globalAssets: { extensions: { css: false, js: false, json: false } }
    })

    readonly #_server: HyperCloudServer;
    readonly #_siteName: Record<string, any> = { default: null }
    readonly #_globalAssets: GlobalAssets;
    #_assetsBaseUrl = '/_assets/renderer';

    readonly #_helpers = {
        sendStylesheet: (data: { stylesheet: InternalStylesheetRecord | undefined, isCached: boolean, type: 'Page' | 'Component' | 'Global Asset' }, res: HyperCloudResponse) => {
            const { stylesheet, isCached, type } = data;
            if (stylesheet) {
                if (isCached) {
                    res.setHeader('etag', stylesheet.eTag as string);
                    return res.status(200).send(stylesheet.content as string, 'text/css');
                } else {
                    return res.status(200).sendFile(stylesheet.filePath as string, { eTag: stylesheet.eTag });
                }
            } else {
                return res.status(500).json({ message: `${type} asset was not found. Report this issue to the framework owners` })
            }
        },
        sendScript: (data: { script: InternalScriptRecord | undefined, isCached: boolean, type: 'Page' | 'Component' | 'Global Asset' }, res: HyperCloudResponse) => {
            const { script, isCached, type } = data;
            if (script) {
                if (isCached) {
                    res.setHeader('etag', script.eTag as string);
                    return res.status(200).send(script.content as string, 'text/javascript');
                } else {
                    return res.status(200).sendFile(script.filePath as string, { eTag: script.eTag });
                }
            } else {
                return res.status(500).json({ message: `${type} asset was not found. Report this issue to the framework owners` })
            }
        },
        sendFile: (data: { record: InternalScriptRecord | InternalStylesheetRecord, isCached: boolean, type: 'Page' | 'Component' | 'Global Asset', fileType: 'css' | 'js' }, res: HyperCloudResponse) => {
            const { record, isCached, type, fileType } = data;
            if (fileType === 'css') {
                return this.#_helpers.sendStylesheet({ stylesheet: record, isCached, type }, res);
            } else {
                return this.#_helpers.sendScript({ script: record, isCached, type }, res);
            }
        }
    }

    constructor(server: HyperCloudServer) {
        this.#_server = server;
        this.#_globalAssets = new GlobalAssets(server);

        const router = server.Router();
        router.get(`${this.#_assetsBaseUrl}/global/<:fileType>/<:file>`, (req, res, next) => {
            const fileType = req.params.fileType.toLowerCase();
            if (!(fileType === 'css' || fileType === 'js')) { return next() }

            const fileName = req.params.file;
            const scriptFile = this.#_globalAssets.scripts.get().find(i => i.scope === 'Internal' && i.fileName === fileName) as InternalScriptRecord | undefined;
            const stylesheetFile = this.#_globalAssets.stylesheets.get().find(i => i.scope === 'Internal' && i.fileName === fileName) as InternalStylesheetRecord | undefined;
            const file: InternalScriptRecord | InternalStylesheetRecord | undefined = fileType === 'js' ? scriptFile : fileType === 'css' ? stylesheetFile : undefined;
            if (!file) { return next() }

            res.setHeader('Referrer-Policy', 'strict-origin');
            return this.#_helpers.sendFile({ record: file, isCached: this.#_globalAssets.cache.status()[fileType], type: 'Global Asset', fileType }, res);
        })

        router.get(`${this.#_assetsBaseUrl}/components/<:compName>/<:file>`, (req, res, next) => {
            const component = this.components.storage[req.params.compName];
            if (!component) { return next() }

            const fileName = req.params.file;
            const fileType = fileName.toLowerCase().endsWith('.js') ? 'js' : fileName.toLowerCase().endsWith('.css') ? 'css' : null;
            if (!fileType) { return next() }

            const scriptFile = component.script.get();
            const stylesheetFile = component.stylesheet.get();
            const file: InternalScriptRecord | InternalStylesheetRecord | undefined = fileType === 'js' ? scriptFile : fileType === 'css' ? stylesheetFile : undefined;
            if (!file) { return next() }

            res.setHeader('Referrer-Policy', 'strict-origin');
            return this.#_helpers.sendFile({ record: file, isCached: component.cache.status()[fileType], type: 'Component', fileType }, res);
        })

        router.get(`${this.#_assetsBaseUrl}/pages/<:pageId>/<:file>`, (req, res, next) => {
            const page = this.pages.all.find(i => i._id === req.params.pageId);
            if (!page) { return next() }

            const fileName = req.params.file;
            const fileType = fileName.toLowerCase().endsWith('.js') ? 'js' : fileName.toLowerCase().endsWith('.css') ? 'css' : null;
            if (!fileType) { return next() }

            const scriptFile = page.scripts.get().find(i => i.scope === 'Internal' && i.fileName === fileName) as InternalScriptRecord | undefined;
            const stylesheetFile = page.stylesheets.get().find(i => i.scope === 'Internal' && i.fileName === fileName) as InternalStylesheetRecord | undefined;
            const file: InternalScriptRecord | InternalStylesheetRecord | undefined = fileType === 'js' ? scriptFile : fileType === 'css' ? stylesheetFile : undefined;
            if (!file) { return next() }

            res.setHeader('Referrer-Policy', 'strict-origin');
            return this.#_helpers.sendFile({ record: file, isCached: page.cache.status()[fileType], type: 'Page', fileType }, res);
        })
    }

    /**
     * Set or get your site/brand name. This will be used in page rendering.
     * @example
     * // Setup a default name
     * server.rendering.siteName.set('Nasriya Software');
     * // or
     * server.rendering.siteName.set('Nasriya Software', 'default');
     * // or
     * server.rendering.siteName.multilingual.set({
     *      default: 'Nasriya Software'
     * });
     * @example
     * // Setup multilingual names
     * server.rendering.siteName.multilingual.set({
     *      default: 'Nasriya Software',
     *      ar: "ناصرية سوفتوير"
     * });
     */
    readonly siteName = {
        /**
         * Set the name of your site or brand
         * @param name The site/brand name
         * @param lang The language you want to bind this name to (optional)
         */
        set: (name: string, lang: string = 'default') => {
            if (!helpers.is.validString(name)) { throw new TypeError(`The site name can only a valid string, instead got ${typeof name}`) }
            if (lang !== 'default') {
                if (this.#_server.supportedLanguages.includes(lang)) { throw new SyntaxError(`The site name language ${lang} is not supported by your server. Make sure to set it up first`) }
            }

            this.#_siteName[lang] = name;
        },
        /**Set the name of your site in different languages */
        multilingual: {
            /**
             * Set your site or brand name in multiple languages
             * @param names An object containing a `lang: name` pairs
             * @example
             * server.rendering.siteName.multilingual.set({
             *      default: 'Nasriya Software',
             *      ar: "ناصرية سوفتوير"
             * });
             */
            set: (names: Record<string, string>) => {
                if (helpers.isNot.realObject(names)) { throw new TypeError(`The siteName multilingual value is expected to be a real object. Instead got ${typeof names}`) }
                for (const lang in names) {
                    if (!helpers.is.validString(names[lang])) { throw new TypeError(`The siteName multilingual object has one or more non-string values`) }
                }

                if ('default' in names) {
                    for (const lang in names) {
                        this.#_siteName[lang] = names[lang];
                    }
                } else {
                    throw new SyntaxError(`The siteName multilingual object does not include a "default" name`);
                }
            }
        },
        /**
         * Get the site/brand name
         * @param lang The language of the site/brand name
         */
        get: (lang: string = 'default'): string => {
            return this.#_siteName[lang] || this.#_siteName.default;
        }
    }

    readonly components = compsManager;
    readonly pages = pagesManager;

    /**Set global assets for your server */
    get assets() { return this.#_globalAssets }
    /**The base URL of the assets used in the renderer */
    get assetsBaseUrl() { return this.#_assetsBaseUrl }

    /**
     * Increase your server's performance by enabling caching.
     * Caching stores the files in memory (RAM) which is way faster than
     * any other tpye of storage.
     * 
     * **NOTE:**
     * 
     * You can enable/disable caching of certain files
    */
    readonly cache = {
        /**Enable caching for certain assets */
        enableFor: {
            /**
             * Enable caching for certain files extensions for pages
             * @example
             * // Enable caching for all supported files
             * server.rendering.cache.enableFor.pages();
             * @example
             * // Enable caching for JSON files
             * server.rendering.cache.enableFor.pages(['json']);
             * @example
             * // Enable caching for JavaScript and CSS files
             * server.rendering.cache.enableFor.pages(['js', 'css']);
             * @param extensions 
            */
            pages: (extensions?: RenderingCacheAsset | RenderingCacheAsset[]) => {
                if (extensions === undefined) {
                    this.#_cache.pages.extensions.css = this.#_cache.pages.extensions.js = this.#_cache.pages.extensions.json = true;
                } else {
                    if (typeof extensions === 'string') { extensions = [extensions] }

                    for (const ext of extensions) {
                        if (Object.keys(this.#_cache).includes(ext)) {
                            this.#_cache.pages.extensions[ext] = true;
                        } else {
                            throw new Error(`The extension ${ext} is not a supported extension by the rendering cache`)
                        }
                    }
                }
            },
            /**
             * Enable caching for certain files extensions for components
             * @example
             * // Enable caching for all supported files
             * server.rendering.cache.enableFor.components();
             * @example
             * // Enable caching for JSON files
             * server.rendering.cache.enableFor.components(['json']);
             * @example
             * // Enable caching for JavaScript and CSS files
             * server.rendering.cache.enableFor.components(['js', 'css']);
             * @param extensions 
            */
            components: (extensions?: RenderingCacheAsset | RenderingCacheAsset[]) => {
                if (extensions === undefined) {
                    this.#_cache.components.extensions.css = this.#_cache.components.extensions.js = this.#_cache.components.extensions.json = true;
                } else {
                    if (typeof extensions === 'string') { extensions = [extensions] }

                    for (const ext of extensions) {
                        if (Object.keys(this.#_cache).includes(ext)) {
                            this.#_cache.components.extensions[ext] = true;
                        } else {
                            throw new Error(`The extension ${ext} is not a supported extension by the rendering cache`)
                        }
                    }
                }
            },
            /**
             * Enable caching for certain files extensions for global assets
             * @example
             * // Enable caching for all supported files
             * server.rendering.cache.enableFor.globalAssets();
             * @example
             * // Enable caching for JSON files
             * server.rendering.cache.enableFor.globalAssets(['json']);
             * @example
             * // Enable caching for JavaScript and CSS files
             * server.rendering.cache.enableFor.globalAssets(['js', 'css']);
             * @param extensions 
            */
            globalAssets: (extensions?: RenderingCacheAsset | RenderingCacheAsset[]) => {
                if (extensions === undefined) {
                    this.#_cache.globalAssets.extensions.css = this.#_cache.globalAssets.extensions.js = this.#_cache.globalAssets.extensions.json = true;
                } else {
                    if (typeof extensions === 'string') { extensions = [extensions] }

                    for (const ext of extensions) {
                        if (Object.keys(this.#_cache).includes(ext)) {
                            this.#_cache.globalAssets.extensions[ext] = true;
                        } else {
                            throw new Error(`The extension ${ext} is not a supported extension by the rendering cache`)
                        }
                    }
                }
            },
            /**
             * Enable caching for certain files extensions for pages and components
             * @example
             * // Enable caching for all supported files
             * server.rendering.cache.enableFor.everything();
             * @example
             * // Enable caching for JSON files
             * server.rendering.cache.enableFor.everything(['json']);
             * @example
             * // Enable caching for JavaScript and CSS files
             * server.rendering.cache.enableFor.everything(['js', 'css']);
             * @param extensions 
            */
            everything: (extensions?: RenderingCacheAsset | RenderingCacheAsset[]) => {
                this.cache.enableFor.pages(extensions);
                this.cache.enableFor.components(extensions);
                this.cache.enableFor.globalAssets(extensions);
            }
        },
        /**Disable caching for certain assets */
        disableFor: {
            /**
             * Disable caching for certain files extensions for pages
             * @example
             * // Disable caching for all supported files
             * server.rendering.cache.disableFor.pages();
             * @example
             * // Disable caching for JSON files
             * server.rendering.cache.disableFor.pages(['json']);
             * @example
             * // Disable caching for JavaScript and CSS files
             * server.rendering.cache.disableFor.pages(['js', 'css']);
             * @param extensions 
            */
            pages: (extensions?: RenderingCacheAsset | RenderingCacheAsset[]) => {
                if (extensions === undefined) {
                    this.#_cache.pages.extensions.css = this.#_cache.pages.extensions.js = this.#_cache.pages.extensions.json = false;
                } else {
                    if (typeof extensions === 'string') { extensions = [extensions] }

                    for (const ext of extensions) {
                        if (Object.keys(this.#_cache).includes(ext)) {
                            this.#_cache.pages.extensions[ext] = false;
                        } else {
                            throw new Error(`The extension ${ext} is not a supported extension by the rendering cache`)
                        }
                    }
                }
            },
            /**
             * Disable caching for certain files extensions for components
             * @example
             * // Disable caching for all supported files
             * server.rendering.cache.disableFor.components();
             * @example
             * // Disable caching for JSON files
             * server.rendering.cache.disableFor.components(['json']);
             * @example
             * // Disable caching for JavaScript and CSS files
             * server.rendering.cache.disableFor.components(['js', 'css']);
             * @param extensions 
            */
            components: (extensions?: RenderingCacheAsset | RenderingCacheAsset[]) => {
                if (extensions === undefined) {
                    this.#_cache.components.extensions.css = this.#_cache.components.extensions.js = this.#_cache.components.extensions.json = false;
                } else {
                    if (typeof extensions === 'string') { extensions = [extensions] }

                    for (const ext of extensions) {
                        if (Object.keys(this.#_cache).includes(ext)) {
                            this.#_cache.components.extensions[ext] = false;
                        } else {
                            throw new Error(`The extension ${ext} is not a supported extension by the rendering cache`)
                        }
                    }
                }
            },
            /**
             * Disable caching for certain files extensions for global assets
             * @example
             * // Disable caching for all supported files
             * server.rendering.cache.disableFor.globalAssets();
             * @example
             * // Disable caching for JSON files
             * server.rendering.cache.disableFor.globalAssets(['json']);
             * @example
             * // Disable caching for JavaScript and CSS files
             * server.rendering.cache.disableFor.globalAssets(['js', 'css']);
             * @param extensions 
            */
            globalAssets: (extensions?: RenderingCacheAsset | RenderingCacheAsset[]) => {
                if (extensions === undefined) {
                    this.#_cache.globalAssets.extensions.css = this.#_cache.globalAssets.extensions.js = this.#_cache.globalAssets.extensions.json = false;
                } else {
                    if (typeof extensions === 'string') { extensions = [extensions] }

                    for (const ext of extensions) {
                        if (Object.keys(this.#_cache).includes(ext)) {
                            this.#_cache.globalAssets.extensions[ext] = false;
                        } else {
                            throw new Error(`The extension ${ext} is not a supported extension by the rendering cache`)
                        }
                    }
                }
            },
            /**
             * Disable caching for certain files extensions for pages and components
             * @example
             * // Disable caching for all supported files
             * server.rendering.cache.disableFor.everything();
             * @example
             * // Disable caching for JSON files
             * server.rendering.cache.disableFor.everything(['json']);
             * @example
             * // Disable caching for JavaScript and CSS files
             * server.rendering.cache.disableFor.everything(['js', 'css']);
             * @param extensions 
            */
            everything: (extensions?: RenderingCacheAsset | RenderingCacheAsset[]) => {
                this.cache.disableFor.pages(extensions);
                this.cache.disableFor.components(extensions);
                this.cache.disableFor.globalAssets(extensions);
            }
        },
        /**Read the caching status of assets */
        statusOf: {
            /**Read the caching status of supported files extensions for pages */
            pages: () => this.#_cache.pages.extensions,
            /**Read the caching status of supported files extensions for components */
            components: () => this.#_cache.components.extensions,
            /**Read the caching status of supported files extensions for global assets */
            globalAssets: () => this.#_cache.globalAssets.extensions,
            /**Read the caching status of supported files extensions for everything */
            everything: () => {
                return {
                    pages: this.#_cache.pages.extensions,
                    components: this.#_cache.components.extensions,
                    globalAssets: this.#_cache.globalAssets.extensions,
                }
            }
        },
        /**A module to update caching assets */
        update: {
            /**Update the cache of all pages */
            pages: async () => {
                const promises = this.pages.all.map(async page => {
                    const pageStatus = page.cache.status();

                    const enable: PageRenderingCacheAsset[] = [];
                    const disable: PageRenderingCacheAsset[] = [];

                    if (pageStatus.css !== this.#_cache.pages.extensions.css) {
                        if (this.#_cache.pages.extensions.css) { enable.push('css') } else { disable.push('css') }
                    }

                    if (pageStatus.js !== this.#_cache.pages.extensions.js) {
                        if (this.#_cache.pages.extensions.js) { enable.push('js') } else { disable.push('js') }
                    }

                    if (enable.length > 0) { page.cache.enable(enable) }
                    if (disable.length > 0) { page.cache.disable(disable) }

                    await page.cache.update();
                })

                const updateRes = await Promise.allSettled(promises);
                const fullfilled = updateRes.filter(i => i.status === 'fulfilled');
                const rejected = updateRes.filter(i => i.status === 'rejected');

                return {
                    updateType: 'pages',
                    total: updateRes.length,
                    updated: fullfilled.length,
                    failed: { total: rejected.length, errors: rejected.map(i => i.reason) }
                }
            },
            /**Update the cache of all the components */
            components: async () => {
                const promises = this.components.all.map(async component => {
                    const compStatus = component.cache.status();

                    const enable: PageRenderingCacheAsset[] = [];
                    const disable: PageRenderingCacheAsset[] = [];

                    if (compStatus.css !== this.#_cache.components.extensions.css) {
                        if (this.#_cache.components.extensions.css) { enable.push('css') } else { disable.push('css') }
                    }

                    if (compStatus.js !== this.#_cache.components.extensions.js) {
                        if (this.#_cache.components.extensions.js) { enable.push('js') } else { disable.push('js') }
                    }

                    if (enable.length > 0) { component.cache.enable(enable) }
                    if (disable.length > 0) { component.cache.disable(disable) }

                    await component.cache.update();
                })

                const updateRes = await Promise.allSettled(promises);
                const fullfilled = updateRes.filter(i => i.status === 'fulfilled');
                const rejected = updateRes.filter(i => i.status === 'rejected');

                return {
                    updateType: 'components',
                    total: updateRes.length,
                    updated: fullfilled.length,
                    failed: { total: rejected.length, errors: rejected.map(i => i.reason) }
                }
            },
            /**Update the cache of global assets */
            globalAssets: async () => {
                const assetsStatus = this.assets.cache.status();

                const enable: PageRenderingCacheAsset[] = [];
                const disable: PageRenderingCacheAsset[] = [];

                if (assetsStatus.css !== this.#_cache.components.extensions.css) {
                    if (this.#_cache.globalAssets.extensions.css) { enable.push('css') } else { disable.push('css') }
                }

                if (assetsStatus.js !== this.#_cache.components.extensions.js) {
                    if (this.#_cache.globalAssets.extensions.js) { enable.push('js') } else { disable.push('js') }
                }

                if (enable.length > 0) { this.assets.cache.enable(enable) }
                if (disable.length > 0) { this.assets.cache.disable(disable) }

                await this.assets.cache.update();
            },
            /**Update the cache of everything */
            everything: async () => {
                const promises = [this.cache.update.pages(), this.cache.update.components()];
                return Promise.all(promises);
            }
        }
    }
}

export default RenderingManager;
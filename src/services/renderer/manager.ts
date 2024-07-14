import helpers from '../../utils/helpers';
import { InternalScriptRecord, InternalStylesheetRecord, PageRenderingCacheAsset, RenderingCacheAsset } from '../../docs/docs';

import HyperCloudServer from '../../server';
import HyperCloudResponse from '../handler/assets/response';

import Component from './assets/Component';
import Page from './assets/Page';

import pagesManager from './managers/pagesManager';
import compsManager from './managers/componentsManager';

/**
 * This class is used inside a {@link HyperCloudServer} as
 * `{@link HyperCloudServer["rendering"]}`
 */
class RenderingManager {
    readonly #_cache = Object.seal({
        pages: { extensions: { css: false, js: false, json: false } },
        components: { extensions: { css: false, js: false, json: false } }
    })

    readonly #_server: HyperCloudServer;
    readonly #_locals: Record<string, any> = {}
    readonly #_siteName: Record<string, any> = { default: null }
    #_assetsBaseUrl = '/_assets/renderer';

    #_helpers = {
        sendStylesheet: (data: { stylesheet: InternalStylesheetRecord | undefined, isCached: boolean, type: 'Page' | 'Component' }, res: HyperCloudResponse) => {
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
        sendScript: (data: { script: InternalScriptRecord | undefined, isCached: boolean, type: 'Page' | 'Component' }, res: HyperCloudResponse) => {
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
        sendFile: (data: { record: InternalScriptRecord | InternalStylesheetRecord, isCached: boolean, type: 'Page' | 'Component', fileType: 'css' | 'js' }, res: HyperCloudResponse) => {
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

        const router = server.Router();
        router.get(`${this.#_assetsBaseUrl}/components/<:compName>/<:file>`, (req, res, next) => {
            const component = this.components.storage[req.params.compName];
            if (!component) { return next() }

            res.setHeader('Referrer-Policy', 'strict-origin');
            const fileName = req.params.file;
            const fileType = fileName.toLowerCase().endsWith('.js') ? 'js' : fileName.toLowerCase().endsWith('.css') ? 'css' : null;
            if (!fileType) { return next() }

            const scriptFile = component.script.get();
            const stylesheetFile = component.stylesheet.get();
            const file: InternalScriptRecord | InternalStylesheetRecord | undefined = fileType === 'js' ? scriptFile : fileType === 'css' ? stylesheetFile : undefined;
            if (!file) { return next() }

            return this.#_helpers.sendFile({ record: file, isCached: component.cache.status()[fileType], type: 'Component', fileType }, res);
        })

        router.get(`${this.#_assetsBaseUrl}/pages/<:pageId>/<:file>`, (req, res, next) => {
            const page = this.pages.all.find(i => i._id === req.params.pageId);
            if (!page) { return next() }

            res.setHeader('Referrer-Policy', 'strict-origin');
            const fileName = req.params.file;
            const fileType = fileName.toLowerCase().endsWith('.js') ? 'js' : fileName.toLowerCase().endsWith('.css') ? 'css' : null;
            if (!fileType) { return next() }

            const scriptFile = page.scripts.get().find(i => i.scope === 'Internal' && i.fileName === fileName) as InternalScriptRecord | undefined;
            const stylesheetFile = page.stylesheets.get().find(i => i.scope === 'Internal' && i.fileName === fileName) as InternalStylesheetRecord | undefined;
            const file: InternalScriptRecord | InternalStylesheetRecord | undefined = fileType === 'js' ? scriptFile : fileType === 'css' ? stylesheetFile : undefined;
            if (!file) { return next() }

            return this.#_helpers.sendFile({ record: file, isCached: page.cache.status()[fileType], type: 'Page', fileType }, res);
        })
    }

    /**Set or get your site/brand name. This will be used in page rendering */
    readonly siteName = {
        set: (name: string, lang: string = 'default') => {
            if (!helpers.is.validString(name)) { throw new TypeError(`The site name can only a valid string, instead got ${typeof name}`) }
            if (lang !== 'default') {
                if (this.#_server.supportedLanguages.includes(lang)) { throw new SyntaxError(`The site name language ${lang} is not supported by your server. Make sure to set it up first`) }
            }

            this.#_siteName[lang] = name;
        },
        get: (lang: string = 'default') => {
            return this.#_siteName[lang] || this.#_siteName.default;
        }
    }

    readonly components = compsManager;
    readonly pages = pagesManager;

    /**The base URL of the assets used in the renderer */
    get assetsBaseUrl() { return this.#_assetsBaseUrl }

    /**
     * The `server.locals` object has properties that are local
     * variables within the application, and will be available
     * in templates rendered with `{@link HyperCloudResponse.render}`.
     */
    get locals() { return this.#_locals }
    set locals(locals) {
        if (helpers.is.realObject(locals)) {
            for (const localName in locals) {
                this.#_locals[localName] = locals[localName];
            }
        } else {
            throw new TypeError(`The "server.rendering.locals" property expected an object with key:value pairs, but instead got ${typeof locals}`)
        }
    }

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
            }
        },
        /**Read the caching status of assets */
        statusOf: {
            /**Read the caching status of supported files extensions for pages */
            pages: () => this.#_cache.pages,
            /**Read the caching status of supported files extensions for components */
            components: () => this.#_cache.components,
            /**Read the caching status of supported files extensions for everything */
            everything: () => this.#_cache
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
            /**Update the cache of everything */
            everything: async () => {
                const promises = [this.cache.update.pages(), this.cache.update.components()];
                return Promise.all(promises);
            }
        }
    }
}

export default RenderingManager;
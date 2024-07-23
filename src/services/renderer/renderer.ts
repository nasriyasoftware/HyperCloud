import helpers from '../../utils/helpers';
import RenderingManager from './manager';
import engine from 'ejs';
import { ExternalScriptRecord, InternalScriptRecord, OnPageScriptRecord, PageRenderingOptions } from '../../docs/docs';
import Page from './assets/Page';
import HyperCloudRequest from '../handler/assets/request';

class Renderer {
    readonly #_request: HyperCloudRequest;
    readonly #_rendering: RenderingManager;
    readonly #_page: Page;
    readonly #_assetsBaseUrl: string;
    #_rendered = '';

    readonly #_data = {
        title: null as unknown as string,
        description: undefined as undefined | string,
        favicon: undefined as undefined | string,
        thumbnail: undefined as undefined | string,
        keywords: [] as string[],
        stylesheets: [] as string[],
        scripts: [] as string[],
        lang: null as unknown as string,
        dir: 'ltr' as 'ltr' | 'rtl',
        locals: {} as Record<string, any>
    }

    constructor(req: HyperCloudRequest, name: string) {
        this.#_request = req;
        this.#_rendering = req.server.rendering;
        this.#_assetsBaseUrl = this.#_rendering.assetsBaseUrl;

        // Make sure the page name exist
        this.#_page = this.#_rendering.pages.storage[name];
        if (!this.#_page) { throw `The page (${name}) template is not defined` }
    }

    readonly #_helpers = {
        getLocals: (locals: Record<string, any> = {}): Record<string, any> => {
            const mainLocals = { ...this.#_request.server.rendering.assets.locals.get(this.#_data.lang), ...this.#_page.locals.get(this.#_data.lang) }
            return { ...mainLocals, ...(helpers.is.realObject(locals) ? locals : {}), lang: this.#_data.lang, dir: this.#_data.dir }
        },
        validateRenderingOptions: (options?: PageRenderingOptions) => {
            this.#_data.title = (() => {
                if (helpers.is.validString(options?.title)) {
                    return options?.title as string;
                } else {
                    const pageTitle = this.#_page.title.get(this.#_data.lang);
                    const siteName = this.#_rendering.siteName.get(this.#_data.lang);
                    return siteName ? `${pageTitle} | ${siteName}` : pageTitle;
                }
            })()

            this.#_data.description = (() => {
                if (helpers.is.validString(options?.description)) {
                    return options?.description as string;
                } else {
                    const desc = this.#_page.description.get(this.#_data.lang);
                    if (helpers.is.validString(desc)) { return desc }
                }
            })()

            this.#_data.favicon = helpers.is.validString(options?.favicon) ? options?.favicon : undefined;
            this.#_data.thumbnail = helpers.is.validString(options?.thumbnail) ? options?.thumbnail : undefined;
            this.#_data.keywords = (() => {
                if (typeof options?.keywords === 'string' && helpers.is.validString(options?.keywords)) {
                    return Array.from(new Set(options.keywords.split(',')));
                } else if (Array.isArray(options?.keywords)) {
                    return Array.from(new Set(options.keywords))
                } else {
                    return []
                }
            })()

            this.#_data.stylesheets = [
                ...this.#_rendering.assets.stylesheets.get().map(sheet => `<link rel="stylesheet" href="${sheet.scope === 'Internal' ? `${this.#_assetsBaseUrl}/global/css/${sheet.fileName}` : sheet.url}">`),
                ...this.#_page.stylesheets.get().map(sheet => `<link rel="stylesheet" href="${sheet.scope === 'Internal' ? `${this.#_assetsBaseUrl}/pages/${this.#_page._id}/${sheet.fileName}` : sheet.url}">`)
            ]

            const stringifyScript = (script: InternalScriptRecord | ExternalScriptRecord | OnPageScriptRecord, resourceScope: 'Page' | 'Global' = 'Global') => {
                switch (script.scope) {
                    case 'OnPage': {
                        return `<script${script.nomodule ? ' nomodule' : ''}>${script.content}</script>`
                    }

                    case 'Internal': {
                        const attrs = [
                            script.async ? 'async' : '',
                            script.crossorigin ? `crossorigin=${script.crossorigin}` : '',
                            script.defer ? 'defer' : '',
                            script.nomodule ? 'nomodule' : '',
                            script.referrerpolicy ? `referrerpolicy=${script.referrerpolicy}` : '',
                            script.type ? `type="${script.type}"` : ''
                        ].filter(i => i.length > 0);

                        const src = resourceScope === 'Page' ? `${this.#_assetsBaseUrl}/pages/${this.#_page._id}/${script.fileName}` : `${this.#_assetsBaseUrl}/global/js/${script.fileName}`;
                        return `<script src="${src}"${attrs.length > 0 ? ` ${attrs.join(' ')}` : ''}></script>`
                    }

                    case 'External': {
                        const attrs = [
                            script.async ? 'async' : '',
                            script.crossorigin ? `crossorigin=${script.crossorigin}` : '',
                            script.defer ? 'defer' : '',
                            script.nomodule ? 'nomodule' : '',
                            script.referrerpolicy ? `referrerpolicy=${script.referrerpolicy}` : '',
                            script.type ? `type="${script.type}"` : ''
                        ].filter(i => i.length > 0);

                        return `<script src="${script.src}${attrs.length > 0 ? ` ${attrs.join(' ')}` : ''}"></script>`
                    }
                }
            }

            this.#_data.scripts = [
                ...this.#_rendering.assets.scripts.get().map(script => stringifyScript(script)),
                ...this.#_page.scripts.get().map(script => stringifyScript(script, 'Page'))
            ]

            this.#_data.locals = this.#_helpers.getLocals();
        },
        render: {
            page: () => {
                const template = this.#_page.template.content.get();
                const locals = this.#_helpers.getLocals();
                return this.#_helpers.render.withIncludes(template, locals);
            },
            component: async (name: string, locals: Record<string, any>) => {
                const component = this.#_rendering.components.storage[name];
                if (!component) { throw new Error(`The page "${this.#_page.name}" has an undefined component "${name}" in its template`) }

                const stylesheet = component.stylesheet.get();
                if (stylesheet) {
                    const href = `${this.#_assetsBaseUrl}/components/${component.name}/${stylesheet.fileName}`;
                    const existingStylesheet = this.#_data.stylesheets.find(i => i.includes(href));
                    if (!existingStylesheet) {
                        this.#_data.stylesheets.push(`<link rel="stylesheet" href="${href}">`)
                    }
                }

                const script = component.script.get();
                if (script) {
                    const src = `${this.#_assetsBaseUrl}/components/${component.name}/${script.fileName}`;
                    const existingScript = this.#_data.scripts.find(i => i.includes(src));
                    if (!existingScript) {
                        const attrs = [
                            script.async ? 'async' : '',
                            script.crossorigin ? `crossorigin=${script.crossorigin}` : '',
                            script.defer ? 'defer' : '',
                            script.nomodule ? 'nomodule' : '',
                            script.referrerpolicy ? `referrerpolicy=${script.referrerpolicy}` : '',
                            script.type ? `type="${script.type}"` : ''
                        ].map(i => i.length > 0);

                        const tag = `<script src="${src}"${attrs.length > 0 ? ` ${attrs.join(' ')}` : ''}></script>`
                        this.#_data.scripts.push(tag);
                    }
                }

                const componentLocals = component.locals.get(this.#_data.lang);
                const mainLocals: Record<string, any> = (() => {
                    if (Object.keys(componentLocals).length > 0) {
                        return componentLocals;
                    } else if (!helpers.is.undefined(locals)) {
                        return locals;
                    } else {
                        return {}
                    }
                })()

                // if (name === 'socialBar') {
                //     console.log('socialBar locals:', mainLocals);
                //     console.log({ passedLocals: locals, componentLocals, mainLocals })
                // }

                const handler = component.onRender.get();
                if (typeof handler === 'function') {
                    const templateContent = handler(mainLocals, this.#_helpers.render.component, this.#_data.lang);

                    if (typeof templateContent === 'string') {
                        return this.#_helpers.render.withIncludes(templateContent, mainLocals);
                    } else {
                        if (templateContent && typeof templateContent?.then === 'function') {
                            const content = await templateContent.then();
                            if (typeof content === 'string') {
                                return this.#_helpers.render.withIncludes(content, mainLocals);
                            }
                        }

                        throw new Error(`The onRender function of the component (${component.name}) does did not return a string value`)
                    }
                } else {
                    const templateContent = component.template.content.get();
                    return this.#_helpers.render.withIncludes(templateContent, mainLocals);
                }
            },
            withIncludes: async (template: string, locals: Record<string, any>) => {
                try {
                    const includeRegex = /<%-\s*include\(['"](.+?)['"](, ?(.+?))?\)\s*%>/g;
                    let match;
                    let result = '';
                    let lastIndex = 0;

                    const renderInclude = async (match: string, componentName: string, _: any, args: string): Promise<string> => {
                        let includedLocals;

                        if (args) {
                            try {
                                includedLocals = eval(`(${args})`);
                            } catch (error) {
                                console.error('Failed to evaluate arguments for include:', args, error);
                                includedLocals = {};
                            }
                        } else {
                            includedLocals = locals;
                        }

                        return this.#_helpers.render.component(componentName, includedLocals);
                    };

                    while ((match = includeRegex.exec(template)) !== null) {
                        const [fullMatch, componentName, , args] = match;
                        result += template.slice(lastIndex, match.index);
                        lastIndex = includeRegex.lastIndex;

                        try {
                            result += await renderInclude(fullMatch, componentName, null, args);
                        } catch (error) {
                            console.error('Error in renderInclude:', error);
                            throw error;
                        }
                    }

                    result += template.slice(lastIndex);
                    return engine.render(result, locals);
                } catch (error) {
                    throw error;
                }
            }
        },
        html: {
            /**Check the document's `<html>` tag and add the `lang` and `dir` attributes */
            check: () => {
                const hasDocType = this.#_rendered.substring(0, '<!DOCTYPE html>'.length).toLowerCase().startsWith('<!DOCTYPE html>'.toLowerCase());
                if (!hasDocType) { this.#_rendered = `<!DOCTYPE html>\n${this.#_rendered}` }

                const htmlTagStartIndex = this.#_rendered.indexOf('<html');
                const hasHTML = htmlTagStartIndex > -1;

                const newHTMLTag = `<html lang="${this.#_data.lang}" dir="${this.#_data.dir}">`;

                if (hasHTML) {
                    const fromHtml = this.#_rendered.substring(htmlTagStartIndex)
                    const htmlTag = fromHtml.substring(htmlTagStartIndex, fromHtml.indexOf('>') + 1);
                    this.#_rendered = this.#_rendered.replace(htmlTag, newHTMLTag);
                } else {
                    this.#_rendered = `${this.#_rendered.substring(0, `<!DOCTYPE html>\n`.length)}${newHTMLTag}\n${this.#_rendered.replace(`<!DOCTYPE html>\n`, '')}\n</html>`;
                }
            },
            head: {
                /**Check the document's `<head>` tag and add it if necessary */
                check: () => {
                    const htmlTagStartIndex = this.#_rendered.indexOf('<html');
                    const fromHtml = this.#_rendered.substring(htmlTagStartIndex)
                    const htmlTag = fromHtml.substring(htmlTagStartIndex, fromHtml.indexOf('>') + 1);
                    let headStart = this.#_rendered.indexOf('<head>');

                    if (headStart === -1) {
                        this.#_rendered = this.#_rendered.replace(htmlTag, `${htmlTag}\n<head>`);
                        headStart = this.#_rendered.indexOf('<head>');
                        const bodyStart = this.#_rendered.indexOf('<body>');

                        if (bodyStart === -1) {
                            this.#_rendered = this.#_rendered.replace('<head>', '<head>\n</head>\n<body>\n</body>')
                        } else {
                            this.#_rendered = this.#_rendered.replace('<body>', '</head>\n<body>')
                        }
                    }
                },
                content: () => {
                    const headStartIndex = this.#_rendered.indexOf('<head>');
                    const headEndIndex = this.#_rendered.indexOf('</head>');

                    // Extract existing head elements to avoid duplications
                    const headContent = this.#_rendered.substring(headStartIndex + '<head>'.length, headEndIndex);
                    const existingHeadElements = new Set<string>();
                    headContent.replace(/<\/?(title|meta|link|script)[^>]*?>/gi, (match) => {
                        existingHeadElements.add(match);
                        return match;
                    });

                    // Return the existing content
                    return existingHeadElements;
                },
                update: () => {
                    const headStartIndex = this.#_rendered.indexOf('<head>') + '<head>'.length;
                    const headEndIndex = this.#_rendered.indexOf('</head>');
                    const existingHeadElements = this.#_helpers.html.head.content();

                    const metaTags = [...this.#_rendering.assets.metaTags.get(), ...this.#_page.metaTags.get()].map(meta => {
                        const attrs = [];
                        for (const prop in meta.attributes) {
                            const value = meta.attributes[prop];
                            attrs.push(`${prop}${helpers.is.validString(value) ? `="${value}"` : ''}`);
                        }

                        return attrs.length > 0 ? `<meta ${attrs.join(' ')}>` : undefined;
                    }).filter(i => i !== undefined);

                    // Generate new head elements
                    const newHeadElements = [
                        `<meta charset="utf-8">`,
                        `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
                        `<title>${this.#_data.title}</title>`,
                        this.#_data.description ? `<meta name="description" content="${this.#_data.description}">` : '',
                        this.#_data.favicon ? `<link rel="icon" href="${this.#_data.favicon}">` : '',
                        this.#_data.thumbnail ? `<meta property="og:image" content="${this.#_data.thumbnail}">` : '',
                        this.#_data.keywords.length ? `<meta name="keywords" content="${this.#_data.keywords.join(', ')}">` : '',
                        ...metaTags,
                        ...this.#_data.stylesheets,
                        ...this.#_data.scripts
                    ];

                    // Tags to ignore
                    const tagsToIgnore = [
                        '<meta charset="utf-8">',
                        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                        '<title>'
                    ];

                    // Remove existing duplicates and keep new values
                    const filteredNewHeadElements = newHeadElements.filter(element => {
                        const tagName = element.match(/<\/?(title|meta|link|script)[^>]*?>/i);
                        if (tagName && tagName[0]) {
                            const regex = new RegExp(`<${tagName[0]}[^>]*?>`, 'i');
                            existingHeadElements.forEach(existingElement => {
                                if (regex.test(existingElement) && !tagsToIgnore.some(tag => existingElement.startsWith(tag))) {
                                    existingHeadElements.delete(existingElement);
                                }
                            });
                        }
                        return true;
                    });

                    // Combine existing and new head elements
                    const combinedHeadElements = [
                        ...Array.from(existingHeadElements),
                        ...filteredNewHeadElements
                    ].filter(Boolean).join('\n');

                    // Update the head section
                    this.#_rendered = this.#_rendered.slice(0, headStartIndex) + combinedHeadElements + this.#_rendered.slice(headEndIndex);
                }
            }
        }
    }

    /**
     * Render the page
     * @param {PageRenderingOptions} options A `key:value` pairs object for variables
     * @returns {string} The rendered `HTML` page
     */
    async render(options?: PageRenderingOptions): Promise<string> {
        try {
            if (!this.#_rendered) {
                this.#_data.lang = this.#_request.language;
                this.#_data.dir = this.#_data.lang === 'ar' || this.#_data.lang === 'he' ? 'rtl' : 'ltr';

                this.#_helpers.validateRenderingOptions(options);
                this.#_rendered = await this.#_helpers.render.page();
                this.#_helpers.html.check();
                this.#_helpers.html.head.check();
                this.#_helpers.html.head.update();
            }

            return this.#_rendered;
        } catch (error) {
            if (typeof error === 'string') { error = `Failed to render ${this.#_page.name}: ${error}` }
            if (error instanceof Error) { error.message = `Failed to render ${this.#_page.name}: ${error.message}` }
            throw error;
        }
    }
}

export default Renderer;
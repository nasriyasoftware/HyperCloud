const Route = require('./route');
const StaticRoute = require('./staticRoute');

const HyperCloudRequest = require('../../handler/assets/request');
const HyperCloudResponse = require('../../handler/assets/response');
/**
 * Only one instance is allowed for each request.
 * 
 * This instance will handle all the routes based
 * on the request `subDomain` and `path`.
 */
class RequestRoutesManager {
    /**@type {(Route|StaticRoute)[]} */
    #routes = [];
    #currentIndex = -1;

    /**@type {HyperCloudRequest} */
    #request;
    /**@type {HyperCloudResponse} */
    #response;
    #next = () => {
        this.#currentIndex++;
        if (this.#currentIndex <= this.#routes.length) {
            this.#runNext();
        } else {
            return this.#response.pages.notFound();
        }
    }

    /**
     * 
     * @param {(Route|StaticRoute)[]} routes 
     * @param {HyperCloudRequest} request 
     * @param {HyperCloudResponse} response 
     */
    constructor(routes, request, response) {
        this.#routes = routes;
        this.#request = request;
        this.#response = response;

        const newRouts = []
        // Check if the user has a `userSessions` handler configured
        newRouts.push(new Route({
            path: '*', method: 'USE', handler: (request, response, next) => {
                if (typeof request.server._handlers.userSessions === 'function') {
                    return request.server._handlers.userSessions(request, response, next);
                }

                next();
            }
        }));

        // Prepare the language
        newRouts.push(new Route({
            path: '*', method: 'USE', handler: (request, response, next) => {
                const supportedLanguages = this.#response.server.supportedLanguages;
                const defaultLanguage = this.#response.server.defaultLanguage || 'en';

                /**
                 * Check if the user has a preferred language and if it's supported.
                 * If it's not supported, check the rest
                 */
                if (request.user.loggedIn) {
                    const prefLang = request.user.preferences.language;
                    if (supportedLanguages.includes(prefLang)) {
                        request._language = prefLang;
                        return next();
                    }
                }

                const cookieLang = request.cookies.language;
                const queryLang = request.query.lang?.toLowerCase();
                const acceptedLang = request.headers['accept-language']?.split(',');
                const [locale, bLang] = Array.isArray(acceptedLang) ? acceptedLang : ['en-PS', 'ar'];
                const browserLang = bLang?.substring(0, 2).trim();

                request._locale = locale;


                /**
                 * If the query specify a language:
                 * 1) Update the cookie language either by a supported query language or by the default.
                 * 2) Remove the language from the query.
                 * 3) Redirect to the new URL
                 */
                if (typeof queryLang === 'string') {
                    if (supportedLanguages.includes(queryLang)) {                        
                        request._language = queryLang;
                        if (queryLang !== cookieLang) {                            
                            response.cookies.create('language', request.language, { priority: 'Medium' })
                        }

                        // remove "lang" from query
                        const _query = { ...request.query }
                        delete _query.lang;
                        const strQuery = `${Object.entries(_query).map(entry => `${entry[0]}=${entry[1]}`).join('?')}`;
                        const newUrl = request.href.split('?')[0];                        
                        return response.redirect(`${newUrl}${strQuery ? `?${strQuery}` : ''}`)
                    }

                }

                /**
                 * Set the language of the request by the cookie.
                 * if the cookie has an unsupported language.
                 */
                if (typeof cookieLang === 'string') {
                    if (supportedLanguages.includes(cookieLang)) {
                        request._language = cookieLang;
                        return next();
                    }
                }

                /**
                 * If neither the query nor the cookie have the language, 
                 * set the language based on the browser (if supported),
                 * or use the default language.
                */
                request.lang = supportedLanguages.includes(browserLang) ? browserLang : defaultLanguage;
                next();
            }
        }))

        // Prepare the site's color scheme
        newRouts.push(new Route({
            path: '*', method: 'USE', handler: (request, response, next) => {
                const colorScheme = request.cookies.colorScheme;
                if (['Default', 'Light', 'Dark'].includes(colorScheme)) {
                    request._colorScheme = colorScheme;
                } else {
                    response.cookies.create('colorScheme', 'Default', { priority: 'Medium' });
                }

                next();
            }
        }))

        this.#routes.unshift(...newRouts);
        this.#runNext();
    }

    /**
     * This method is only called by the server
     */
    #runNext() {
        // console.log('Running next')
        const route = this.#routes[this.#currentIndex];
        if (route) {
            this.#request.params = route instanceof Route && Object.keys(route.params).length > 0 ? route.params : {};
            route.handler(this.#request, this.#response, this.#next);
        } else {
            this.#next();
        }
    }
}

module.exports = RequestRoutesManager;
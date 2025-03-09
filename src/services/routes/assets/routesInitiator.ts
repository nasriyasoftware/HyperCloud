import Route from './route';
import StaticRoute from './staticRoute';

import HyperCloudRequest from '../../handler/assets/request';
import HyperCloudResponse from '../../handler/assets/response';
import { ColorScheme } from '../../../docs/docs';
import HTTPError from '../../../utils/errors/HTTPError';

/**
 * Only one instance is allowed for each request.
 * 
 * This instance will handle all the routes based
 * on the request `subDomain` and `path`.
 */
class RequestRoutesManager {
    #_currentIndex = -1;
    readonly #_routes: (Route | StaticRoute)[] = [];

    readonly #_request: HyperCloudRequest;
    readonly #_response: HyperCloudResponse;
    readonly #_next = () => {
        this.#_currentIndex++;
        if (this.#_currentIndex <= this.#_routes.length) {
            this.#_runNext();
        } else {
            return this.#_response.pages.notFound();
        }
    }

    constructor(routes: (Route | StaticRoute)[], request: HyperCloudRequest, response: HyperCloudResponse) {
        const staticRoutes = routes.filter(r => r instanceof StaticRoute);
        const dynamicRoutes = routes.filter(r => r instanceof Route);
        this.#_request = request;
        this.#_response = response;

        const newRouts: (Route | StaticRoute)[] = [];
        // Add a helmet handler if it exist
        if (typeof request.server._handlers.helmet === 'function') {
            newRouts.push(new Route({
                path: '*', method: 'USE', handler: (request, response, next) => {
                    return request.server._handlers.helmet(request, response, next);
                }
            }))
        }

        // Check if the user has a `userSessions` handler configured
        if (typeof request.server._handlers.userSessions === 'function') {
            newRouts.push(new Route({
                path: '*', method: 'USE', handler: (request, response, next) => {
                    return request.server._handlers.userSessions(request, response, next);
                }
            }))
        }

        // Prepare the language
        newRouts.push(new Route({
            path: '*', method: 'USE', handler: (request, response, next) => {
                const supportedLanguages = this.#_response.server.languages.supported;
                const defaultLanguages = this.#_response.server.languages.default || 'en';

                /**
                 * Check if the user has a preferred language and if it's supported.
                 * If it's not supported, check the rest
                 */
                if (request.user.loggedIn) {
                    const prefLang = request.user.preferences.language;
                    if (supportedLanguages.includes(prefLang || '')) {
                        request._language = prefLang as string;
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
                request._language = supportedLanguages.includes(browserLang) ? browserLang : defaultLanguages;
                next();
            }
        }))

        // Prepare the site's color scheme
        newRouts.push(new Route({
            path: '*', method: 'USE', handler: (request, response, next) => {
                const colorScheme = request.cookies.colorScheme;
                const isBackendColor = ['Light', 'Dark'].includes(colorScheme);

                // If no valid colorScheme is set, allow client-side detection to handle it
                if (!(typeof colorScheme === 'string' && isBackendColor)) {
                    response.cookies.create('colorScheme', 'Default', {
                        priority: 'Medium',
                        path: '/',
                        domain: `${request.domain}`
                    });
                }
                
                // Assign the detected or default theme to the request object
                request._colorScheme = isBackendColor ? colorScheme as ColorScheme : 'Light';
                next();
            }
        }))

        // Check if the user has defined a logger handler or not;
        if (typeof request.server._handlers.logger === 'function') {
            newRouts.push(new Route({
                path: '*', method: 'USE', handler: (request, response, next) => {
                    return request.server._handlers.logger(request, response, next);
                }
            }))
        }

        // Check if the main rate limiter is configured
        if (typeof request.server._handlers.mainRateLimiter === 'function') {
            dynamicRoutes.unshift(new Route({
                path: '*', method: 'USE', handler: (request, response, next) => {
                    if (request.path.length === 1 && request.path[0] === 'favicon.ico') { return next() }
                    return request.server._handlers.mainRateLimiter(request, response, next);
                }
            }))
        }

        this.#_routes = [...newRouts, ...staticRoutes, ...dynamicRoutes];
        this.#_runNext();
    }

    /**This method is only called by the server */
    #_runNext() {
        const route = this.#_routes[this.#_currentIndex];
        if (route) {
            this.#_request.params = route instanceof Route && Object.keys(route.params).length > 0 ? route.params : {};
            this.#_response._next = this.#_next;
            try {
                route.handler(this.#_request, this.#_response, this.#_next);
            } catch (err) {
                const routeError = new HTTPError({ message: err instanceof Error ? err.message : `An error has occurred in one of your routes`, error: err, request: this.#_request._toJSON(), route });

                const errRoute = new Route({
                    path: route.path.join('/'), method: 'USE', handler: (request, response, next) => {
                        const handler = this.#_request.server._handlers.onHTTPError
                        if (typeof handler === 'function') {
                            try {
                                return handler(request, response, next, routeError);
                            } catch (error) {
                                return response.pages.serverError({
                                    locals: {
                                        title: `Server Error (500)`,
                                        subtitle: 'Server Error (500)',
                                        message: `Ops! We're experiencing some difficulties, please refresh the page or try again later.\n\nIf you're the site owner and the error persisted, please review the your site logs and open an issue on Github.\n\nError Code: 0x00008`
                                    }
                                });
                            }
                        } else {
                            return response.pages.serverError({
                                locals: {
                                    title: `Server Error (500)`,
                                    subtitle: 'Server Error (500)',
                                    message: `Ops! We're experincing some difficulties, pleaes refresh the page or try again later.\n\nIf you're the site owner and the error persisted, please review the your site logs and open an issue on Github.\n\nError Code: 0x00009`
                                }
                            });
                        }
                    }
                })

                this.#_routes.splice(this.#_currentIndex + 1, 0, errRoute);
            }
        } else {
            this.#_next();
        }
    }
}

export default RequestRoutesManager;
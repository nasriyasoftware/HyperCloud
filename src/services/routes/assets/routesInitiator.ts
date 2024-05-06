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
    private _currentIndex = -1;
    private readonly _routes: (Route | StaticRoute)[] = [];

    private readonly _request: HyperCloudRequest;
    private readonly _response: HyperCloudResponse;
    private readonly _next = () => {
        this._currentIndex++;
        if (this._currentIndex <= this._routes.length) {
            this._runNext();
        } else {
            return this._response.pages.notFound();
        }
    }

    constructor(routes: (Route | StaticRoute)[], request: HyperCloudRequest, response: HyperCloudResponse) {
        this._routes = routes;
        this._request = request;
        this._response = response;

        const newRouts: (Route | StaticRoute)[] = [];
        // Check if the user has a `userSessions` handler configured
        if (typeof request.server.__handlers.userSessions === 'function') {
            newRouts.push(new Route({
                path: '*', method: 'USE', handler: (request, response, next) => {
                    return request.server.__handlers.userSessions(request, response, next);
                }
            }))
        }

        // Prepare the language
        newRouts.push(new Route({
            path: '*', method: 'USE', handler: (request, response, next) => {
                const supportedLanguages = this._response.server.supportedLanguages;
                const defaultLanguage = this._response.server.defaultLanguage || 'en';

                /**
                 * Check if the user has a preferred language and if it's supported.
                 * If it's not supported, check the rest
                 */
                if (request.user.loggedIn) {
                    const prefLang = request.user.preferences.language;
                    if (supportedLanguages.includes(prefLang || '')) {
                        request.__language = prefLang as string;
                        return next();
                    }
                }

                const cookieLang = request.cookies.language;
                const queryLang = request.query.lang?.toLowerCase();
                const acceptedLang = request.headers['accept-language']?.split(',');
                const [locale, bLang] = Array.isArray(acceptedLang) ? acceptedLang : ['en-PS', 'ar'];
                const browserLang = bLang?.substring(0, 2).trim();

                request.__locale = locale;


                /**
                 * If the query specify a language:
                 * 1) Update the cookie language either by a supported query language or by the default.
                 * 2) Remove the language from the query.
                 * 3) Redirect to the new URL
                 */
                if (typeof queryLang === 'string') {
                    if (supportedLanguages.includes(queryLang)) {
                        request.__language = queryLang;
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
                        request.__language = cookieLang;
                        return next();
                    }
                }

                /**
                 * If neither the query nor the cookie have the language, 
                 * set the language based on the browser (if supported),
                 * or use the default language.
                */
                request.__language = supportedLanguages.includes(browserLang) ? browserLang : defaultLanguage;
                next();
            }
        }))

        // Prepare the site's color scheme
        newRouts.push(new Route({
            path: '*', method: 'USE', handler: (request, response, next) => {
                const colorScheme = request.cookies.colorScheme;
                if (['Default', 'Light', 'Dark'].includes(colorScheme)) {
                    request.__colorScheme = colorScheme as ColorScheme;
                } else {
                    response.cookies.create('colorScheme', 'Default', { priority: 'Medium' });
                }

                next();
            }
        }))

        // Check if the user has defined a logger handler or not;
        if (typeof request.server.__handlers.logger === 'function') {
            newRouts.push(new Route({
                path: '*', method: 'USE', handler: (request, response, next) => {
                    return request.server.__handlers.logger(request, response, next);
                }
            }))
        }

        this._routes.unshift(...newRouts);
        this._runNext();
    }

    /**This method is only called by the server */
    private _runNext() {
        const route = this._routes[this._currentIndex];
        if (route) {
            this._request.params = route instanceof Route && Object.keys(route.params).length > 0 ? route.params : {};
            try {
                route.handler(this._request, this._response, this._next);
            } catch (err) {
                const routeError = new HTTPError({ message: typeof err?.message === 'string' ? err.message : `An error has occurred in one of your routes`, error: err, request: this._request.__toJSON(), route });
                
                const errRoute = new Route({
                    path: route.path.join('/'), method: 'USE', handler: (request, response, next) => {
                        const handler = this._request.server.__handlers.onHTTPError
                        if (typeof handler === 'function') {
                            try {
                                return handler(request, response, next, routeError);
                            } catch (error) {
                                return response.pages.serverError({
                                    lang: request.server.defaultLanguage,
                                    locals: {
                                        title: `Server Error (500)`,
                                        subtitle: 'Server Error (500)',
                                        message: `Ops! We're experincing some difficulties, pleaes refresh the page or try again later.\n\nIf you're the site owner and the error persisted, please review the your site logs and open an issue on Github.\n\nError Code: 0x00008`
                                    }
                                });
                            }
                        } else {
                            return response.pages.serverError({
                                lang: request.server.defaultLanguage,
                                locals: {
                                    title: `Server Error (500)`,
                                    subtitle: 'Server Error (500)',
                                    message: `Ops! We're experincing some difficulties, pleaes refresh the page or try again later.\n\nIf you're the site owner and the error persisted, please review the your site logs and open an issue on Github.\n\nError Code: 0x00009`
                                }
                            });
                        }
                    }
                })

                this._routes.splice(this._currentIndex + 1, 0, errRoute);
            }
        } else {
            this._next();
        }
    }
}

export default RequestRoutesManager;
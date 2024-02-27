const Route = require('./assets/route');
const HyperCloudRequest = require('../handler/assets/request');

class RoutesManager {
    /**@type {Route[]} */
    #_stack = [];

    /**
     * Add a route to the stack
     * @param {Route} route 
     */
    add(route) {
        if (route instanceof Route) {
            this.#_stack.push(route);
        } else {
            throw new TypeError(`Unable to add route to the routes stack: The provided route is not an instance of Route.`)
        }
    }

    #helpers = Object.freeze({
        match: {
            /**
             * 
             * @param {string} subDomain 
             * @param {Route} route 
             */
            subDomain: (subDomain, route) => {
                if (route.subDomain === '*') { return true }
                if (route.caseSensitive) {
                    return route.subDomain === subDomain
                } else {
                    return route.subDomain.toLowerCase() === subDomain.toLowerCase()
                }
            },
            /**
             * 
             * @param {string[]} path 
             * @param {Route} route 
             */
            path: (path, route) => {
                const response = { valid: false, hasParams: false, params: {} }

                if (route.path[0] === '*') { response.valid = true; return response }
                if (route.path.length !== path.length) { return response }

                for (let i = 0; i < path.length; i++) {
                    const reqPath = path[i];
                    const routePath = route.path[i];

                    const paramsRegex = /<:.*?>/g;
                    const matches = [...routePath.matchAll(paramsRegex)].flat();

                    if (matches.length > 0) {
                        response.hasParams = true;

                        let rtPath = routePath;
                        let rqPath = reqPath;

                        for (let i = 0; i < matches.length; i++) {
                            const match = matches[i]
                            const param = match.substring(2, match.length - 1);
                            rtPath = rtPath.replace(match, '');

                            // Next param
                            const nxtParam = matches[i + 1];
                            if (nxtParam) {
                                /**
                                 * If there's another parameter, determine the separator based
                                 * on the starting index of the next parameter
                                 */

                                /**
                                 * The separator is a string that starts from the beginning
                                 * and ends at the starting index of the next parameter
                                 */
                                const separator = rtPath.substring(0, rtPath.indexOf(nxtParam));
                                const sepIndex = rqPath.indexOf(separator);
                                
                                if (sepIndex > -1) {
                                    // If the separator is present in the request path, extract the value from it then remove it from the `rqPath`.
                                    const value = rqPath.substring(0, sepIndex);
                                    rqPath = rqPath.replace(value, '').replace(separator, '');
                                    response.params[param] = value;
                                } else {
                                    // If the separator doesn't exist in the request path, this means the request doesn't match the route's criteria
                                    return response;
                                }
                            } else {
                                // If no additional parameters available, assign the rest of the path as a value
                                response.params[param] = rqPath;
                            }                            
                        }
                    } else {
                        if (route.caseSensitive) {
                            if (reqPath !== routePath) { return response }
                        } else {
                            if (reqPath.toLowerCase() !== routePath.toLowerCase()) { return response }
                        }
                    }
                }

                response.valid = true; return response;
            }
        }
    })

    /**
     * Use an incoming {@link HyperCloudRequest} to get all matching routes
     * @param {HyperCloudRequest} request 
     * @returns {Route[]}
     */
    match(request) {        
        const subDomain = request.subDomain || '*';
        const path = request.path || [];

        return this.#_stack.filter(route => {
            if (route.method !== 'USE' && route.method !== request.method) { return false }

            if (!this.#helpers.match.subDomain(subDomain, route)) {
                return false;
            }

            const pathRes = this.#helpers.match.path(path, route);
            if (pathRes.valid) {
                if (pathRes.hasParams) { route.params = pathRes.params }
            } else {
                return false;
            }

            return true;
        })
    }
}

module.exports = RoutesManager
const Route = require('./route');
/**
 * Only one instance is allowed for each request.
 * 
 * This instance will handle all the routes based
 * on the request `subDomain` and `path`.
 */
class RequestRoutesManager {
    /**@type {Route[]} */
    #routes = [];
    #currentIndex = 0;

    /**@type {HyperCloudRequest} */
    #request;
    /**@type {HyperCloudResponse} */
    #response;
    #next = () => {        
        this.#currentIndex++;
        if (this.#currentIndex <= this.#routes.length) {
            this.#runNext();
        } else {
            this.#response.pages.notFound();
        }
    }

    /**
     * 
     * @param {Route[]} routes 
     * @param {HyperCloudRequest} request 
     * @param {HyperCloudResponse} response 
     */
    constructor(routes, request, response) {
        this.#routes = routes;
        this.#request = request;
        this.#response = response;
        this.#runNext();
    }

    /**
     * This method is only called by the server
     */
    #runNext() {
        const route = this.#routes[this.#currentIndex];
        if (route) {
            this.#request.params = Object.keys(route.params).length > 0 ? route.params : {};
            route.handler(this.#request, this.#response, this.#next);
        }
    }
}

module.exports = RequestRoutesManager;
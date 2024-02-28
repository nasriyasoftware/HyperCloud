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
            console.log('Opening not found!')            
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
import Route from './assets/route';
import StaticRoute from './assets/staticRoute';
import HyperCloudRequest from '../handler/assets/request';

declare class RoutesManager {
    /**Add a route to the stack */
    add(route: Route | StaticRoute): void;

    /**
     * Use an incoming {@link HyperCloudRequest} to get all matching routes
     * @param {HyperCloudRequest} request
     * @returns {(Route|StaticRoute)[]}
     */
    match(request: HyperCloudRequest): (Route | StaticRoute)[];
}

export default RoutesManager;
import Route from './route';
import StaticRoute from './staticRoute';
import HyperCloudRequest from '../../handler/assets/request';
import HyperCloudResponse from '../../handler/assets/response';
/**
 * Only one instance is allowed for each request.
 *
 * This instance will handle all the routes based
 * on the request `subDomain` and `path`.
 */
declare class RequestRoutesManager {
    #private;
    constructor(routes: (Route | StaticRoute)[], request: HyperCloudRequest, response: HyperCloudResponse);
}
export default RequestRoutesManager;

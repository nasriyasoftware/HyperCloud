import { StaticRouteOptions, HyperCloudRequestHandler } from '../../../docs/docs';

declare class StaticRoute {
    constructor(root: string, options: StaticRouteOptions);

    readonly subDomain: '*' | string;
    readonly caseSensitive: boolean;
    readonly method: 'GET';
    readonly path: string[];
    readonly handler: HyperCloudRequestHandler;
}

export default StaticRoute;
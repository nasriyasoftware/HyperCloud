import { StaticRouteOptions, HyperCloudRequestHandler } from '../../../docs/docs';
declare class StaticRoute {
    #private;
    constructor(root: string, options: StaticRouteOptions);
    get subDomain(): '*' | string;
    get caseSensitive(): boolean;
    get method(): string;
    get path(): string[];
    get handler(): HyperCloudRequestHandler;
}
export default StaticRoute;

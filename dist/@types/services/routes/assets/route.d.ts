import { HttpMethod, HyperCloudRequestHandler, RouteOptions } from '../../../docs/docs';
declare class Route {
    #private;
    constructor(options: RouteOptions);
    get subDomain(): '*' | string;
    get caseSensitive(): boolean;
    get method(): HttpMethod | "USE";
    get path(): string[];
    get handler(): HyperCloudRequestHandler;
    get params(): Record<string, string>;
    set params(value: Record<string, string>);
}
export default Route;

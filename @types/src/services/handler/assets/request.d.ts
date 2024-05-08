import http2 from 'http2';
import { InitializedRequest, ColorScheme, HyperCloudUserOptions, HttpMethod, RequestBodyType } from '../../../docs/docs';
import HyperCloudUser from './user';

/**This class is used internally, not by the user */
declare class HyperCloudRequest {
    constructor(request: InitializedRequest, req: http2.Http2ServerRequest);

    get id(): string;
    get ip(): string;
    get protocol(): 'http' | 'https';
    get host(): string;
    get domain(): string;
    get subDomain(): string | undefined;
    get baseUrl(): string;
    get path(): string[];
    get query(): Record<string, string>;
    get href(): string;
    get bodyType(): RequestBodyType | undefined;
    get body(): string | Record<string, any> | Buffer | undefined;
    get cookies(): Record<string, string>;
    get headers(): http2.IncomingHttpHeaders;
    get aborted(): boolean;
    get authority(): string;
    get closed(): boolean;
    get complete(): boolean;
    get httpVersion(): string;
    get httpVersionMajor(): number;
    get httpVersionMinor(): number;
    get method(): HttpMethod;
    get server(): unknown;

    __toString(): string;
    __toJSON(): Record<string, any>;
    get params(): Record<string, string>;
    set params(value: Record<string, string>)
    get locale(): string;
    set __locale(value: string);
    get language(): string;
    set __language(lang: string);
    get user(): HyperCloudUser;
    set user(options: HyperCloudUserOptions);
    get colorScheme(): ColorScheme;
    set __colorScheme(scheme: ColorScheme);
}

export default HyperCloudRequest;

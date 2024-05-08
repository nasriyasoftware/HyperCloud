import { Protocol } from '../docs/docs';

export declare class SSLCredentials {
    /**The certificate to be used */
    readonly cert: string;
    /**The private key to be used */
    readonly key: string;

    /**
     * Provide a certificate and a key to validate
     * @param credentials
     */
    constructor(credentials: { cert: string; key: string; });
}

export declare class SSLOptions {
    /**The maintainer email address. This must be consistent */
    readonly email: string;
    /**The domain(s) you want to add. At least one */
    readonly domains: string[];
    /**Bind the issued certificate to this name - used the `name` in the `package.json` of the project */
    readonly certName: string;
    /**The path you choose to store the SSL certificate and private key */
    readonly storePath: string;
    /**If `self_signed` is set to `false`, this option has no effect. Enable this option to request a valid testing SSL certificate from Let's Encrypt */
    readonly staging: boolean;
    /**
     * Whether you want to use a self-signed certificate or not.
     * You can use this option if you're using a self-hosted proxy manager
     * (on the same server) that handles SSL for you.
     */
    readonly self_signed: boolean;

    /**
     * @param options
     */
    constructor(options: {
        email: string;
        domains: string[];
        self_signed?: boolean;
        staging?: boolean;
        certName: string;
        storePath?: string;
    });
}

export declare class ProtocolsOptions {   
    constructor(protocols: { https?: Protocol; http?: Protocol; });

    get http(): {
        port: number;
        callback: Function | undefined;
        enabled: boolean;
    };

    get https(): {
        port: number;
        callback: Function | undefined;
        enabled: boolean;
    };
}
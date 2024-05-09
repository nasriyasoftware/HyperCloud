import { SSLOptions } from "../../docs/docs";

/** Represents the SSLManager class */
declare class SSLManager {

    /**
     * Generates SSL certificates.
     * @param options Options for the certificate generation.
     * @returns {Promise<{ key: string; cert: string; }>} - A promise resolving to the generated key and certificate.
     */
    generate(options: SSLOptions): Promise<{ key: string; cert: string; }>;
}

export default SSLManager;
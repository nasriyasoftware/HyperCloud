/** Represents the SSLManager class */
declare class SSLManager {
   
    /**
     * Generates SSL certificates.
     * @param {object} [buildOptions] - Options for the certificate generation.
     * @param {boolean} [buildOptions.force=false] - Whether to force renewal of the certificate.
     * @returns {Promise<{ key: string; cert: string; }>} - A promise resolving to the generated key and certificate.
     */
    generate(buildOptions?: { force?: boolean; }): Promise<{ key: string; cert: string; }>;
}

export default SSLManager;
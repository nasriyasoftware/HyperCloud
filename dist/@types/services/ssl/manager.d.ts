import { SSLOptions } from '../../docs/docs';
declare class SSLManager {
    #private;
    /**
     * @param {object} options
     * @returns {Promise<{key: string;cert: string;}>}
     */
    generate(options: SSLOptions): Promise<{
        key: string;
        cert: string;
    }>;
}
export default SSLManager;

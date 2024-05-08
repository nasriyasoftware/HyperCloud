import HyperCloudServer from './server';
import { ProtocolsOptions, SSLCredentials, SSLOptions } from './utils/classes';
import { Protocols } from './docs/docs';
import hypercloudDNS from 'nasriya-dns';
import nasriyaCron from 'nasriya-cron';

/**HyperCloud class representing the main interface for managing HyperCloud servers and utilities. */
declare class HyperCloud {
    /**
     * Create a new server instance.
     * @returns A new instance of HyperCloudServer.
     */
    Server(): HyperCloudServer;

    /**
     * Create a ProtocolsOptions instance for the server.
     * @param protocols Protocols configuration object.
     * @returns ProtocolsOptions instance.
     */
    Protocols(protocols: Protocols): ProtocolsOptions;

    /**
     * Create SSLCredentials for the ssl option in InitOptions.
     * @param credentials SSL credentials.
     * @returns SSLCredentials instance.
     */
    SSLCredentials(credentials: SSLCredentials): SSLCredentials;

    /**
     * Create SSLOptions for the ssl option in InitOptions.
     * @param options SSL options.
     * @returns SSLOptions instance.
     */
    SSLOptions(options: SSLOptions): SSLOptions;

    /**
     * Generate eTags for all files in a directory.
     * @param root Root directory to generate eTags for.
     * @returns Promise that resolves when eTags are generated.
     * @remarks This process is computationally intensive and may take a long time depending on the number and size of files in the directory.
     */
    generateETags(root: string): Promise<void>;

    /**
     * Set the verbosity status.
     * @param value Verbosity value to set.
     * @remarks This affects all created HyperCloudServer instances.
     */
    set verbose(value: boolean);
    /** Get the verbosity status. */
    get verbose(): boolean;
    /** Get the Nasriya Cron manager instance. */
    get cronManager(): typeof nasriyaCron;
    /** Get the Nasriya DNS manager instance. */
    get dnsManager(): typeof hypercloudDNS;
}

export = HyperCloud;
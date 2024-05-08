import HyperCloudServer from './server';
import { HyperCloudInitFile, HyperCloudManagementOptions, SecureServerOptions, ServerOptions } from './docs/docs';
import hypercloudDNS from 'nasriya-dns';
import nasriyaCron from 'nasriya-cron';

/**HyperCloud class representing the main interface for managing HyperCloud servers and utilities. */
declare class HyperCloud {
    /**
     * Create an HTTP2 HyperCloud server instance and customize it to suite your needs. [Examples](https://github.com/nasriyasoftware/HyperCloud/examples/createServer.md)
     * @param userOptions Pass `SecureServerOptions` or `ServerOptions` to manually configure the server or load the configuration from a file
     * @param managementOptions Management options.
    */
    Server(userOptions?: SecureServerOptions | ServerOptions | HyperCloudInitFile, managementOptions?: HyperCloudManagementOptions): HyperCloudServer;

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
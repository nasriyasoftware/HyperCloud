import HyperCloudServer from './server';
import { HyperCloudInitFile, HyperCloudManagementOptions, SecureServerOptions, ServerOptions } from './docs/docs';
declare class HyperCloud {
    #private;
    /**
     * Create an HTTP2 HyperCloud server instance and customize it to suite your needs. [Examples](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/createServer.md)
     * @param userOptions Pass `SecureServerOptions` or `ServerOptions` to manually configure the server or load the configuration from a file
     * @param managementOptions Management options.
    */
    Server(userOptions?: SecureServerOptions | ServerOptions | HyperCloudInitFile, managementOptions?: HyperCloudManagementOptions): HyperCloudServer;
    get cronManager(): {
        schedule(cronExpression: string, task: Function, options?: import("nasriya-cron/dist/@types/docs/docs").ScheduleOptions | undefined): import("nasriya-cron/dist/@types/docs/docs").ScheduledTask;
        scheduleTime(time: string | number | Date, task: Function): import("nasriya-cron/dist/@types/docs/docs").ScheduledTimedTask;
        getTask(name: string): import("nasriya-cron/dist/@types/docs/docs").ScheduledTask | import("nasriya-cron/dist/@types/docs/docs").ScheduledTimedTask | null;
        readonly tasks: Object;
        readonly time: typeof import("cron-time-generator").CronTime;
    };
    get dnsManager(): {
        readonly helpers: Readonly<{
            getPublicIP: () => Promise<string>;
        }>;
        cloudflare(apiToken: string): import("nasriya-dns/dist/@types/providers/cloudflare/cloudflare").default;
        duckdns(apiToken: string): import("nasriya-dns/dist/@types/providers/duckdns/duckdns").default;
    };
    get verbose(): boolean;
    /**
     * Display extra debugging details in the console. Default is ```false```.
     *
     * **Note:** This affects all created `HyperCloudServer`s.
     * @param {boolean} value
     */
    set verbose(value: boolean);
    /**
     * This method generates eTags for all files in a directory.
     *
     * **Notes:**
     * - This process is computationally intensive and may take a lot of time
     * dependnig on the number and size of files in this directory.
     * - The process will generate an `eTags.json` file in each directory and sub-directory.
     */
    generateETags(root: string): Promise<void>;
}
declare const _instance: HyperCloud;
export default _instance;

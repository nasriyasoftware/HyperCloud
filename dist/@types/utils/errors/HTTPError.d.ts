import Route from "../../services/routes/assets/route";
import StaticRoute from "../../services/routes/assets/staticRoute";
/**
 * This error gets thrown as a result of an error in one of the middleawres
 * and is catched by the `onHTTPError` handler.
 */
declare class HTTPError extends Error {
    /**The name of the error */
    readonly name = "HTTPError";
    /**The request where the error got thrown from */
    readonly request: Record<string, any>;
    /**The Date & Time of the error in ISO string format */
    readonly time: string;
    readonly error: Error | any;
    constructor(data: HTTPErrorOptions);
}
export default HTTPError;
interface HTTPErrorOptions {
    /**A simple, yet descriptive error message. */
    message: string;
    /**A JSON format of the HyperCloud request */
    request: Record<string, any>;
    /**The route of which the error was origintated from */
    route: Route | StaticRoute;
    /**The thrown error */
    error?: any;
}

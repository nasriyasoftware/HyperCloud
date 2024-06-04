"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This error gets thrown as a result of an error in one of the middleawres
 * and is catched by the `onHTTPError` handler.
 */
class HTTPError extends Error {
    /**The name of the error */
    name = 'HTTPError';
    /**The request where the error got thrown from */
    request;
    /**The Date & Time of the error in ISO string format */
    time = new Date().toISOString();
    error;
    constructor(data) {
        super(data.message);
        this.request = data.request;
        this.error = data.error;
    }
}
exports.default = HTTPError;

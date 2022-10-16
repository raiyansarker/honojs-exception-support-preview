import type { StatusCode } from '../utils/http-status';
export declare class Exception extends Error {
    readonly status: StatusCode;
    constructor(message?: string, status?: StatusCode);
}

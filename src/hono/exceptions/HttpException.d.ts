import type { StatusCode } from '../utils/http-status';
import { Exception } from './Exception';
export declare class HttpException extends Exception implements Exception {
    constructor(message: string, status: StatusCode);
}

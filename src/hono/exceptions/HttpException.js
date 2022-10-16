import { Exception } from './Exception';
export class HttpException extends Exception {
    constructor(message, status) {
        super(message, status);
    }
}

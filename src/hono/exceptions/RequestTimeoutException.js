import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class RequestTimeoutException extends Exception {
    constructor(message) {
        super(message || getStatusText(408), 408);
    }
}

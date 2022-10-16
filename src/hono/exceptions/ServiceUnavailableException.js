import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class ServiceUnavailableException extends Exception {
    constructor(message) {
        super(message || getStatusText(503), 503);
    }
}

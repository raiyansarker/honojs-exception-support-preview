import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class HttpVersionNotSupportedException extends Exception {
    constructor(message) {
        super(message || getStatusText(505), 505);
    }
}

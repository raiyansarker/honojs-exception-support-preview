import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class PayloadTooLargeException extends Exception {
    constructor(message) {
        super(message || getStatusText(413), 413);
    }
}

import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class BadGatewayException extends Exception {
    constructor(message) {
        super(message || getStatusText(502), 502);
    }
}

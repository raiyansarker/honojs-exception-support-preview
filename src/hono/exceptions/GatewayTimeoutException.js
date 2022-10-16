import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class GatewayTimeoutException extends Exception {
    constructor(message) {
        super(message || getStatusText(504), 504);
    }
}

import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class UnauthorizedException extends Exception {
    constructor(message) {
        super(message || getStatusText(401), 401);
    }
}

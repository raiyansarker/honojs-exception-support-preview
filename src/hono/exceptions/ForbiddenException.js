import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class ForbiddenException extends Exception {
    constructor(message) {
        super(message || getStatusText(403), 403);
    }
}

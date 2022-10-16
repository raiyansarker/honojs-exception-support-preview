import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class ConflictException extends Exception {
    constructor(message) {
        super(message || getStatusText(409), 409);
    }
}

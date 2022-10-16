import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class BadRequestException extends Exception {
    constructor(message) {
        super(message || getStatusText(400), 400);
    }
}

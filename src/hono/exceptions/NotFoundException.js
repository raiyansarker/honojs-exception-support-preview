import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class NotFoundException extends Exception {
    constructor(message) {
        super(message || getStatusText(404), 404);
    }
}

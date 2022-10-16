import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class MethodNotAllowedException extends Exception {
    constructor(message) {
        super(message || getStatusText(405), 405);
    }
}

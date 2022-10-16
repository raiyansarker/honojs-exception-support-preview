import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class GoneException extends Exception {
    constructor(message) {
        super(message || getStatusText(410), 410);
    }
}

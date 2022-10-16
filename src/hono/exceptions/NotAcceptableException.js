import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class NotAcceptableException extends Exception {
    constructor(message) {
        super(message || getStatusText(406), 406);
    }
}

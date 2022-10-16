import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class NotImplementedException extends Exception {
    constructor(message) {
        super(message || getStatusText(501), 501);
    }
}

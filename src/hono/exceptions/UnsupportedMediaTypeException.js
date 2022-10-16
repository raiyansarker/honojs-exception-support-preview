import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class UnsupportedMediaTypeException extends Exception {
    constructor(message) {
        super(message || getStatusText(415), 415);
    }
}

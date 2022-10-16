import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class InternalServerErrorException extends Exception {
    constructor(message) {
        super(message || getStatusText(500), 500);
    }
}

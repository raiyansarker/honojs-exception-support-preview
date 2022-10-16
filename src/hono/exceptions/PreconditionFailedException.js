import { getStatusText } from '../utils/http-status';
import { Exception } from './Exception';
export class PreconditionFailedException extends Exception {
    constructor(message) {
        super(message || getStatusText(412), 412);
    }
}

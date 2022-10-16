import { getStatusText } from '../utils/http-status';
export class Exception extends Error {
    constructor(message, status = 500) {
        super(message || getStatusText(status));
        this.status = status;
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableException = void 0;
const http_status_1 = require("../utils/http-status");
const Exception_1 = require("./Exception");
class ServiceUnavailableException extends Exception_1.Exception {
    constructor(message) {
        super(message || (0, http_status_1.getStatusText)(503), 503);
    }
}
exports.ServiceUnavailableException = ServiceUnavailableException;

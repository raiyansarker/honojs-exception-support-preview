"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayTimeoutException = void 0;
const http_status_1 = require("../utils/http-status");
const Exception_1 = require("./Exception");
class GatewayTimeoutException extends Exception_1.Exception {
    constructor(message) {
        super(message || (0, http_status_1.getStatusText)(504), 504);
    }
}
exports.GatewayTimeoutException = GatewayTimeoutException;

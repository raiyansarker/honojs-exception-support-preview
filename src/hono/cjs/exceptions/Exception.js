"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exception = void 0;
const http_status_1 = require("../utils/http-status");
class Exception extends Error {
    constructor(message, status = 500) {
        super(message || (0, http_status_1.getStatusText)(status));
        this.status = status;
    }
}
exports.Exception = Exception;

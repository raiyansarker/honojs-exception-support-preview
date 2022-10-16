"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hono = void 0;
const compose_1 = require("./compose");
const context_1 = require("./context");
const Exception_1 = require("./exceptions/Exception");
const request_1 = require("./request");
const router_1 = require("./router");
const router_2 = require("./router");
const reg_exp_router_1 = require("./router/reg-exp-router");
const smart_router_1 = require("./router/smart-router");
const static_router_1 = require("./router/static-router");
const trie_router_1 = require("./router/trie-router");
const url_1 = require("./utils/url");
function defineDynamicClass() {
    return class {
    };
}
class Hono extends defineDynamicClass() {
    constructor(init = {}) {
        super();
        this.router = new smart_router_1.SmartRouter({
            routers: [new static_router_1.StaticRouter(), new reg_exp_router_1.RegExpRouter(), new trie_router_1.TrieRouter()],
        });
        this.strict = true; // strict routing - default is true
        this._tempPath = '';
        this.path = '/';
        this.routes = [];
        this.notFoundHandler = (c) => {
            return c.text('404 Not Found', 404);
        };
        this.errorHandler = (err, c) => {
            if (err instanceof Exception_1.Exception) {
                c.status(err.status);
                return c.text(err.message);
            }
            console.trace(err.message);
            const message = 'Internal Server Error';
            return c.text(message, 500);
        };
        this.handleEvent = (event) => {
            return this.dispatch(event.request, event);
        };
        this.fetch = (request, Environment, executionCtx) => {
            return this.dispatch(request, executionCtx, Environment);
        };
        this.request = async (input, requestInit) => {
            const req = input instanceof Request ? input : new Request(input, requestInit);
            return await this.fetch(req);
        };
        (0, request_1.extendRequestPrototype)();
        const allMethods = [...router_1.METHODS, router_2.METHOD_NAME_ALL_LOWERCASE];
        allMethods.map((method) => {
            this[method] = (args1, ...args) => {
                if (typeof args1 === 'string') {
                    this.path = args1;
                }
                else {
                    this.addRoute(method, this.path, args1);
                }
                args.map((handler) => {
                    if (typeof handler !== 'string') {
                        this.addRoute(method, this.path, handler);
                    }
                });
                return this;
            };
        });
        Object.assign(this, init);
    }
    route(path, app) {
        this._tempPath = path;
        if (app) {
            app.routes.map((r) => {
                this.addRoute(r.method, r.path, r.handler);
            });
            this._tempPath = '';
        }
        return this;
    }
    use(arg1, ...handlers) {
        if (typeof arg1 === 'string') {
            this.path = arg1;
        }
        else {
            handlers.unshift(arg1);
        }
        handlers.map((handler) => {
            this.addRoute(router_2.METHOD_NAME_ALL, this.path, handler);
        });
        return this;
    }
    onError(handler) {
        this.errorHandler = handler;
        return this;
    }
    notFound(handler) {
        this.notFoundHandler = handler;
        return this;
    }
    addRoute(method, path, handler) {
        method = method.toUpperCase();
        if (this._tempPath) {
            path = (0, url_1.mergePath)(this._tempPath, path);
        }
        this.router.add(method, path, handler);
        const r = { path: path, method: method, handler: handler };
        this.routes.push(r);
    }
    matchRoute(method, path) {
        return this.router.match(method, path);
    }
    handleError(err, c) {
        if (err instanceof Error) {
            return this.errorHandler(err, c);
        }
        throw err;
    }
    dispatch(request, eventOrExecutionCtx, env) {
        const path = (0, url_1.getPathFromURL)(request.url, this.strict);
        const method = request.method;
        const result = this.matchRoute(method, path);
        request.paramData = result?.params;
        const c = new context_1.HonoContext(request, env, eventOrExecutionCtx, this.notFoundHandler);
        // Do not `compose` if it has only one handler
        if (result && result.handlers.length === 1) {
            const handler = result.handlers[0];
            let res;
            try {
                res = handler(c, async () => { });
                if (!res)
                    return this.notFoundHandler(c);
            }
            catch (err) {
                return this.handleError(err, c);
            }
            if (res instanceof Response)
                return res;
            return (async () => {
                let awaited;
                try {
                    awaited = await res;
                }
                catch (err) {
                    return this.handleError(err, c);
                }
                if (!awaited) {
                    return this.notFoundHandler(c);
                }
                return awaited;
            })();
        }
        const handlers = result ? result.handlers : [this.notFoundHandler];
        const composed = (0, compose_1.compose)(handlers, this.notFoundHandler, this.errorHandler);
        return (async () => {
            try {
                const tmp = composed(c);
                const context = tmp instanceof Promise ? await tmp : tmp;
                if (!context.finalized) {
                    throw new Error('Context is not finalized. You may forget returning Response object or `await next()`');
                }
                return context.res;
            }
            catch (err) {
                return this.handleError(err, c);
            }
        })();
    }
}
exports.Hono = Hono;

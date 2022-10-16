import { compose } from './compose';
import { HonoContext } from './context';
import { Exception } from './exceptions/Exception';
import { extendRequestPrototype } from './request';
import { METHODS } from './router';
import { METHOD_NAME_ALL, METHOD_NAME_ALL_LOWERCASE } from './router';
import { RegExpRouter } from './router/reg-exp-router';
import { SmartRouter } from './router/smart-router';
import { StaticRouter } from './router/static-router';
import { TrieRouter } from './router/trie-router';
import { getPathFromURL, mergePath } from './utils/url';
function defineDynamicClass() {
    return class {
    };
}
export class Hono extends defineDynamicClass() {
    constructor(init = {}) {
        super();
        this.router = new SmartRouter({
            routers: [new StaticRouter(), new RegExpRouter(), new TrieRouter()],
        });
        this.strict = true; // strict routing - default is true
        this._tempPath = '';
        this.path = '/';
        this.routes = [];
        this.notFoundHandler = (c) => {
            return c.text('404 Not Found', 404);
        };
        this.errorHandler = (err, c) => {
            if (err instanceof Exception) {
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
        extendRequestPrototype();
        const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
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
            this.addRoute(METHOD_NAME_ALL, this.path, handler);
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
            path = mergePath(this._tempPath, path);
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
        const path = getPathFromURL(request.url, this.strict);
        const method = request.method;
        const result = this.matchRoute(method, path);
        request.paramData = result?.params;
        const c = new HonoContext(request, env, eventOrExecutionCtx, this.notFoundHandler);
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
        const composed = compose(handlers, this.notFoundHandler, this.errorHandler);
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

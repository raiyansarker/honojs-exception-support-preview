/// <reference types="@cloudflare/workers-types" />
import type { Context } from './context';
import type { Router } from './router';
export interface ContextVariableMap {
}
export declare type Bindings = Record<string, any>;
export declare type Variables = Record<string, any>;
export declare type Environment = {
    Bindings: Bindings;
    Variables: Variables;
};
export declare type ValidatedData = Record<string, any>;
export declare type Handler<RequestParamKeyType extends string = string, E extends Partial<Environment> = Environment, D extends ValidatedData = ValidatedData> = (c: Context<RequestParamKeyType, E, D>, next: Next) => Response | Promise<Response> | Promise<void> | Promise<Response | undefined>;
export declare type MiddlewareHandler = <E extends Partial<Environment> = Environment>(c: Context<string, E>, next: Next) => Promise<void> | Promise<Response | undefined>;
export declare type NotFoundHandler<E extends Partial<Environment> = Environment> = (c: Context<string, E>) => Response | Promise<Response>;
export declare type ErrorHandler<E extends Partial<Environment> = Environment> = (err: Error, c: Context<string, E>) => Response;
export declare type Next = () => Promise<void>;
declare type ParamKeyName<NameWithPattern> = NameWithPattern extends `${infer Name}{${infer _Pattern}` ? Name : NameWithPattern;
declare type ParamKey<Component> = Component extends `:${infer NameWithPattern}` ? ParamKeyName<NameWithPattern> : never;
declare type ParamKeys<Path> = Path extends `${infer Component}/${infer Rest}` ? ParamKey<Component> | ParamKeys<Rest> : ParamKey<Path>;
interface HandlerInterface<T extends string, E extends Partial<Environment>, U = Hono<E, T>> {
    <Path extends string, Data extends ValidatedData>(...handlers: Handler<ParamKeys<Path> extends never ? string : ParamKeys<Path>, E, Data>[]): U;
    (...handlers: Handler<string, E>[]): U;
    <Path extends string, Data extends ValidatedData>(path: Path, ...handlers: Handler<ParamKeys<Path> extends never ? string : ParamKeys<Path>, E, Data>[]): U;
    (path: string, ...handlers: Handler<string, E>[]): U;
}
interface Route<E extends Partial<Environment> = Environment, D extends ValidatedData = ValidatedData> {
    path: string;
    method: string;
    handler: Handler<string, E, D>;
}
declare const Hono_base: new <E_1 extends Partial<Environment> = Environment, T extends string = string, U = Hono<E_1, T, ValidatedData>>() => {
    all: HandlerInterface<T, E_1, U>;
    get: HandlerInterface<T, E_1, U>;
    post: HandlerInterface<T, E_1, U>;
    put: HandlerInterface<T, E_1, U>;
    delete: HandlerInterface<T, E_1, U>;
    head: HandlerInterface<T, E_1, U>;
    options: HandlerInterface<T, E_1, U>;
    patch: HandlerInterface<T, E_1, U>;
};
export declare class Hono<E extends Partial<Environment> = Environment, P extends string = '/', D extends ValidatedData = ValidatedData> extends Hono_base<E, P, Hono<E, P, D>> {
    readonly router: Router<Handler<string, E, D>>;
    readonly strict: boolean;
    private _tempPath;
    private path;
    routes: Route<E, D>[];
    constructor(init?: Partial<Pick<Hono, 'router' | 'strict'>>);
    private notFoundHandler;
    private errorHandler;
    route(path: string, app?: Hono<any>): Hono<E, P, D>;
    use<Path extends string = string, Data extends ValidatedData = D>(...middleware: Handler<Path, E, Data>[]): Hono<E, Path, Data>;
    use<Path extends string = string, Data extends ValidatedData = D>(arg1: string, ...middleware: Handler<Path, E, Data>[]): Hono<E, Path, D>;
    onError(handler: ErrorHandler<E>): Hono<E, P, D>;
    notFound(handler: NotFoundHandler<E>): Hono<E, P, D>;
    private addRoute;
    private matchRoute;
    private handleError;
    private dispatch;
    handleEvent: (event: FetchEvent) => Response | Promise<Response>;
    fetch: (request: Request, Environment?: E['Bindings'], executionCtx?: ExecutionContext) => Response | Promise<Response>;
    request: (input: RequestInfo, requestInit?: RequestInit) => Promise<Response>;
}
export {};

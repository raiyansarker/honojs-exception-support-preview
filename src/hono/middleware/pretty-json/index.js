export const prettyJSON = (options = { space: 2 }) => {
    return async (c, next) => {
        const pretty = c.req.query('pretty') || c.req.query('pretty') === '' ? true : false;
        c.pretty(pretty, options.space);
        await next();
    };
};

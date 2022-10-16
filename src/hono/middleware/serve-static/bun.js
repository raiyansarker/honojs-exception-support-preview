// @denoify-ignore
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { existsSync } from 'fs';
import { getFilePath } from '../../utils/filepath';
import { getMimeType } from '../../utils/mime';
// @ts-ignore
const { file } = Bun;
const DEFAULT_DOCUMENT = 'index.html';
export const serveStatic = (options = { root: '' }) => {
    return async (c, next) => {
        // Do nothing if Response is already set
        if (c.finalized) {
            await next();
            return;
        }
        const url = new URL(c.req.url);
        let path = getFilePath({
            filename: options.path ?? url.pathname,
            root: options.root,
            defaultDocument: DEFAULT_DOCUMENT,
        });
        path = `./${path}`;
        if (existsSync(path)) {
            const content = file(path);
            if (content) {
                const mimeType = getMimeType(path);
                if (mimeType) {
                    c.header('Content-Type', mimeType);
                }
                // Return Response object
                return c.body(content);
            }
        }
        console.warn(`Static file: ${path} is not found`);
        await next();
        return;
    };
};

import { Hono } from './hono';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Exception,
  HttpException,
} from './hono/exceptions';
import { logger } from './hono/middleware/logger';
import { StatusCode } from './hono/utils/http-status';

const app = new Hono();

app.use('*', logger());

app.get('/', () => {
  throw new ForbiddenException();
});
app.get('/400', () => {
  throw new BadRequestException();
});
app.get('/404', () => {
  throw new NotFoundException();
});
app.get('/custom', () => {
  throw new HttpException('Something is wrong', 500);
});
app.get('/app-error', (c) => {
  return fetch('http://fshdufihsdf.com');
});

// Respond in right format. Customize it to be however you want
// By default, it will respond with text or html, however you like but if json is asked for, it will response with json data
app.onError((err, c) => {
  // Only check exceptions rather than applications errors
  if (err instanceof Exception) {
    c.status(err.status as StatusCode);
    // Check for whether application/json is present in the accept header, as browsers don't include application/json by default
    if (c.req.headers.get('accept')?.includes('application/json')) {
      return c.json({ message: err.message });
    }

    return c.text(err.message);
  }

  // Fallback
  return c.text('Custom Error Message', 500);
});

export default app;

# Added NestJS inspired exception handler.

## Usage:

#### Basic use:

```
app.get('/dashboard', (c) => {
  if (!user) {
    throw new UnauthorizedException();
  }
  ...
});
```

#### Custom Exception

```
app.get('/custom', () => {
  throw new HttpException('Something is wrong', 500);
});
```

## Advance use case:

```
app.onError((err, c) => {
  if (err instanceof Exception) {
    c.status(err.status as StatusCode);
    if (c.req.headers.get('accept')?.includes('application/json')) {
      return c.json({ message: err.message });
    }

    return c.text(err.message);
  }

  return c.text('Custom Error Message', 500);
});
```

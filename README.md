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

```

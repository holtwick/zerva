# 🌱 @zerva/bin

**This is a side project of [Zerva](https://github.com/holtwick/zerva)**

> Command line tool to simplify work with Zerva. For debug and production.

In your `package.json` you might want to add these lines:

```json
"scripts": {
  "start": "zerva",
  "build": "zerva build",
  "serve": "node dist/main.cjs"
},
```

Zerva uses [esbuild](https://esbuild.github.io) to create both the development server code and the production code. You can take advantage of conditional building using [defines](https://esbuild.github.io/api/#define). This can be used to have code that avoids certain imports or otherwise unneed stuff in production mode. I.e. in your code you can do stuff like this:

```ts
if (ZERVA_DEVELEPMENT) {
  /* do something */
}
```

Valid defines are:

- `ZERVA_DEVELOPMENT` is `true` when started as `zerva`
- `ZERVA_PRODUCTION` is `true` when started as `zerva build`

For better compatibility the defines can also be accessed as `process.env.ZERVA_DEVELOPMENT` and `process.env.ZERVA_PRODUCTION`.

```
npm install -D @zerva/bin @zerva/core @zerva/http 
```
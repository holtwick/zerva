# 🌱 Zerva

**Minimal event driven web service infrastructure.**

## Get started

It all starts with the `context` which is the common ground for any **module** we use or create. It serves as a hub/bus for emitting and listening on **events**.

Usually you would start to build a HTTP server like this:

```ts
// main.ts

import { useHttp } from '@zerva/http'

useHttp({
  port: 8080
})

serve()
```

With a `package.json` like the following you get started with `npm start`:

```json
{
  "name": "zerva-example",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "start": "LEVEL=i ZEED=* zerva",
    "build": "zerva build"
  },
  "devDependencies": {
    "@zerva/bin": "*",
    "@zerva/core": "*",
    "@zerva/http": "*"
  }
}
```

## Lifecycle of a module

`serve` itself is a **module** as well. That means it does **emit** and **listen** to **events**. 

`serve` provides the basic life-cycle, which emits the following events in this order:

- `serveInit` to do some preliminary setup
- `serveStart` to actually start a module
- `serveStop` to stop the module or its service
- `serveDispose` to free and dispose objects

Listening to these events works like this:

```ts
import { on } from '@zerva/core'

on('serveStart', async () => {
  console.log('Did start')
})
```

Modules themselves may follow a similar pattern to allow their sub-modules to start in the right moment as well. For example `@zerva/http` module emits `httpInit` which is the used to set up the routes or a Websocket connection for `@zerva/websocket`. You don't have to care a lot about the complexity, since one builds on the other.

By convenstion module initializers start by `use` like `useHttp` or `useWebsocket`.

## Dependencies

Some modules depend on others. To make sure nothing is missing, you should **register** modules like:

```ts
module('websocket', {
  requires: ['http']
}
```

## Config

## Contexts

TBD

## useHttp example

```ts
import { zerva } from '@zerva/core'

function useCounter() {
  let counter = 0
  zerva.on('httpInit', ({ onGET }) => {
    onGET('/counter', () => `Counter ${counter++}`)
  })
}
```

As you can see a **module** is just a function connecting itself to the **context**. But where is the context? Well `context` is set globally. Similarly, as for Vue and React our helper routines like `on` or `emit` make use of it. This is a great simplification while still being a robust approach.

> If you want to use multiple **contexts** just wrap the code using it into `withContext(context, () => { /* your code */ })`.

On `httpInit` we make use of the http-modules specific `get` helper to answer to http-reuests on `/counter`.

To make sure the `http` module is around as well in our context, it is good practice to register oneself and tell about dependencies using `register`:

```ts
function useCounter() {
  register('counter', ['http'])
  let counter = 1
  zerva.on('httpInit', ({ get }) => {
    get(
      '/',
      () => `Counter ${counter++}.<br><br>Reload page to increase counter.`
    )
  })
  return {
    getCounter: () => counter,
  }
}
```

As you can see we can also return some custom data or functions from our module, like `getCounter` in our case.

That's basically it!

## Command line convenience

For convenience, you can use the `zerva` command line tool. It is based on [estrella](https://github.com/rsms/estrella) and translates your Typescript code on the fly without further configuration. It also watches for changes and restarts the server immediately. To build add `build` as first argument. The last argument can point to the entry file (Javascript or Typescript), otherwise `src/main.ts` will be used.

In your `package.json` you might want to add these lines:

```json
{
  "scripts": {
    "start": "zerva",
    "build": "zerva build",
    "serve": "node dist/main.cjs"
  }
}
```

## Docker

Zerva integrates perfectly with Docker. Learn more at [demos/docker](https://github.com/holtwick/zerva/demos/docker).

## Available Modules

- [@zerva/http](zerva-http/README.md)
- [@zerva/http-log](zerva-http-log/README.md)
- [@zerva/mqtt](zerva-mqtt/README.md)
- [@zerva/sqlite](zerva-sqlite/README.md)
- [@zerva/vite](zerva-vite/README.md)
- [@zerva/websocket](zerva-websocket/README.md)

## Conditional building

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

## Related Projects

- [zeed](https://github.com/holtwick/zeed) - Helper lib providing the logging for server
- [zeed-dom](https://github.com/holtwick/zeed-dom) - Lightweight offline DOM

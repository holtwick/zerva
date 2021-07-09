# 🌱 Zerva

**Very compact event driven web service infrastructure.**

## Get started

Set up your first project like this (you may also use yarn or pnpm):

```sh
npm init zerva <your-project-name>
cd <your-project-name>
npm i
npm start
```

## How it works

It all starts with the `context` which is the common ground for any **module** we use or create. It serves as a hub/bus for emitting and listening on **events**. 

Usually you would start to build a server like this:

```ts 
import { useHttp, serve } from "zerva"

useHttp(
  port: 8080
})

serve()
```

`serve` itself is a **module** that i.e. it is a function working on **context**. It takes a function to call other modules and provides a common lifecycle by emitting `serveInit` and `serveStart`. These are the entry points for other services.

`useHttp` for example will set up an [express]() server and start it on `serveStart`. It will emit `httpInit` before it starts and `httpRunning` when it is ready. 

> By convention, we add `use` to module initializer to be able to identify them at first glance.

You can write your own module which can use `httpInit` to add some listeners:

```ts
function useCounter() {
  let counter = 0
  on('httpInit', ({get}) => {
    get('/counter', () => `Counter ${counter++}`)
  })
}
```

As you can see a **module** is just a function connecting itself to the **context**. But where is the context? Well `context` is set globally. Similarly, as for Vue and React our helper routines like `on` or `emit` make use of it. This is a great simplification while still being a robust approach.

> If you want to use multiple **contexts** just wrap the code using it into `withContext(context, () => { /* your code */ })`.

On `httpInit` we make use of the http-modules specific `get` helper to answer to http-reuests on `/counter`.

To make sure the `http` module is around as well in our context, it is good practice to register oneself and tell about dependencies using `register`:

```ts
function useCounter() {
  register("counter", ["http"])
  let counter = 1
  on("httpInit", ({ get }) => {
    get(
      "/",
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

For convenience, you can use the `zerva` command line tool. It is based on [estrella](https://github.com/rsms/estrella) and translates your Typescript code on the fly without further configuration. It also watches for changes and restarts the server immediately. 

In your `package.json` you might want to add these lines:

```json
"scripts": {
  "start": "zerva index.ts"
},
```



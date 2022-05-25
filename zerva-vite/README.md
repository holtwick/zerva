# 🌱 Zerva useVite

**This is a side project of [Zerva](https://github.com/holtwick/zerva)**

> Integrate [Vite](https://vitejs.dev/) development server including HMR etc.

Basically it is using the approach [described here](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server).

Use it like this in your project:

```ts
useVite({
  root: ".", // default: process.cwd()
  www: "./dist_www", // default: ./dist_www
})
```

Where `root` is the path to the Vite project that should be served.

`www` would be the path where the Vite build should go to, to be served by Zerva. These are usually the generated files that land in `dist` but you can change the destination in the `vite.config.ts`via [`build.outDir`](https://vitejs.dev/config/#build-outdir).

## Usage

Usually you will use the `zerva` tool and everything is set up for you then. If you are not using a compile step, you'll need to activate the vite devoloper mode by setting then environment variable `ZERVA_VITE=1` instead.

## Directory structure

You should try to have 2 separate projects, one for your Vite code and one for your Zerva code. The reason is, you will very likely have different dependencies to 3rd party modules in both projects. You also do not want to blow up the server side code too much with Vite build tools etc.

You have these choices:

1. Put both in the same directory and share the dependencies (not recommended).
2. Have Zerva project in a subdirectory.
3. Have Vite project in a subdirectory.
4. Have subdirectories for both, side by side.

Usually option 2 works quite well. See [demo code](./demo).

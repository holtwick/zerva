# 🌱 @zerva/vite

[![npm version](https://img.shields.io/npm/v/@zerva/vite.svg)](https://www.npmjs.com/package/@zerva/vite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Seamlessly integrate [Vite](https://vitejs.dev/) development server with [Zerva](https://github.com/holtwick/zerva)**

This package provides a bridge between Vite's powerful development server (with HMR, fast builds, and modern tooling) and Zerva's server-side capabilities, giving you the best of both worlds for full-stack development.

## ✨ Features

- 🔥 **Hot Module Replacement (HMR)** in development mode
- ⚡ **Lightning-fast** Vite development server integration
- 📦 **Production-ready** static file serving with caching
- 🚀 **Multi-page application** support
- 🔄 **Automatic mode switching** between development and production
- 🎯 **Zero configuration** for most use cases
- 🛠️ **TypeScript support** out of the box

## 📦 Installation

```bash
npm install @zerva/vite vite
# or
pnpm add @zerva/vite vite
# or
yarn add @zerva/vite vite
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useVite } from '@zerva/vite'

// Setup HTTP server
useHttp({
  port: 3000,
  openBrowser: true,
})

// Integrate Vite
useVite()

// Start the server
serve()
```

That's it! Your Vite project will be served with HMR in development mode, and as optimized static files in production.

## ⚙️ Configuration

### Configuration Options

```typescript
useVite({
  // Path to your Vite project (default: process.cwd())
  root: './frontend',
  
  // Output directory for built files (default: './dist_www')
  www: './dist',
  
  // Vite mode: 'development' | 'production' (auto-detected)
  mode: 'development',
  
  // Enable asset caching in production (default: true)
  cacheAssets: true,
  
  // Optional logging configuration
  log: { level: 'info' }
})
```

### Environment Variables

- `ZERVA_DEVELOPMENT`: Set to enable development mode
- `ZERVA_VITE`: Alternative way to enable Vite development mode
- `NODE_ENV`: Affects mode detection

## 🏗️ Project Structure

### Recommended Structure

For optimal organization, keep all source code in a `src` folder with Zerva server code in `src/zerva`:

```
my-app/
├── src/
│   ├── components/     # Frontend components
│   ├── pages/         # Frontend pages
│   ├── styles/        # CSS/styling files
│   ├── utils/         # Shared utilities
│   ├── zerva/         # Zerva server code
│   │   ├── index.ts   # Server entry point
│   │   └── modules/   # Server modules
│   └── main.ts        # Frontend entry point
├── public/            # Static assets
├── index.html         # Main HTML template
├── package.json
├── vite.config.ts
└── dist_www/         # Built frontend files (auto-generated)
```

### Configuration Example

**Server (`src/zerva/index.ts`)**:
```typescript
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useVite } from '@zerva/vite'

useHttp({ port: 3000 })

useVite({
  root: '.',           // Project root (where vite.config.ts is)
  www: './dist_www'    // Where built files go
})

serve()
```

**Vite Config (`vite.config.ts`)**:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // or your preferred framework

export default defineConfig({
  plugins: [vue()],
  root: '.',                    // Project root
  build: {
    outDir: 'dist_www',         // Match the 'www' path in useVite()
  },
  server: {
    // Development server will be handled by Zerva
  }
})
```

## 🔄 Development vs Production

### Development Mode
- Vite dev server runs with HMR
- Instant updates and fast builds
- Source maps and debugging support
- Automatic reload on file changes

### Production Mode
- Serves pre-built static files
- Aggressive caching with `max-age=31536000, immutable`
- Optimized asset delivery
- Multi-page app routing support

## 🌐 Multi-Page Applications

The package includes built-in support for multi-page applications:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
      }
    }
  }
})
```

Routes like `/admin/settings` will automatically serve `/admin/index.html`.

## 🛠️ Advanced Usage

### Custom Vite Plugin Integration

```typescript
import { zervaMultiPageAppIndexRouting } from '@zerva/vite'

// In your vite.config.ts
export default defineConfig({
  plugins: [
    vue(),
    zervaMultiPageAppIndexRouting(), // Already included automatically
    // Your other plugins...
  ]
})
```

### Conditional Development Setup

```typescript
import { useVite } from '@zerva/vite'

// Only use Vite integration in development
if (process.env.NODE_ENV === 'development') {
  useVite({
    root: './src-web',
    cacheAssets: false, // Disable caching in dev
  })
}
```

## 🧪 Testing

The package includes comprehensive tests covering:
- Development and production modes
- Configuration validation  
- Multi-page routing
- Error handling
- Asset caching

Run tests with:
```bash
pnpm test
```

## 📚 Examples

Check out the [examples directory](https://github.com/holtwick/zerva/tree/main/examples) in the main Zerva repository:

- [**Basic Vite + Vue**](https://github.com/holtwick/zerva/tree/main/examples/vite) - Vue 3 + TypeScript + Vite
- [**PWA Example**](https://github.com/holtwick/zerva/tree/main/examples/vite-pwa) - Progressive Web App setup
- [**Service Worker**](https://github.com/holtwick/zerva/tree/main/examples/vite-serviceworker) - Advanced caching strategies

## 🤝 Related Packages

- [`@zerva/core`](https://www.npmjs.com/package/@zerva/core) - Core Zerva functionality
- [`@zerva/http`](https://www.npmjs.com/package/@zerva/http) - HTTP server (required)
- [`@zerva/bin`](https://www.npmjs.com/package/@zerva/bin) - Command-line tools

## 📄 License

MIT License - see [LICENSE](https://github.com/holtwick/zerva/blob/main/LICENSE) file for details.

## 🙋‍♂️ Support

- 📖 [Documentation](https://github.com/holtwick/zerva)
- 🐛 [Bug Reports](https://github.com/holtwick/zerva/issues)
- 💬 [Discussions](https://github.com/holtwick/zerva/discussions)
- ❤️ [Sponsor](https://github.com/sponsors/holtwick)

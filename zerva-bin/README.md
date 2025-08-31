# 🌱 @zerva/bin

[![npm version](https://img.shields.io/npm/v/@zerva/bin.svg)](https://www.npmjs.com/package/@zerva/bin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Command-line development and build tool for [Zerva](https://github.com/holtwick/zerva) applications**

A powerful CLI that streamlines your Zerva development workflow with hot-reload development server, optimized production builds, and seamless TypeScript compilation using [esbuild](https://esbuild.github.io).

## ✨ Features

- 🚀 **Lightning-fast development server** with automatic restarts
- 🔄 **Hot-reload on file changes** - no more manual restarts
- ⚡ **Blazing-fast builds** powered by esbuild
- 📦 **Zero configuration** - works out of the box
- 🛠️ **Full TypeScript support** with source maps
- 🎯 **Conditional compilation** with build-time defines
- 🔧 **Flexible configuration** via config files
- 👀 **File watching** with intelligent rebuild detection
- 🐛 **Development-friendly** error reporting and notifications

## 📦 Installation

```bash
npm install -D @zerva/bin
# or
pnpm add -D @zerva/bin
# or  
yarn add -D @zerva/bin
```

## 🚀 Quick Start

### Basic Package.json Setup

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "zerva",
    "build": "zerva build", 
    "start": "node dist/main.cjs"
  }
}
```

### Create Your First Server

**src/main.ts**:
```typescript
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'

// Setup HTTP server
useHttp({
  port: 3000,
  showServerInfo: true
})

// Start the server
serve()
```

### Run Development Server

```bash
npm run dev
# Development server starts with hot-reload
# 🚀 Zerva: Starting app
# 🌐 Zerva: http://localhost:3000 (🚧 DEVELOPMENT)
```

## 📋 Commands

### Development Mode
```bash
zerva                    # Start development server with hot-reload
zerva [entry-file]       # Use custom entry point (default: src/main.ts)
```

### Production Build
```bash
zerva build              # Build for production (outputs to dist/)
zerva build --outfile dist/server.js  # Custom output file
```

### Configuration Options
```bash
zerva --help             # Show all available options
zerva --debug            # Enable debug logging
zerva --port 8080        # Override default port
zerva --open             # Open browser automatically
```

## ⚙️ Configuration

### Command Line Arguments

`@zerva/bin` is primarily configured through command-line arguments:

```bash
zerva [options] <entryFile>

Options:
--build, -b         Build for production (else run development server)
--outfile, -o       Target output file (default: dist/main.cjs)
--cjs               Build CommonJS format (default is ESM)
--open, -s          Open browser automatically
--no-sourcemap     Disable source maps
--external=name     Exclude package from bundle
--loader=.ext:type  File loaders (e.g., --loader=.svg:text)
--define=key:value  Text replacement (e.g., --define=API_URL:'"https://api.com"')
--esbuild=key:value Additional esbuild configuration
--node=arg          Node.js command line arguments
--mode=mode         Set ZERVA_MODE (development/production)
--bun               Execute with Bun runtime
--deno              Execute with Deno runtime
--debug             Enable debug logging
--help              Show help
```

### Configuration File (Optional)

Create `zerva.conf.js` in your project root for persistent configuration:

```javascript
// zerva.conf.js
module.exports = {
  // Entry point (default: src/main.ts)
  entry: './src/server.ts',
  
  // Output file for production build
  outfile: './dist/app.cjs',
  
  // Open browser automatically
  open: true,
  
  // External packages to exclude from bundle
  external: ['fsevents', 'sharp'],
  
  // Custom loaders
  loader: {
    '.svg': 'text',
    '.yaml': 'text'
  },
  
  // Build-time defines
  define: {
    'API_URL': '"https://api.example.com"',
    'VERSION': '"1.0.0"'
  }
}
```

### Environment Variables

- `NODE_ENV`: Automatically set to `development` or `production`
- `ZERVA_MODE`: Set to `development` or `production`
- `ZERVA_VERSION`: Package version information

## 🔧 Conditional Compilation

Take advantage of build-time defines for conditional code:

```typescript
// This code only runs in development
if (ZERVA_DEVELOPMENT) {
  console.log('Development mode - enabling debug features')
  // Import dev-only modules, enable debug logging, etc.
}

// This code only runs in production  
if (ZERVA_PRODUCTION) {
  // Optimize for production, disable debug features
  console.log('Production mode - optimizations enabled')
}
```

### Available Defines

- `ZERVA_DEVELOPMENT`: `true` in development mode (`zerva`)
- `ZERVA_PRODUCTION`: `true` in production builds (`zerva build`)

### Process.env Alternative

For better compatibility, defines are also available as environment variables:

```typescript
if (process.env.ZERVA_DEVELOPMENT === 'true') {
  // Development-only code
}

if (process.env.ZERVA_PRODUCTION === 'true') {  
  // Production-only code
}
```

## 🏗️ Project Structure

### Recommended Structure

```
my-zerva-app/
├── src/
│   ├── main.ts          # Entry point
│   ├── routes/          # HTTP routes  
│   ├── services/        # Business logic
│   ├── utils/           # Shared utilities
│   └── types/           # TypeScript types
├── dist/                # Built files (auto-generated)
├── public/              # Static assets
├── package.json
├── zerva.conf.js        # Optional configuration
└── tsconfig.json
```

### Custom Build Configuration

For more advanced builds, use command-line options or the config file:

```javascript
// zerva.conf.js
module.exports = {
  entry: './src/main.ts',
  outfile: './dist/server.cjs',
  external: ['sharp', 'fsevents'], // Exclude native modules
  define: {
    'process.env.API_URL': '"https://prod-api.com"',
    'DEBUG': 'false'
  }
}
```

## 🔄 Development Workflow

### Development Server Features

- **Automatic Restarts**: File changes trigger immediate rebuilds and restarts
- **Error Notifications**: Desktop notifications for build errors (macOS)  
- **Source Maps**: Full debugging support with original source locations
- **Fast Builds**: esbuild ensures sub-second build times
- **Intelligent Watching**: Only rebuilds when necessary

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Build Speed | ⚡ Instant | 🚀 Optimized |
| Source Maps | ✅ Always | ✅ Optional (default: enabled) |
| Minification | ❌ Disabled | ✅ Enabled |
| Tree Shaking | ❌ Disabled | ✅ Enabled |
| File Watching | ✅ Enabled | ❌ Disabled |
| Hot Restart | ✅ Auto | ❌ Manual |

## 🛠️ Advanced Usage

### Custom esbuild Configuration

Configure esbuild options through CLI arguments or config file:

```bash
# Via command line
zerva --external=sharp --loader=.svg:text --define=API_URL:'"prod.com"'

# Or via config file
```

```javascript
// zerva.conf.js
module.exports = {
  external: ['fsevents', 'sharp'], // Exclude problematic packages
  loader: {
    '.svg': 'text',
    '.yaml': 'text'
  },
  define: {
    'process.env.API_URL': '"https://api.example.com"',
    'DEBUG_MODE': 'false'
  }
}
```

### Integration with Other Tools

```typescript
// Use with PM2 for production
{
  "scripts": {
    "dev": "zerva",
    "build": "zerva build",
    "start": "pm2 start dist/main.cjs",
    "prod": "npm run build && npm run start"
  }
}
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.mjs"]
```

## 🧪 Testing

Run the built application to ensure it works correctly:

```bash
npm run build  # Build the application
npm run start  # Test the built application
```

### Example Test Setup

```typescript
// tests/server.test.ts
import { spawn } from 'child_process'

describe('Server', () => {
  test('builds without errors', async () => {
    const build = spawn('npm', ['run', 'build'])
    const exitCode = await new Promise(resolve => {
      build.on('close', resolve)
    })
    expect(exitCode).toBe(0)
  })
})
```

## 📚 Examples

Check out the [examples directory](https://github.com/holtwick/zerva/tree/main/examples) in the main Zerva repository:

- [**Basic Server**](https://github.com/holtwick/zerva/tree/main/examples/bin) - Simple HTTP server with zerva-bin
- [**Minimal Setup**](https://github.com/holtwick/zerva/tree/main/examples/minimal) - Barebones configuration
- [**Full-Stack App**](https://github.com/holtwick/zerva/tree/main/examples/vite) - Complete app with frontend

## 🚨 Common Issues

### Port Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
zerva --port 8080
```

### Module Resolution Issues

```javascript
// zerva.conf.js - Add to external array
module.exports = {
  external: ['fsevents', 'lightningcss'] // Exclude problematic packages
}
```

### TypeScript Errors

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

## 🤝 Related Packages

- [`@zerva/core`](https://www.npmjs.com/package/@zerva/core) - Core Zerva functionality
- [`@zerva/http`](https://www.npmjs.com/package/@zerva/http) - HTTP server capabilities
- [`@zerva/vite`](https://www.npmjs.com/package/@zerva/vite) - Vite development server integration

## 📄 License

MIT License - see [LICENSE](https://github.com/holtwick/zerva/blob/main/LICENSE) file for details.

## 🙋‍♂️ Support

- 📖 [Documentation](https://github.com/holtwick/zerva)
- 🐛 [Bug Reports](https://github.com/holtwick/zerva/issues)  
- 💬 [Discussions](https://github.com/holtwick/zerva/discussions)
- ❤️ [Sponsor](https://github.com/sponsors/holtwick)

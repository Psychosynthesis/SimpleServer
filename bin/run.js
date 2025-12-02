#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspect } from 'node:util';

import { startServer } from '../server.js';
import { COLORS, isErrorWithCode, isErrorWithMessage } from '../shared/index.js';

function printHelp() {
  console.log(`
Dispense is a simple web-server based on Express.js
Usage:
  ${COLORS.cyan}dispense run [options]${COLORS.reset}

Options:
  -a,   --api <path>        Path to modules with custom apiRouter (use typical express.js syntax)
  -p,   --port <number>     Port to listen on (default: 3000 or process.env.PORT)
  -d,   --public <path>     Static directory to serve (default: ./public)
  -nsh, --no-sec-headers    Disable security headers middleware
  -o   --origins <list>     Comma-separated list of Allowed API origins
  -h,   --help              Show this help

Examples:${COLORS.cyan}
  dispense run
  dispense --port 4000 --public ./Public
  dispense --no-sec-headers
  dispense -a ./routes/api.router.js
  dispense --origins http://localhost:3000,https://example.com
  pm2 start dispense --name dev-server -- run --port 3000 --public ./your-dir

${COLORS.red}Please don't use this in production.${COLORS.reset}`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = {
    command: 'run',
    port: undefined,
    publicDir: './public',
    apiRouterPath: undefined,
    enableSecurityHeaders: true,
    allowedApiOrigins: undefined
  };

  if (args.length > 0 && !args[0].startsWith('-')) {
    result.command = args[0];
    args.shift();
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const noParam = !args[i + 1];

    switch (arg) {
      case '--api':
      case '-a': {
        if (noParam) {
          console.error('Path is required after --api, for example: --api ./api.router.js');
          process.exit(1);
        }
        result.apiRouterPath = args[i + 1];
        i += 1;
        continue;
      }

      case '-p':
      case '--port': {
        if (noParam) {
          console.error('Port value is required after --port');
          process.exit(1);
        }
        result.port = Number(args[i + 1]);
        i += 1;
        continue;
      }

      case '-d':
      case '--public': {
        if (noParam) {
          console.error('Path value is required after --public');
          process.exit(1);
        }
        result.publicDir = args[i + 1];
        i += 1;
        continue;
      }

      case '-nsh':
      case '--no-sec-headers': {
        result.enableSecurityHeaders = false;
        continue;
      }

      case '-o':
      case '--origins': {
        if (noParam) {
          console.error('Value is required after --origins, for example: -ao http://127.0.0.100:3000');
          process.exit(1);
        }

        const raw = args[i + 1];
        const origins = raw
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        if (origins.length === 0) {
          console.error('At least one origin must be specified for --origins, for example: -ao http://127.0.0.100:3000');
          process.exit(1);
        }

        result.allowedApiOrigins = origins;
        i += 1;
        continue;
      }

      case '-h':
      case 'help':
      case '--help': {
        result.command = 'help';
        continue;
      }

      default:
        console.error(`${COLORS.red}Dispense get unknown argument.\n Use -h to see available commands.${COLORS.reset}`);
        process.exit(1);
    }
  }

  return result;
}

async function main() {
  const {
    command,
    port,
    publicDir,
    apiRouterPath,
    enableSecurityHeaders,
    allowedApiOrigins
  } = parseArgs(process.argv);

  if (command === 'help') {
    printHelp();
    return;
  }

  if (command !== 'run') {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  let customApiRouter;

  if (apiRouterPath) {
    const resolvedPath = path.resolve(process.cwd(), apiRouterPath);

    let imported;
    try {
      const fileUrl = pathToFileURL(resolvedPath).href;
      imported = await import(fileUrl);
    } catch (err) {
      console.error(`${COLORS.red}Failed to load custom API router from ${COLORS.cyan}${resolvedPath}${COLORS.reset}\n`);
      if (isErrorWithMessage(err) || isErrorWithCode(err)){
        isErrorWithCode(err) && console.error(`${COLORS.red}Error code:${COLORS.reset} ${err.code}`);
        isErrorWithMessage(err) && console.error(`${COLORS.red}Info:${COLORS.reset} ${err.message}`);
      } else {
        console.error(inspect(err, { depth: 5, colors: true }));
      }
      process.exit(1);
    }

    const maybeRouter = imported.default ?? imported.router ?? imported.apiRouter;

    if (typeof maybeRouter !== 'function') {
      console.error('Custom API router module must export an Express router (default export or named export "router" / "apiRouter").');
      process.exit(1);
    }

    customApiRouter = maybeRouter;
  }

  startServer({
    port,
    publicDir,
    customApiRouter,
    enableSecurityHeaders,
    allowedApiOrigins
  });
}

main();

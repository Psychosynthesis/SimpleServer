import cors from 'cors';
import express from 'express';
import { inspect } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { getDateTime } from 'vanicom';

import { setSecurityHeaders } from './middlewares/index.js';
import apiRouter from './routes/api.router.js';
import { createFrontendRouter } from './routes/frontend.router.js';
import { DEFAULT_ALLOWED_ORIGINS, COLORS, isProd, getStartMessage } from './shared/index.js';

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err?.status || 500;
  const message = err instanceof Error ? err.message : 'Unknown error';

  if (parseInt(status, 10) === 401) {
    const ipChain = req.headers['x-forwarded-for']
      ? req.headers['x-forwarded-for']
      : req.ip;

    console.warn(`[${getDateTime()}] ${COLORS.red}Failed authorization attempt from:${COLORS.reset} ${ipChain}`);
    console.warn(`------------- User-Agent: ${req.get('User-Agent')?.substring(0, 80)}, OriginalUrl: ${req.originalUrl}`);
  } else {
    console.error(`[${getDateTime()}] ${COLORS.red}Unhandled error:`, inspect(err, { depth: null, colors: true }), COLORS.reset);
  }

  res.status(status).json({
    success: false,
    message:
      status === 500
        ? (isProd ? 'Internal server error. Please contact support.' : message) // На проде всегда отдаём заглушку
        : message,
    errorId: Date.now()
  });
};

export function createServer(options = {}) {
  const {
    publicDir = './public',
    apiBasePath = '/api',
    allowedApiOrigins = DEFAULT_ALLOWED_ORIGINS,
    enableSecurityHeaders = false,
    customApiRouter
  } = options;

  const app = express();

  if (enableSecurityHeaders) app.use(setSecurityHeaders);

  // Статика и фронтенд-роуты
  app.use('/', cors({ origin: true, credentials: true }), createFrontendRouter(publicDir));
  // Разрешить любой домен для статики, но не "*" - это нужно чтобы корректно передавались
  // креды, т.к. одновременно { origin: '*', credentials: true } запрещено стандартом

  // API-роуты
  const apiRouterToUse = customApiRouter || apiRouter;
  app.use(apiBasePath, cors({ origin: allowedApiOrigins, credentials: true }), apiRouterToUse);
  app.use(errorHandler);
  app.disable('x-powered-by'); // Убираем лишний заголовок

  return app;
}

// Корректная обработка соединений (полезно, например, при работе вместе с другими сервисами или через PM2)
function setupGracefulShutdown(appServer) {
  const shutdown = (reason) => {
    console.log(
      `\n[${getDateTime()}] ${COLORS.red}Received ${reason}.${COLORS.reset}\nClosing all connections...`
    );

    appServer.close((err) => {
      if (err) {
        console.error(
          `\n[${getDateTime()}] ${COLORS.red}Error during server close: \n`,
          inspect(err, { depth: null, colors: true }),
          COLORS.reset
        );
        process.exit(1);
        return;
      }

      console.log(
        `\n[${getDateTime()}] HTTP server closed successfully. Exiting process.`
      );
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Поддержка управляемого завершения, в том числе из PM2
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      shutdown('shutdown message');
    }
  });
}

export function startServer(options = {}) {
  const portFromOptions = options.port ?? process.env.PORT;
  const port = portFromOptions ? Number(portFromOptions) : 3000;

  const app = createServer(options);
  const appServer = app.listen(port, () => {
    console.log(getStartMessage(port));
  });

  setupGracefulShutdown(appServer);

  return { app, appServer, port };
}

// Обрабатываем запуск сервера напрямую из репозитория: node server.js
const isDirectRun = (() => {
  const currentFile = fileURLToPath(import.meta.url);
  const entryFile = process.argv[1] && path.resolve(process.argv[1]);
  return currentFile === entryFile;
})();

if (isDirectRun) {
  // Запуск без CLI-опций: дефолты, secHeaders включены
  startServer();
}

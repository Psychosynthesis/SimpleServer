import cors from 'cors';
import express from 'express';
import { inspect } from 'node:util';
import { getDateTime } from 'vanicom';

import { setSecurityHeaders } from './middlewares/index.js';
import apiRouter from './routes/api.router.js';
import frontendRouter from './routes/frontend.router.js';

const server = express();
const allowedOrigins = [ "http://localhost:3000", "http://127.0.0.1" ];
const isProd = typeof process.env.NODE_ENV === 'string' && !process.env.NODE_ENV.toLowerCase().includes('dev');

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    // Определяем статус ошибки
    const status = err?.status || 500;
    const message = (err instanceof Error) ? err.message : 'Unknown error';

    if (parseInt(status) === 401) {
      // Получаем IP-цепочку из заголовков или используем прямой IP
        const ipChain = req.headers['x-forwarded-for']  ? req.headers['x-forwarded-for'] : req.ip;
        console.warn(`[${getDateTime()}] Failed authorization attempt from: ${ipChain}`);
        console.warn(`------------- User-Agent: ${req.get('User-Agent')?.substring(0, 80)}, OriginalUrl: ${req.originalUrl}`);
    } else {
      // Логирование
      console.error(`[${getDateTime()}] Unhandled error:`, inspect(err, { depth: null, colors: true }));
    }

    // Стандартизированный ответ с учетом статуса
    res.status(status).json({
        success: false,
        message: status === 500
            ? (isProd ? 'Internal server error. Please contact support.' : message) // Для прода скрываем ошибку
            : message,
        errorId: Date.now()
    });
};

server.disable('x-powered-by'); // Remove unnecs header
server.use(setSecurityHeaders);
server.use('/', cors({ origin: '*', credentials: true }), frontendRouter);
server.use('/api', cors({ origin: allowedOrigins, credentials: true }), apiRouter);
server.use(errorHandler);

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// Обработчик graceful shutdown, полезно для работы под PM2
process.on('message', (msg) => {
  if (msg === 'shutdown') {
    console.log(`[${getDateTime()}] Received shutdown message. Closing all connections...`);

    // Закрываем HTTP-сервер для прекращения принятия новых соединений
    appServer.close((err) => {
      if (err) {
        console.error(`[${getDateTime()}] Error during server close:`, err);
        process.exit(1); // Завершаем с ошибкой, если не удалось закрыть сервер
      } else {
        console.log(`[${getDateTime()}] HTTP server closed successfully.`);
      }
    });

    // Здесь можно добавить закрытие других ресурсов:
    // - Базы данных (например, MongoDB, PostgreSQL) или очередей (например, RabbitMQ, Redis)
    // - Внешних API-соединений
    // - Интервалов или таймеров (clearInterval, clearTimeout)

    // Пример для MongoDB:
    // if (mongoose.connection.readyState === 1) {
    //   mongoose.connection.close(false, () => {
    //     console.log('MongoDB connection closed.');
    //   });
    // }

    // Даём время на корректное завершение операций, затем выходим
    setTimeout(() => {
      console.log(`[${getDateTime()}] Finished closing connections. Exiting process.`);
      process.exit(0); // Корректное завершение
    }, 1000);
  }
});

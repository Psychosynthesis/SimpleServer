import cors from 'cors';
import express from 'express';
import { stringify } from 'flatted';

import { setSecurityHeaders } from './middlewares/index.js';
import apiRouter from './routes/api.router.js';
import frontendRouter from './routes/frontend.router.js';

const server = express();
const allowedOrigins = [ "http://localhost:3000", "http://45.153.71.94" ];

server.disable('x-powered-by'); // Remove unnecs header
server.use(setSecurityHeaders);
server.use('/', cors({ origin: allowedOrigins, credentials: true }), frontendRouter);
server.use('/api', cors({ origin: allowedOrigins, credentials: true }), apiRouter);


server.use((err, req, res, next) => {
  if (!res.headersSent) {
    // if (process.env.NODE_ENV === 'production') {
      console.error(`Unhandled error: ${err.message || stringify(err, null, 2)}`);
    // }
    // Устанавливаем статус ошибки, если он еще не был установлен
    res.status(err.status || 500).json({ success: false, message: 'Something went wrong. Please mail to admin.' })
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

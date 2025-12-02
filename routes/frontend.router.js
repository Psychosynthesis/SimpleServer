import express, { Router } from 'express';
import path from 'node:path';

export function createFrontendRouter(publicDir = './public') {
  const router = Router({ mergeParams: true });

  const absolutePublicDir = path.isAbsolute(publicDir)
    ? publicDir
    : path.resolve(process.cwd(), publicDir);

  router.use('/', express.static(absolutePublicDir));
  router.use('/assets', express.static(path.join(absolutePublicDir, 'assets')));

  return router;
}

// Для обратной совместимости — дефолтный роутер с ./public
const defaultRouter = createFrontendRouter();
export default defaultRouter;


/*
Custom example handling for main index
  server.get('/', (req, res) => {
    res.send({ message: 'Hello WWW!' }); // Send text

    res.setHeader('Content-Type', 'text/plain;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="file.txt"`);
    res.send('Example text');
    res.end();
});
*/

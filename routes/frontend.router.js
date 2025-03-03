import express, { Router } from 'express';

const router = Router({ mergeParams: true });

router.use('/', express.static('./public/'));
router.use('/assets', express.static('./public/assets'));

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

export default router

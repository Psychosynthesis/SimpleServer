import { Router, json } from 'express';

import { verifyClient } from '../middlewares/index.js';

// const urlParser = urlencoded({ limit: '100mb' });

/*
 Other variant of middleware used for handle input POST requests
 import { json, urlencoded } from 'body-parser';
 const jsonParser = json({ limit: "150mb" });
 const urlParser = urlencoded({ limit: "150mb", extended: true, parameterLimit: 5000000 });
*/

const router = Router({ mergeParams: true });
const jsonParser = json({ limit: '10mb' });

// GET /api/test simple
router.get('/test', async (request, response) => {
  response.status(200).json('Test ok');
});

// GET /api/secure-api/:date
router.get('/secure-api/:date', async (request, response) => {
  const requestedItemDate = request.params.date;
  const requestedItem = ['1245', '6789'].find((item) => item === requestedItemDate);

  if (typeof requestedItem === 'undefined') {
    response.status(404).json('Not found');
    return;
  }

  response.status(200).json(requestedItem);
});

// POST /api/test/post
router.post('/test/post', verifyClient, jsonParser, async (request, response) => {
  const { requestedItemDate } = request.body;
  const requestedItem = ['1245', '6789'].find((item) => item === requestedItemDate);

  if (typeof requestedItem === 'undefined') {
    response.status(404).json('Not found');
    return;
  }

  response.status(200).json(requestedItem);
});

export default router;

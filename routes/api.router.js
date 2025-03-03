import { Router, json, urlencoded } from 'express';

import { verifyClient } from '../middlewares/index.js';

const router = Router({ mergeParams: true });
const jsonParser = json({ limit: "10mb" });
// const urlParser = urlencoded({ limit: '100mb' });

/*
 Other variant of middleware used for handle input POST requests
 import { json, urlencoded } from 'body-parser';
 const jsonParser = json({ limit: "150mb" });
 const urlParser = urlencoded({ limit: "150mb", extended: true, parameterLimit: 5000000 });
*/

// GET /api/test simple
router.get('test', async (request, response, next) => {
  response.status(200).json('Test ok');
  next('route');
});

// GET /api/test/[date]
router.get('/secure-api/:date', async (request, response, next) => {
  const requestedItemDate = req.params.date; // GET-params
  const requestedItem = ['1245', '6789'].find(item => item === requestedItemDate);
  if (typeof(requestedItem) === 'undefined') {
    response.status(404).json('Not found');
    next('route');
    return;
  }
  response.status(200).json(requestedItem);
  next('route');
  return;
});

// POST /api/test/post
router.post('/test/post', verifyClient, jsonParser, async (request, response, next) => {
  const { requestedItemDate } = request.body; // POST-body
  const requestedItem = ['1245', '6789'].find(item => item === requestedItemDate);

  if (typeof(requestedItem) === 'undefined') {
    response.status(404).json('Not found');
    next('route');
    return;
  }
  response.status(200).json(requestedItem);
  next('route');
  return;
});


export default router

const path = require('path');
const express = require('express');
const bodyParser = require("body-parser");
const server = express();

// Add headers before the routes are defined
server.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Request methods you wish to allow
  // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type'); // Website you wish to allow to connect
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  // res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

// Two variants of middleware used for handle input POST requests
// server.use(express.json({ limit: '100mb' }));
// server.use(express.urlencoded({ limit: '100mb' }));
server.use(bodyParser.json({ limit: "150mb" }));
server.use(bodyParser.urlencoded({ limit: "150mb", extended: true, parameterLimit: 5000000 }));


server.use('/media', express.static(__dirname + '/media')); // Try get http://127.0.0.1:8080/media/test.json in browser
server.use(express.static(__dirname + '/public')); // Will return index.html from get http://127.0.0.1:8080/

// Custom handling for main index
/* server.get('/', (req, res) => {
    res.send({ message: 'Hello WWW!' });
    // res.sendFile(`${__dirname}/public/index.html`);
});*/

server.post('/api', function(request, response) {
  const input = request.body; // Access the parse results as request.body
  console.log("request data is: ", input.data);
});

// Set status to response
server.post('/forbiden', function(request, response) {
  response.status(403);
  response.send('403');
});

server.listen(8080, () => {
  console.log('Server listening on port 8080');
  console.log('Open http://127.0.0.1:8080 in your browser');
});

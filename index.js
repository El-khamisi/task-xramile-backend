const express = require('express');

// Config
const { PORT, NODE_ENV } = require('./src/config/env.js');

const port = PORT || 8080;

// Create Application
const app = express();

const endpoints = require('./src/index.routes');
endpoints(app);

if (NODE_ENV === 'dev') {
  let devPort = process.argv[2] || 8080; 
  app.listen(devPort, () => {
    console.log(`Development connected successfully ON PORT-${devPort}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Production connected successfully ON port-${port}`);
  });
}

module.exports = app;

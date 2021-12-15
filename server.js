'use strict';

// API boilerplate
const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require("cors")

// Logging
const morgan = require('morgan');
const logger = require('./logger');

// Config
const config = require('config');

// Set up middleware for request parsing, logging, etc.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('short', { stream: logger.stream }));



// Start the API
app.listen(config.apiPort);
logger.log('info', `api running on port ${config.apiPort}`);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://wallet.pejcoin.io");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, 'Content-Type' : 'multipart/form-data' ,* "
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
  });
// const whitelist = ["https://wallet.pejcoin.io","http://localhost:3001"];

// const corsOptions = {
//     origin: function (origin, callback) {
//       if (!origin || whitelist.indexOf(origin) !== -1) {
//         callback(null, true)
//       } else {
//         callback(new Error("Not allowed by CORS"))
//       }
//     },
//     credentials: true,
//   }
  app.use(cors())

  // Load up the routes
app.use('/', routes);


// Export API server for testing
module.exports = app;

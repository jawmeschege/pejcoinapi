'use strict';

// Router
const router = require('express').Router();
const files = require('./index');

// Prices
router.get('/pejprices', files.downloadPrice);

// Export the router
module.exports = router;
'use strict';

// Router
const router = require('express').Router();
const tasks = require('./index');
const transactions = require('./index');


// Transactions
router.get('/fetchTransactions', transactions.fetchTransactions);
router.post('/createTransaction', transactions.createTransaction);

// Export the router
module.exports = router;
'use strict';

// Router
const router = require('express').Router();
const user = require('./index');


// Transactions
// router.get('/fetchTransactions', transactions.fetchTransactions);
router.post('/createuser', user.createUser);

// Export the router
module.exports = router;
'use strict';

// Router
const router = require('express').Router();
const tasks = require('./index');
const transactions = require('./index');


// Transactions
router.get('/fetchTransactions', transactions.fetchTransactions);
router.post('/createTransaction', transactions.createTransaction);

router.get('/getvaults', transactions.fetchVaults);
router.get('/sumvaults', transactions.sumUserVaults);
router.get('/groupvaults', transactions.groupUserVaults);



// Export the router
module.exports = router;
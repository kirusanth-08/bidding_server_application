const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mailController')

router.post('/:id',mailController.notifyHighestBidder);


module.exports = router
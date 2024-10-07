const express = require('express');
const router = express.Router();
const bidController = require('../controllers/biddingController')

router.post('/:id',bidController.placeBid);
router.get('/time/:id',bidController.getRemainingTime);
router.get('/bids/:id',bidController.getBidsForItem);
router.put('/:id',bidController.closeAuction);




module.exports = router
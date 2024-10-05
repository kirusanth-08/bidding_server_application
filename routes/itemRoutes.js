const express = require('express');
const { postItem, postBidItem, getItems, getItemById, updateItem, deleteItem } = require('../controllers/itemController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/new',postItem);
router.post('/bid',postBidItem);
router.get('/', getItems);
router.get('/:id', getItemById);
router.put('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);

module.exports = router;
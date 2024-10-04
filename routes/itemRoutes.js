const express = require('express');
const { addItem, getItems, getItemById, updateItem, deleteItem } = require('../controllers/itemController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/',addItem);
router.get('/', getItems);
router.get('/:id', getItemById);
router.put('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);

module.exports = router;
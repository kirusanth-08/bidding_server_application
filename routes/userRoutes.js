const express = require('express');
const { register, login, updatePassword, updateEmail, updatePhoneNumber, deleteAccount } = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update-password', authenticate, updatePassword);
router.put('/update-email', authenticate, updateEmail);
router.put('/update-phone-number', authenticate, updatePhoneNumber);
router.delete('/delete-account', authenticate, deleteAccount);

module.exports = router;
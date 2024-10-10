const express = require('express');
const profileController = require('../controllers/profileController'); // Adjust the path as necessary

const router = express.Router();

router.post('/get-profile', profileController.getProfileDetails);
router.put('/address', profileController.updateAddress);
router.put('/notification-preferences', profileController.updateNotificationPreferences);
router.put('/name', profileController.updateName);

module.exports = router;
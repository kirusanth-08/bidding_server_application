const Profile = require('../models/Profile');

const getProfileDetails = async (req, res) => {
  try {
    const { userId } = req.body;

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile', error: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  const { userId, address } = req.body;

  try {
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { address },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  const { userId, notificationPreferences } = req.body;

  try {
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { notificationPreferences },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification preferences', error: error.message });
  }
};

// Update name
const updateName = async (req, res) => {
  const { userId, name } = req.body;

  try {
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { name },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating name', error: error.message });
  }
};



module.exports = {
  getProfileDetails,
  updateAddress,
  updateNotificationPreferences,
  updateName
};
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  notificationPreferences: {
    biddingNotifications: {
      type: Boolean,
      default: true
    },
    newItemsNotifications: {
      type: Boolean,
      default: true
    },
    messageFromSellers: {
      type: Boolean,
      default: true
    },
    bidStatus: {
      type: Boolean,
      default: true
    }
  }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
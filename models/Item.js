const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['New', 'Used'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  sellingType:{
    type: String,
    enum: ['Buy Now', 'Bid'],
    required: true
  },
  startingBid: {
    type: Number
  },
  currentBid: {
    type: Number,
    default: 0
  },
  bid:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidding',
  },
  bidEndTime: {
    type: Date
  },
  sold: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;

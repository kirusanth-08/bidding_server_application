const mongoose = require('mongoose');

const biddingSchema = new mongoose.Schema({
  
  itemId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidPrice: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Bidding = mongoose.model('Bidding', biddingSchema);

module.exports = Bidding;

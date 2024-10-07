const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['Province', 'District', 'Sublocation'],
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
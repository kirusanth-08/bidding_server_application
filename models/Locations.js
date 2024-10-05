const mongoose = require('mongoose');

// Sublocation Schema
const sublocationSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  }
});

// District Schema
const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  sublocations: [sublocationSchema]
});

// Province (Location) Schema
const provinceSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  districts: [districtSchema]
});

const Location = mongoose.model('Location', provinceSchema);

module.exports = Location;
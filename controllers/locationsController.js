const Location = require('../models/Locations'); // Adjust the path as necessary

// Controller to get all locations with populated districts and sublocations
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().populate({
      path: 'districts',
      populate: {
        path: 'sublocations'
      }
    });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching locations' });
  }
};

module.exports = {
  getAllLocations
};
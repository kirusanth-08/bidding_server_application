// controllers/provinceController.js
const Location = require('../models/locations');

const getAllLocations = async (req, res) => {
  try {
    // Retrieve all provinces
    const provinces = await Location.find({ type: 'Province' });

    // Populate districts and their sub-locations
    const populatedProvinces = await Promise.all(
      provinces.map(async (province) => {
        const districts = await Location.find({ parent: province._id, type: 'District' });
        const populatedDistricts = await Promise.all(
          districts.map(async (district) => {
            const subLocations = await Location.find({ parent: district._id, type: 'Sublocation' });
            return {
              ...district.toObject(),
              subLocations,
            };
          })
        );
        return {
          ...province.toObject(),
          districts: populatedDistricts,
        };
      })
    );

    // Send response
    res.status(200).json({
      success: true,
      data: populatedProvinces,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

module.exports = { getAllLocations };

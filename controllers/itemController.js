const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const multer = require('multer');
const path = require('path');

const addItem = (req, res) => {
  try {
   
    // Validate that startingBid is required if the item is for bidding
    if (req.body.sellingType === 'Bid' && !req.body.startingBid) {
      return res.status(400).json({ message: 'Starting Bid is required for bid items' });
    }

    // Now that all validations are successful, use multer to handle the image upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'Image upload failed', error: err.message });
      }

      // Get the paths of the uploaded images
      const imagePaths = req.files.map(file => file.path);

      try {
        // Create a new item with the validated data and uploaded images
        const newItem = new Item({
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          location: req.body.location,
          type: req.body.type,
          condition: req.body.condition,
          userId: req.body.userId, // Assuming userId is passed in the request
          images: imagePaths,      // Save image paths to the DB
          sellingType: req.body.sellingType,
          startingBid: req.body.startingBid,
          bidEndTime: req.body.bidEndTime
        });

        // Save the new item to the database
        const savedItem = await newItem.save();

        // Send response back with the saved item
        res.status(201).json({
          message: 'Item created successfully',
          item: savedItem
        });
      } catch (error) {
        res.status(500).json({ message: 'Error creating item', error: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// Get all items
const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('bid');
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get all items by a specific seller
const getItemsBySeller = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.params.id });
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get a single item by ID
const getItemSellerById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('userId');
    if (!item) {
      return res.status(404).send({ error: 'Item not found' });
    }
    res.status(200).send(item);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};



// Get a single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('bid');
    if (!item) {
      return res.status(404).send({ error: 'Item not found' });
    }
    res.status(200).send(item);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Update an item by ID
const updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).send({ error: 'Item not found' });
    }
    res.status(200).send(item);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Delete an item by ID
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).send({ error: 'Item not found' });
    }
    res.status(200).send({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};



// Configure storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory to save images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique filenames
  }
});

// File filter (optional: limit to images)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: fileFilter
}).array('images', 5); // Allow up to 5 images


module.exports = {
  addItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemsBySeller,
  getItemSellerById
};
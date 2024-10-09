const Item = require('../models/Item');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the 'uploads' directory exists, create if not
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

// Controller function to add an item
const addItem = (req, res) => {
  const processRequest = async () => {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Received Body:', req.body);

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => file.path);
    } else if (req.body.images && Array.isArray(req.body.images)) {
      imagePaths = req.body.images;
    }

    try {
      const newItem = new Item({
        name: req.body.name,
        price: parseFloat(req.body.price),
        description: req.body.description,
        location: req.body.location,
        type: req.body.type,
        condition: req.body.condition,
        userId: req.body.userId,
        images: imagePaths,
        sellingType: req.body.sellingType,
        startingBid: req.body.startingBid ? parseFloat(req.body.startingBid) : undefined,
        bidEndTime: req.body.bidEndTime ? new Date(req.body.bidEndTime) : undefined
      });

      const savedItem = await newItem.save();
      res.status(201).json({ message: 'Item created successfully', item: savedItem });
    } catch (error) {
      console.error('Error saving item:', error);
      res.status(500).json({ message: 'Error creating item', error: error.message });
    }
  };

  if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
    upload(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: 'Image upload failed', error: err.message });
      }
      processRequest();
    });
  } else {
    processRequest();
  }
};

// Other controllers (getItems, getItemById, etc.)
const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('bid');
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get items by seller
const getItemsBySeller = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.params.id });
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get item by ID
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

// Update item
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

// Delete item
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

module.exports = {
  addItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemsBySeller
};


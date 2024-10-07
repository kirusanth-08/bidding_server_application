require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp'); // HTTP Parameter Pollution prevention
const mongoose = require('mongoose');

const locationsController = require('./controllers/locationsController');

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(morgan('combined'));


mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');


  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});

// Routes
app.get('/api/locations/v1', locationsController.getAllLocations);

app.use('/api/users/v1', userRoutes);
app.use('/api/items/v1', itemRoutes);
app.use('/api/profile/v1', profileRoutes);

app.use(errorHandler);
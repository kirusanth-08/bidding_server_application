const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phoneNumber, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).send({ token, userId: user._id, username: user.name, email: user.email });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: 'User not found!' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); // Use JWT secret from .env
    console.log({ token, userId: user._id, username: user.name })
    res.send({ token, userId: user._id, username: user.name, email: user.email });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    res.send({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { userId, newEmail } = req.body;
    await User.findByIdAndUpdate(userId, { email: newEmail });
    res.send({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updatePhoneNumber = async (req, res) => {
  try {
    const { userId, newPhoneNumber } = req.body;
    await User.findByIdAndUpdate(userId, { phoneNumber: newPhoneNumber });
    res.send({ message: 'Phone number updated successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndDelete(userId);
    res.send({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const validateToken = async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });
    // console.log(token, decoded, user) 

    if (!user) {
      throw new Error();
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    console.log(error)
    res.status(401).json({ valid: false, message: 'Token is invalid or expired' });
  }
};

module.exports = {
  validateToken,
  register,
  login,
  updatePassword,
  updateEmail,
  updatePhoneNumber,
  deleteAccount
};
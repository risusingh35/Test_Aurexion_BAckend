// db.js
require('dotenv').config(); 
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error('MONGO_URI is not defined — check your .env file');
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');
  } catch (e) {
    console.log('Error while connecting MongoDB', e);
    throw new Error('DB connection failed');
  }
};

module.exports = { connectDB };
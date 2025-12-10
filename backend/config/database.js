const mongoose = require('mongoose');
const { DATABASE_CONFIG } = require('../constants');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DATABASE_CONFIG.URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

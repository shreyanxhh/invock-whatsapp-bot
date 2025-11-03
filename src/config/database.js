const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,  // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);  // Exit if can't connect to database
  }
};

module.exports = connectDB;
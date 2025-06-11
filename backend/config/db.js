const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://keerthan11c:pyAU2loXgXuMjDI3@devops.olckxah.mongodb.net/timecapsule?retryWrites=true&w=majority&appName=devops";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

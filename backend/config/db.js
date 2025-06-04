const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://keerthan11c:Keerthan@devops.olckxah.mongodb.net/?retryWrites=true&w=majority&appName=devops";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

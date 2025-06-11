const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const capsuleRoutes = require("./routes/capsuleRoutes");

dotenv.config(); // Loads .env
connectDB(); // Connect to MongoDB

const app = express();

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON requests

// Register routes
app.use("/api/users", userRoutes);       // User registration/login
app.use("/api/capsules", capsuleRoutes); // Capsule CRUD

// Optional root endpoint for checking API
app.get("/", (req, res) => {
  res.send("🚀 Time Capsule API is live");
});

// Handle undefined routes (fallback)
app.use((req, res) => {
  res.status(404).json({ message: "❌ Endpoint not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

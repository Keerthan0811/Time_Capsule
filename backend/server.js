const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const capsuleRoutes = require("./routes/capsuleRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/capsules", capsuleRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Time Capsule API is live");
});

app.use((req, res) => {
  res.status(404).json({ message: "❌ Endpoint not found" });
});

// Only start the server if this file is run directly, not when required by tests
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

module.exports = app;

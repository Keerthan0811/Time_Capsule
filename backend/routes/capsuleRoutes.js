const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createCapsule,
  getUnlockedCapsules,
} = require("../controllers/capsuleController");

// Upload image and create capsule
router.post("/", protect, upload.single("image"), createCapsule);

// GET: get unlocked capsules
router.get("/unlocked", protect, getUnlockedCapsules);

module.exports = router;

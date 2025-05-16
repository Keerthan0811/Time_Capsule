const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createCapsule,
  getUnlockedCapsules,
  getAllCapsules, // <-- add this
} = require("../controllers/capsuleController");

// Upload image and create capsule
router.post("/", protect, upload.single("image"), createCapsule);

// GET: get unlocked capsules
router.get("/unlocked", protect, getUnlockedCapsules);

// GET: get all capsules (locked and unlocked)
router.get("/all", protect, getAllCapsules);

module.exports = router;

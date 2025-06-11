const Capsule = require("../models/Capsule");
const User = require("../models/User");

const createCapsule = async (req, res) => {
  try {
    const { message, unlockDate, lockedDate } = req.body; // <-- include lockedDate

    // Validate required fields
    if (!message || !unlockDate || !lockedDate) { // <-- check lockedDate
      return res.status(400).json({ message: "Message, unlockDate, and lockedDate are required" });
    }

    // Validate unlockDate and lockedDate
    const unlockDateObj = new Date(unlockDate);
    const lockedDateObj = new Date(lockedDate);
    if (isNaN(unlockDateObj.getTime()) || isNaN(lockedDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid unlockDate or lockedDate format" });
    }

    // Create a new capsule
    const newCapsule = new Capsule({
      message,
      unlockDate: unlockDateObj,
      lockedDate: lockedDateObj, // <-- store lockedDate
      user: req.user._id,
    });

    // Handle image upload
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Uploaded file must be an image" });
      }

      newCapsule.image.data = req.file.buffer;
      newCapsule.image.contentType = req.file.mimetype;
    }

    // Save the capsule to the database
    const saved = await newCapsule.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Capsule creation failed:", err.message);

    // Return a meaningful error message to the client
    res.status(500).json({ message: "Server error while creating capsule" });
  }
};

// Get all unlocked capsules for the logged-in user
const getUnlockedCapsules = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Find all capsules that are unlocked (unlockDate <= now)
    const capsules = await Capsule.find({ user: userId, unlockDate: { $lte: now } });

    // REMOVE EMAIL SENDING LOGIC
    for (const cap of capsules) {
      if (!cap.notified) {
        cap.notified = true;
        await cap.save();
      }
    }

    // Transform the capsules to include Base64-encoded images
    const response = capsules.map((cap) => ({
      ...cap._doc,
      image: cap.image.data
        ? `data:${cap.image.contentType};base64,${cap.image.data.toString("base64")}`
        : null,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching unlocked capsules:", error.message);
    res.status(500).json({ message: "Server error while fetching unlocked capsules" });
  }
};

// Get all capsules (locked and unlocked) for the logged-in user
const getAllCapsules = async (req, res) => {
  try {
    const userId = req.user._id;
    const capsules = await Capsule.find({ user: userId });

    const response = capsules.map((cap) => ({
      ...cap._doc,
      image: cap.image && cap.image.data
        ? `data:${cap.image.contentType};base64,${cap.image.data.toString("base64")}`
        : null,
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching capsules" });
  }
};

const deleteCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: "Capsule not found" });
    if (capsule.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await capsule.deleteOne();
    res.json({ message: "Capsule deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error while deleting capsule" });
  }
};

module.exports = {
  createCapsule,
  getUnlockedCapsules,
  getAllCapsules,
  deleteCapsule,
};

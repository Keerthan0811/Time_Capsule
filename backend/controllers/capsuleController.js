const Capsule = require("../models/Capsule");

const createCapsule = async (req, res) => {
  try {
    const { message, unlockDate } = req.body;

    // Validate required fields
    if (!message || !unlockDate) {
      return res.status(400).json({ message: "Message and unlockDate are required" });
    }

    // Validate unlockDate
    const unlockDateObj = new Date(unlockDate);
    if (isNaN(unlockDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid unlockDate format" });
    }

    // Create a new capsule
    const newCapsule = new Capsule({
      message,
      unlockDate: unlockDateObj,
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
    const userId = req.user._id; // Get the logged-in user's ID
    const now = new Date(); // Current date and time

    // Find all capsules that are unlocked (unlockDate <= now)
    const capsules = await Capsule.find({ user: userId, unlockDate: { $lte: now } });

    // Transform the capsules to include Base64-encoded images
    const response = capsules.map((cap) => ({
      ...cap._doc,
      image: cap.image.data
        ? `data:${cap.image.contentType};base64,${cap.image.data.toString("base64")}`
        : null, // Convert image to Base64 or set to null if no image
    }));

    // Return the transformed capsules
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching unlocked capsules:", error.message);

    // Return a meaningful error message to the client
    res.status(500).json({ message: "Server error while fetching unlocked capsules" });
  }
};

module.exports = {
  createCapsule,
  getUnlockedCapsules,
};

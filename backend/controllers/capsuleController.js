const Capsule = require("../models/Capsule");

const createCapsule = async (req, res) => {
    try {
      const { message, unlockDate } = req.body;
  
      if (!message || !unlockDate) {
        return res.status(400).json({ message: "Message and unlockDate are required" });
      }
  
      const newCapsule = new Capsule({
        message,
        unlockDate,
        user: req.user._id,
      });
  
      if (req.file) {
        newCapsule.image.data = req.file.buffer;
        newCapsule.image.contentType = req.file.mimetype;
      }
  
      const saved = await newCapsule.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error("Capsule creation failed:", err);
      res.status(500).json({ message: "Server error while creating capsule" });
    }
  };
  

// Get all unlocked capsules for the logged-in user
const getUnlockedCapsules = async (req, res) => {
    try {
      const userId = req.user._id;
  
      const now = new Date();
  
      const capsules = await Capsule.find({ user: req.user._id, unlockDate: { $lte: now } });

    const response = capsules.map((cap) => ({
      ...cap._doc,
      image: cap.image.data
      ? `data:${cap.image.contentType};base64,${cap.image.data.toString("base64")}`
      : null,
   }));

  
      res.status(200).json(capsules);
    } catch (error) {
      console.error("Error fetching unlocked capsules:", error);
      res.status(500).json({ message: "Server error while fetching capsules" });
    }
  };

module.exports = {
  createCapsule,
  getUnlockedCapsules,
};

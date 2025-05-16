const mongoose = require("mongoose");

const capsuleSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    unlockDate: {
      type: Date,
      required: true,
    },
    lockedDate: {
      type: Date,
      required: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true // Keeps createdAt and updatedAt
  }
);

const Capsule = mongoose.model("Capsule", capsuleSchema);

module.exports = Capsule;

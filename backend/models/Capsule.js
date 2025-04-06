const mongoose = require("mongoose");

const capsuleSchema = new mongoose.Schema({
    message: {
      type: String,
      required: true,
    },
    unlockDate: {
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
  });
  

const Capsule = mongoose.model("Capsule", capsuleSchema);

module.exports = Capsule;

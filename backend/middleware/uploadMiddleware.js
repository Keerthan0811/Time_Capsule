const multer = require("multer");

const storage = multer.memoryStorage(); // store in memory, not disk

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;

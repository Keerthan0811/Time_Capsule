const multer = require('multer');
const upload = require('../middleware/uploadMiddleware');

describe('uploadMiddleware', () => {
  it('should be a multer instance', () => {
    expect(upload).toHaveProperty('single');
    expect(typeof upload.single).toBe('function');
  });
});
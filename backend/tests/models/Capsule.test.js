const Capsule = require('../../models/Capsule');
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('Capsule Model Tests', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123'
    });
  });

  describe('Capsule Creation', () => {
    test('should create a valid capsule', async () => {
      const capsuleData = {
        message: 'Test message for time capsule',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id
      };

      const capsule = new Capsule(capsuleData);
      const savedCapsule = await capsule.save();

      expect(savedCapsule._id).toBeDefined();
      expect(savedCapsule.message).toBe(capsuleData.message);
      expect(savedCapsule.unlockDate).toEqual(capsuleData.unlockDate);
      expect(savedCapsule.lockedDate).toEqual(capsuleData.lockedDate);
      expect(savedCapsule.user).toEqual(testUser._id);
      expect(savedCapsule.notified).toBe(false);
      expect(savedCapsule.createdAt).toBeDefined();
      expect(savedCapsule.updatedAt).toBeDefined();
    });

    test('should fail to create capsule without required fields', async () => {
      const capsule = new Capsule({});
      
      let error;
      try {
        await capsule.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.message).toBeDefined();
      expect(error.errors.unlockDate).toBeDefined();
      expect(error.errors.lockedDate).toBeDefined();
      expect(error.errors.user).toBeDefined();
    });

    test('should create capsule with image data', async () => {
      const imageBuffer = Buffer.from('fake image data');
      const capsuleData = {
        message: 'Test message with image',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id,
        image: {
          data: imageBuffer,
          contentType: 'image/jpeg'
        }
      };

      const capsule = new Capsule(capsuleData);
      const savedCapsule = await capsule.save();

      expect(savedCapsule.image.data).toEqual(imageBuffer);
      expect(savedCapsule.image.contentType).toBe('image/jpeg');
    });
  });

  describe('Capsule Validation', () => {
    test('should validate date fields are Date objects', async () => {
      const capsule = new Capsule({
        message: 'Test message',
        unlockDate: 'invalid-date',
        lockedDate: 'invalid-date',
        user: testUser._id
      });

      let error;
      try {
        await capsule.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
    });

    test('should validate user reference exists', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      
      const capsule = new Capsule({
        message: 'Test message',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: nonExistentUserId
      });

      // This should save successfully as Mongoose doesn't validate references by default
      const savedCapsule = await capsule.save();
      expect(savedCapsule.user).toEqual(nonExistentUserId);
    });
  });

  describe('Capsule Default Values', () => {
    test('should set notified to false by default', async () => {
      const capsule = await Capsule.create({
        message: 'Test message',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id
      });

      expect(capsule.notified).toBe(false);
    });

    test('should allow overriding notified default', async () => {
      const capsule = await Capsule.create({
        message: 'Test message',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id,
        notified: true
      });

      expect(capsule.notified).toBe(true);
    });
  });

  describe('Capsule Population', () => {
    test('should populate user information', async () => {
      const capsule = await Capsule.create({
        message: 'Test message',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id
      });

      const populatedCapsule = await Capsule.findById(capsule._id).populate('user');
      
      expect(populatedCapsule.user.username).toBe(testUser.username);
      expect(populatedCapsule.user.email).toBe(testUser.email);
    });
  });

  describe('Capsule Schema Properties', () => {
    test('should have timestamps enabled', async () => {
      const capsule = await Capsule.create({
        message: 'Test message',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id
      });

      expect(capsule.createdAt).toBeDefined();
      expect(capsule.updatedAt).toBeDefined();
      expect(capsule.createdAt).toBeInstanceOf(Date);
      expect(capsule.updatedAt).toBeInstanceOf(Date);
    });
  });
});

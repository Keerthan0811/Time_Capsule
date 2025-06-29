const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Capsule = require('../../models/Capsule');
const jwt = require('jsonwebtoken');
const path = require('path');

describe('Capsule Routes Integration Tests', () => {
  let testUser, authToken;

  beforeEach(async () => {
    testUser = await User.create({
      username: 'capsuletest',
      email: 'capsule@example.com',
      password: 'hashedpassword123'
    });

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  describe('POST /api/capsules', () => {
    test('should create capsule without image', async () => {
      const capsuleData = {
        message: 'This is a test time capsule message',
        unlockDate: '2025-12-31T00:00:00.000Z',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };

      const response = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .send(capsuleData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('message', capsuleData.message);
      expect(response.body).toHaveProperty('user', testUser._id.toString());
      expect(response.body).toHaveProperty('notified', false);

      // Verify in database
      const savedCapsule = await Capsule.findById(response.body._id);
      expect(savedCapsule).toBeTruthy();
      expect(savedCapsule.message).toBe(capsuleData.message);
    });

    test('should create capsule with image', async () => {
      const capsuleData = {
        message: 'Test capsule with image',
        unlockDate: '2025-12-31T00:00:00.000Z',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };

      // Create a simple test image buffer
      const testImageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .field('message', capsuleData.message)
        .field('unlockDate', capsuleData.unlockDate)
        .field('lockedDate', capsuleData.lockedDate)
        .attach('image', testImageBuffer, 'test.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('message', capsuleData.message);

      // Verify image was saved
      const savedCapsule = await Capsule.findById(response.body._id);
      expect(savedCapsule.image.data).toBeTruthy();
      expect(savedCapsule.image.contentType).toBe('image/jpeg');
    });

    test('should require authentication', async () => {
      const capsuleData = {
        message: 'Test message',
        unlockDate: '2025-12-31T00:00:00.000Z',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };

      const response = await request(app)
        .post('/api/capsules')
        .send(capsuleData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        message: 'Test message'
        // missing unlockDate and lockedDate
      };

      const response = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Message, unlockDate, and lockedDate are required');
    });

    test('should validate date format', async () => {
      const invalidData = {
        message: 'Test message',
        unlockDate: 'invalid-date',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };

      const response = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid unlockDate or lockedDate format');
    });
  });

  describe('GET /api/capsules/unlocked', () => {
    test('should return unlocked capsules', async () => {
      // Create an unlocked capsule (past date)
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const unlockedCapsule = await Capsule.create({
        message: 'Unlocked capsule',
        unlockDate: pastDate,
        lockedDate: new Date('2024-01-01'),
        user: testUser._id
      });

      // Create a locked capsule (future date)
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await Capsule.create({
        message: 'Locked capsule',
        unlockDate: futureDate,
        lockedDate: new Date('2024-01-01'),
        user: testUser._id
      });

      const response = await request(app)
        .get('/api/capsules/unlocked')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('message', 'Unlocked capsule');
      expect(response.body[0]).toHaveProperty('_id', unlockedCapsule._id.toString());
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/capsules/unlocked')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    test('should return empty array when no unlocked capsules', async () => {
      // Create only locked capsules
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await Capsule.create({
        message: 'Locked capsule',
        unlockDate: futureDate,
        lockedDate: new Date('2024-01-01'),
        user: testUser._id
      });

      const response = await request(app)
        .get('/api/capsules/unlocked')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/capsules', () => {
    test('should return all capsules for user', async () => {
      // Create multiple capsules
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await Capsule.create({
        message: 'Unlocked capsule',
        unlockDate: pastDate,
        lockedDate: new Date('2024-01-01'),
        user: testUser._id
      });

      await Capsule.create({
        message: 'Locked capsule',
        unlockDate: futureDate,
        lockedDate: new Date('2024-01-01'),
        user: testUser._id
      });

      const response = await request(app)
        .get('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    test('should only return capsules for authenticated user', async () => {
      // Create another user and their capsule
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });

      await Capsule.create({
        message: 'Other user capsule',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: otherUser._id
      });

      // Create capsule for test user
      await Capsule.create({
        message: 'Test user capsule',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id
      });

      const response = await request(app)
        .get('/api/capsules')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('message', 'Test user capsule');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/capsules')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });

  describe('DELETE /api/capsules/:id', () => {
    test('should delete capsule successfully', async () => {
      const capsule = await Capsule.create({
        message: 'Capsule to delete',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id
      });

      const response = await request(app)
        .delete(`/api/capsules/${capsule._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Capsule deleted');

      // Verify deletion
      const deletedCapsule = await Capsule.findById(capsule._id);
      expect(deletedCapsule).toBeNull();
    });

    test('should return 404 for non-existent capsule', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/capsules/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Capsule not found');
    });

    test('should prevent deletion of other users capsules', async () => {
      // Create another user and their capsule
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });

      const otherUserCapsule = await Capsule.create({
        message: 'Other user capsule',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: otherUser._id
      });

      const response = await request(app)
        .delete(`/api/capsules/${otherUserCapsule._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized');

      // Verify capsule still exists
      const existingCapsule = await Capsule.findById(otherUserCapsule._id);
      expect(existingCapsule).toBeTruthy();
    });

    test('should require authentication', async () => {
      const capsule = await Capsule.create({
        message: 'Test capsule',
        unlockDate: new Date('2025-12-31'),
        lockedDate: new Date('2025-01-01'),
        user: testUser._id
      });

      const response = await request(app)
        .delete(`/api/capsules/${capsule._id}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });
});

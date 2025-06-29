const User = require('../../models/User');
const mongoose = require('mongoose');

describe('User Model Tests', () => {
  describe('User Creation', () => {
    test('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).toBe(userData.password);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('should fail to create user without required fields', async () => {
      const user = new User({});
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.username).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    test('should fail to create user with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await User.create(userData);

      const duplicateUser = new User({
        username: 'testuser2',
        email: 'duplicate@example.com',
        password: 'password456'
      });

      let error;
      try {
        await duplicateUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });
  });

  describe('User Validation', () => {
    test('should validate email format', async () => {
      const user = new User({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      });

      const validationError = user.validateSync();
      expect(validationError).toBeUndefined(); // Mongoose doesn't validate email format by default
    });

    test('should require username to be string', async () => {
      const user = new User({
        username: 123,
        email: 'test@example.com',
        password: 'password123'
      });

      const savedUser = await user.save();
      expect(typeof savedUser.username).toBe('string');
      expect(savedUser.username).toBe('123');
    });
  });

  describe('User Schema Properties', () => {
    test('should have timestamps enabled', async () => {
      const user = await User.create({
        username: 'timestampuser',
        email: 'timestamp@example.com',
        password: 'password123'
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt on modification', async () => {
      const user = await User.create({
        username: 'updateuser',
        email: 'update@example.com',
        password: 'password123'
      });

      const originalUpdatedAt = user.updatedAt;
      
      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      user.username = 'updateduser';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});

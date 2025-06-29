const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('User Routes Integration Tests', () => {
  describe('POST /api/users/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', userData.username);
      expect(response.body).toHaveProperty('email', userData.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body).not.toHaveProperty('password');

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(userData.username);
      
      // Verify password was hashed
      expect(user.password).not.toBe(userData.password);
      const isPasswordHashed = await bcrypt.compare(userData.password, user.password);
      expect(isPasswordHashed).toBe(true);
    });

    test('should not register user with existing email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const duplicateUserData = {
        username: 'testuser2',
        email: 'duplicate@example.com',
        password: 'password456'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(duplicateUserData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    test('should handle missing required fields', async () => {
      const incompleteData = {
        username: 'testuser'
        // missing email and password
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(incompleteData)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Something went wrong');
    });

    test('should generate valid JWT token', async () => {
      const userData = {
        username: 'jwtuser',
        email: 'jwt@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const token = response.body.token;
      expect(token).toBeTruthy();

      // Verify token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded.id).toBe(response.body._id);
    });
  });

  describe('POST /api/users/login', () => {
    let testUser;
    const userPassword = 'password123';

    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userPassword, salt);
      
      testUser = await User.create({
        username: 'logintest',
        email: 'login@example.com',
        password: hashedPassword
      });
    });

    test('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: userPassword
        })
        .expect(200);

      expect(response.body).toHaveProperty('_id', testUser._id.toString());
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body).not.toHaveProperty('password');
    });

    test('should not login user with incorrect email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'wrong@example.com',
          password: userPassword
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    test('should not login user with incorrect password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    test('should handle missing email field', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          password: userPassword
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    test('should handle missing password field', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    test('should generate valid JWT token on login', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: userPassword
        })
        .expect(200);

      const token = response.body.token;
      expect(token).toBeTruthy();

      // Verify token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded.id).toBe(testUser._id.toString());
    });
  });

  describe('GET /api/users/protected', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'protectedtest',
        email: 'protected@example.com',
        password: 'hashedpassword123'
      });

      authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    });

    test('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/users/protected')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain(testUser.username);
      expect(response.body.message).toContain('authorized');
    });

    test('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/users/protected')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    test('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/protected')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, token failed');
    });

    test('should reject access with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users/protected')
        .set('Authorization', 'InvalidHeader')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });
});

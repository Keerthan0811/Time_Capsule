const request = require('supertest');
const app = require('../../server');

describe('Server Integration Tests', () => {
  describe('Root endpoint', () => {
    test('should return API status message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toBe('🚀 Time Capsule API is live');
    });
  });

  describe('CORS Configuration', () => {
    test('should handle CORS preflight request', async () => {
      const response = await request(app)
        .options('/api/users/register')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    test('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('JSON Parsing', () => {
    test('should parse JSON request bodies', async () => {
      const testData = { test: 'data' };

      const response = await request(app)
        .post('/api/users/register')
        .send(testData)
        .expect(500); // Will fail validation but JSON should be parsed

      // If we get here, JSON was parsed successfully
      expect(response.body).toHaveProperty('message');
    });

    test('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .set('Content-Type', 'application/json')
        .send('invalid json {')
        .expect(400);

      expect(response.body).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('message', '❌ Endpoint not found');
    });

    test('should return 404 for non-existent API routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('message', '❌ Endpoint not found');
    });

    test('should return 404 for invalid HTTP methods', async () => {
      const response = await request(app)
        .patch('/api/users/register')
        .expect(404);

      expect(response.body).toHaveProperty('message', '❌ Endpoint not found');
    });
  });

  describe('Route Registration', () => {
    test('should have user routes registered', async () => {
      // Test registration endpoint exists
      const response = await request(app)
        .post('/api/users/register')
        .send({})
        .expect(500); // Will fail validation but route exists

      expect(response.body).toHaveProperty('message');
    });

    test('should have capsule routes registered', async () => {
      // Test capsule endpoint exists (will fail auth)
      const response = await request(app)
        .get('/api/capsules')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });

  describe('Content-Type Handling', () => {
    test('should handle application/json content type', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .set('Content-Type', 'application/json')
        .send({ username: 'test', email: 'test@example.com', password: 'password' })
        .expect(201);

      expect(response.body).toHaveProperty('token');
    });

    test('should handle multipart/form-data for file uploads', async () => {
      // This will fail auth but tests that multipart is handled
      const response = await request(app)
        .post('/api/capsules')
        .field('message', 'test')
        .field('unlockDate', '2025-12-31')
        .field('lockedDate', '2025-01-01')
        .attach('image', Buffer.from('fake'), 'test.jpg')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });

  describe('Error Handling', () => {
    test('should handle server errors gracefully', async () => {
      // Send malformed data that might cause server error
      const response = await request(app)
        .post('/api/users/register')
        .send({ 
          username: null, 
          email: null, 
          password: null 
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});

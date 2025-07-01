const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Server basic routes', () => {
  it('GET / should return API live message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Time Capsule API is live');
  });

  it('GET /unknown should return 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('❌ Endpoint not found');
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
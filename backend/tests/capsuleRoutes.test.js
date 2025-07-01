const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Capsule = require('../models/Capsule');

describe('Capsule routes', () => {
  let token, capsuleId;

  beforeAll(async () => {
    await User.deleteMany({});
    await Capsule.deleteMany({});
    // Register and login user
    await request(app).post('/api/users/register').send({
      username: 'capuser',
      email: 'capuser@example.com',
      password: 'Test1234!',
    });
    const loginRes = await request(app).post('/api/users/login').send({
      email: 'capuser@example.com',
      password: 'Test1234!',
    });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Capsule.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a capsule', async () => {
    const res = await request(app)
      .post('/api/capsules')
      .set('Authorization', `Bearer ${token}`)
      .field('message', 'Hello Capsule')
      .field('unlockDate', new Date(Date.now() + 10000).toISOString())
      .field('lockedDate', new Date().toISOString());
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Hello Capsule');
    capsuleId = res.body._id;
  });

  it('should not create capsule with missing fields', async () => {
    const res = await request(app)
      .post('/api/capsules')
      .set('Authorization', `Bearer ${token}`)
      .field('message', '')
      .field('unlockDate', '')
      .field('lockedDate', '');
    expect(res.statusCode).toBe(400);
  });

  it('should get all capsules', async () => {
    const res = await request(app)
      .get('/api/capsules/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get unlocked capsules', async () => {
    const res = await request(app)
      .get('/api/capsules/unlocked')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should delete a capsule', async () => {
    const res = await request(app)
      .delete(`/api/capsules/${capsuleId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('should not delete capsule with wrong id', async () => {
    const res = await request(app)
      .delete(`/api/capsules/123456789012`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
  });
});
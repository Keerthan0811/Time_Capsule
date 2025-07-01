const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('User routes', () => {
  let token;
  const testUser = { username: 'testuser', email: 'test@example.com', password: 'Test1234!' };

  beforeAll(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/users/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register duplicate user', async () => {
    const res = await request(app).post('/api/users/register').send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should not login with wrong password', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should access protected route with token', async () => {
    // Ensure user exists in DB
    const user = await User.findOne({ email: testUser.email });
    expect(user).not.toBeNull();

    const res = await request(app)
      .get('/api/users/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/authorized/i);
  });

  it('should not access protected route without token', async () => {
    const res = await request(app).get('/api/users/protected');
    expect(res.statusCode).toBe(401);
  });
});
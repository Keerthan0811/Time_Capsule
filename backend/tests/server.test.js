const request = require('supertest');
const express = require('express');
const app = require('../server'); // Adjust if needed
const mongoose = require('mongoose'); // Add this line

describe('GET /', () => {
  it('should return API live message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Time Capsule API is live');
  });
});

// Close MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
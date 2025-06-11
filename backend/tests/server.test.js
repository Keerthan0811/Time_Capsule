const request = require('supertest');
const express = require('express');
const app = require('../server'); // Adjust if needed

describe('GET /', () => {
  it('should return API live message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Time Capsule API is live');
  });
});
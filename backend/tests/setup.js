const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { jest } = require('@jest/globals');

let mongod;

// Setup test database
beforeAll(async () => {
  // Start in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);
  
  // Set test environment variables
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.NODE_ENV = 'test';
});

// Clean database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

// Global test timeout
jest.setTimeout(30000);

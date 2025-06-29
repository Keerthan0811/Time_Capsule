const mongoose = require('mongoose');
const connectDB = require('../../config/db');

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn()
}));

describe('Database Configuration Tests', () => {
  let originalConsoleLog, originalConsoleError, originalProcessExit;

  beforeEach(() => {
    // Mock console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalProcessExit = process.exit;

    console.log = jest.fn();
    console.error = jest.fn();
    process.exit = jest.fn();

    // Clear mock calls
    mongoose.connect.mockClear();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  describe('successful connection', () => {
    test('should connect to MongoDB successfully', async () => {
      const mockConnectionObject = {
        connection: {
          host: 'localhost',
          name: 'test_db'
        }
      };

      mongoose.connect.mockResolvedValueOnce(mockConnectionObject);

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ MongoDB connected')
      );
    });

    test('should use correct connection options', async () => {
      const mockConnectionObject = {
        connection: {
          host: 'localhost',
          name: 'test_db'
        }
      };

      mongoose.connect.mockResolvedValueOnce(mockConnectionObject);

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    });
  });

  describe('connection failure', () => {
    test('should handle connection errors', async () => {
      const mockError = new Error('Connection failed');
      mongoose.connect.mockRejectedValueOnce(mockError);

      await connectDB();

      expect(console.error).toHaveBeenCalledWith('❌ MongoDB connection failed:', mockError.message);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('should handle network errors', async () => {
      const networkError = new Error('ENOTFOUND mongodb');
      mongoose.connect.mockRejectedValueOnce(networkError);

      await connectDB();

      expect(console.error).toHaveBeenCalledWith('❌ MongoDB connection failed:', networkError.message);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      mongoose.connect.mockRejectedValueOnce(authError);

      await connectDB();

      expect(console.error).toHaveBeenCalledWith('❌ MongoDB connection failed:', authError.message);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('environment variables', () => {
    test('should use MONGO_URI from environment', async () => {
      const testUri = 'mongodb://test:27017/testdb';
      const originalUri = process.env.MONGO_URI;
      process.env.MONGO_URI = testUri;

      const mockConnectionObject = {
        connection: {
          host: 'test',
          name: 'testdb'
        }
      };

      mongoose.connect.mockResolvedValueOnce(mockConnectionObject);

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(testUri);

      // Restore original URI
      process.env.MONGO_URI = originalUri;
    });
  });
});

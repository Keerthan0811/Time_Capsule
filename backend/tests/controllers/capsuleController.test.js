const {
  createCapsule,
  getUnlockedCapsules,
  getAllCapsules,
  deleteCapsule
} = require('../../controllers/capsuleController');
const Capsule = require('../../models/Capsule');
const User = require('../../models/User');

// Mock models
jest.mock('../../models/Capsule');
jest.mock('../../models/User');

describe('Capsule Controller Tests', () => {
  let req, res, mockUser;

  beforeEach(() => {
    mockUser = {
      _id: 'user123',
      username: 'testuser',
      email: 'test@example.com'
    };

    req = {
      user: mockUser,
      body: {},
      file: null,
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCapsule', () => {
    test('should create capsule successfully', async () => {
      const capsuleData = {
        message: 'Test message',
        unlockDate: '2025-12-31T00:00:00.000Z',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };

      req.body = capsuleData;

      const mockSavedCapsule = {
        _id: 'capsule123',
        ...capsuleData,
        user: mockUser._id,
        unlockDate: new Date(capsuleData.unlockDate),
        lockedDate: new Date(capsuleData.lockedDate)
      };

      const mockCapsule = {
        save: jest.fn().mockResolvedValue(mockSavedCapsule)
      };

      Capsule.mockImplementation(() => mockCapsule);

      await createCapsule(req, res);

      expect(Capsule).toHaveBeenCalledWith({
        message: capsuleData.message,
        unlockDate: new Date(capsuleData.unlockDate),
        lockedDate: new Date(capsuleData.lockedDate),
        user: mockUser._id
      });
      expect(mockCapsule.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedCapsule);
    });

    test('should return 400 for missing required fields', async () => {
      req.body = { message: 'Test message' }; // missing unlockDate and lockedDate

      await createCapsule(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message, unlockDate, and lockedDate are required'
      });
    });

    test('should return 400 for invalid date format', async () => {
      req.body = {
        message: 'Test message',
        unlockDate: 'invalid-date',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };

      await createCapsule(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid unlockDate or lockedDate format'
      });
    });

    test('should handle image upload', async () => {
      req.body = {
        message: 'Test message',
        unlockDate: '2025-12-31T00:00:00.000Z',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };
      req.file = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg'
      };

      const mockSavedCapsule = { _id: 'capsule123' };
      const mockCapsule = {
        image: {},
        save: jest.fn().mockResolvedValue(mockSavedCapsule)
      };

      Capsule.mockImplementation(() => mockCapsule);

      await createCapsule(req, res);

      expect(mockCapsule.image.data).toBe(req.file.buffer);
      expect(mockCapsule.image.contentType).toBe(req.file.mimetype);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should reject non-image file upload', async () => {
      req.body = {
        message: 'Test message',
        unlockDate: '2025-12-31T00:00:00.000Z',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };
      req.file = {
        buffer: Buffer.from('fake file data'),
        mimetype: 'text/plain'
      };

      await createCapsule(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Uploaded file must be an image'
      });
    });

    test('should handle save error', async () => {
      req.body = {
        message: 'Test message',
        unlockDate: '2025-12-31T00:00:00.000Z',
        lockedDate: '2025-01-01T00:00:00.000Z'
      };

      const mockCapsule = {
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      Capsule.mockImplementation(() => mockCapsule);

      await createCapsule(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error while creating capsule'
      });
    });
  });

  describe('getUnlockedCapsules', () => {
    test('should return unlocked capsules', async () => {
      const mockCapsules = [
        {
          _id: 'capsule1',
          _doc: {
            _id: 'capsule1',
            message: 'Test message 1',
            unlockDate: new Date('2025-01-01'),
            user: mockUser._id,
            notified: false
          },
          image: {
            data: Buffer.from('image1'),
            contentType: 'image/jpeg'
          },
          save: jest.fn().mockResolvedValue(true)
        },
        {
          _id: 'capsule2',
          _doc: {
            _id: 'capsule2',
            message: 'Test message 2',
            unlockDate: new Date('2025-01-01'),
            user: mockUser._id,
            notified: true
          },
          image: { data: null },
          save: jest.fn().mockResolvedValue(true)
        }
      ];

      Capsule.find = jest.fn().mockResolvedValue(mockCapsules);

      await getUnlockedCapsules(req, res);

      expect(Capsule.find).toHaveBeenCalledWith({
        user: mockUser._id,
        unlockDate: { $lte: expect.any(Date) }
      });

      expect(mockCapsules[0].save).toHaveBeenCalled(); // First capsule should be marked as notified
      expect(mockCapsules[1].save).not.toHaveBeenCalled(); // Second capsule already notified

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          _id: 'capsule1',
          image: expect.stringContaining('data:image/jpeg;base64,')
        }),
        expect.objectContaining({
          _id: 'capsule2',
          image: null
        })
      ]));
    });

    test('should handle database error', async () => {
      Capsule.find = jest.fn().mockRejectedValue(new Error('Database error'));

      await getUnlockedCapsules(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error while fetching unlocked capsules'
      });
    });
  });

  describe('getAllCapsules', () => {
    test('should return all capsules for user', async () => {
      const mockCapsules = [
        {
          _doc: {
            _id: 'capsule1',
            message: 'Test message 1',
            user: mockUser._id
          },
          image: {
            data: Buffer.from('image1'),
            contentType: 'image/png'
          }
        },
        {
          _doc: {
            _id: 'capsule2',
            message: 'Test message 2',
            user: mockUser._id
          },
          image: null
        }
      ];

      Capsule.find = jest.fn().mockResolvedValue(mockCapsules);

      await getAllCapsules(req, res);

      expect(Capsule.find).toHaveBeenCalledWith({ user: mockUser._id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          _id: 'capsule1',
          image: expect.stringContaining('data:image/png;base64,')
        }),
        expect.objectContaining({
          _id: 'capsule2',
          image: null
        })
      ]));
    });

    test('should handle database error', async () => {
      Capsule.find = jest.fn().mockRejectedValue(new Error('Database error'));

      await getAllCapsules(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error while fetching capsules'
      });
    });
  });

  describe('deleteCapsule', () => {
    test('should delete capsule successfully', async () => {
      req.params.id = 'capsule123';

      const mockCapsule = {
        _id: 'capsule123',
        user: mockUser._id,
        deleteOne: jest.fn().mockResolvedValue(true)
      };

      Capsule.findById = jest.fn().mockResolvedValue(mockCapsule);

      await deleteCapsule(req, res);

      expect(Capsule.findById).toHaveBeenCalledWith('capsule123');
      expect(mockCapsule.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Capsule deleted' });
    });

    test('should return 404 for non-existent capsule', async () => {
      req.params.id = 'nonexistent';

      Capsule.findById = jest.fn().mockResolvedValue(null);

      await deleteCapsule(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Capsule not found' });
    });

    test('should return 403 for unauthorized deletion', async () => {
      req.params.id = 'capsule123';

      const mockCapsule = {
        _id: 'capsule123',
        user: 'differentuser',
        toString: jest.fn().mockReturnValue('differentuser')
      };

      Capsule.findById = jest.fn().mockResolvedValue(mockCapsule);

      await deleteCapsule(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });

    test('should handle database error', async () => {
      req.params.id = 'capsule123';

      Capsule.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await deleteCapsule(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error while deleting capsule'
      });
    });
  });
});

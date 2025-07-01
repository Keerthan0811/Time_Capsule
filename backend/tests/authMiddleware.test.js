const { protect } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

jest.mock('../models/User');

describe('authMiddleware', () => {
  const user = { _id: '123', username: 'testuser' };
  const secret = 'testsecret';
  const token = jwt.sign({ id: user._id }, secret);

  let req, res, next;

  beforeEach(() => {
    req = { headers: { authorization: `Bearer ${token}` } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    process.env.JWT_SECRET = secret;

    // Mock the chain: findById().select()
    const select = jest.fn().mockResolvedValue(user);
    User.findById.mockReturnValue({ select });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if token is valid', async () => {
    await protect(req, res, next);
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidtoken';
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
  });

  it('should return 401 if no token', async () => {
    req.headers = {};
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
  });
});
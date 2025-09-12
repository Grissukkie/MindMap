import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { generateToken } from '../middleware/auth';
import { ApiResponse, SignupRequest, LoginRequest, AuthResponse } from '../types';

const router = Router();

// POST /api/auth/signup - User registration
router.post('/signup', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name }: SignupRequest = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'Email, password, and name are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password too short',
      message: 'Password must be at least 6 characters long'
    });
  }

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'User already exists',
      message: 'An account with this email already exists'
    });
  }

  // Create new user
  const user = new UserModel({
    email,
    password,
    name
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id.toString(), user.email);

  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    },
    message: 'Account created successfully'
  };

  res.status(201).json(response);
}));

// POST /api/auth/login - User login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing credentials',
      message: 'Email and password are required'
    });
  }

  // Find user
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.email);

  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    },
    message: 'Login successful'
  };

  res.json(response);
}));

// GET /api/auth/me - Get current user
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  // This route should be protected by authenticateToken middleware
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
      message: 'Please log in to access this resource'
    });
  }

  const response: ApiResponse = {
    success: true,
    data: req.user,
    message: 'User data retrieved successfully'
  };

  res.json(response);
}));

export default router;

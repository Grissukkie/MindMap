import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { JWTPayload } from '../types';
import { asyncHandler } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export const authenticateToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please log in to access this resource'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
    
    const user = await UserModel.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    });
  }
});

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

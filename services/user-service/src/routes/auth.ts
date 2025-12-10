import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
import { Logger } from '../utils/logger';
import { config } from '../utils/config';
import { 
  createValidationError,
  createUnauthorizedError,
  createConflictError,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  asyncHandler
} from '../utils/helpers';
import { authMiddleware } from '../middleware/auth';

// Types
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export default function createAuthRoutes(
  prisma: PrismaClient, 
  redis: RedisClientType, 
  logger: Logger
): Router {
  const router = Router();

  // Session tracking removed - using stateless JWT authentication

  // Register new user
  router.post('/register', asyncHandler(async (req: any, res: any) => {
    const { username, email, password }: RegisterRequest = req.body;

    try {
      // Validate input
      if (!username || !isValidUsername(username)) {
        throw createValidationError('username', 'Username must be 3-20 characters and contain only letters, numbers, and underscores');
      }

      if (!email || !isValidEmail(email)) {
        throw createValidationError('email', 'Please provide a valid email address');
      }

      if (!password || !isValidPassword(password)) {
        throw createValidationError('password', 'Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          throw createConflictError('Email already registered');
        } else {
          throw createConflictError('Username already taken');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          permissionRole: 'USER',
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.permissionRole 
        } as object,
        config.jwt.secret as string,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      );

      logger.info('User registered successfully', { userId: user.id, email });

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.permissionRole,
            createdAt: user.createdAt,
          },
          token,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });

    } catch (error: any) {
      logger.error('Registration failed', error);
      throw error;
    }
  }));

  // Login user
  router.post('/login', asyncHandler(async (req: any, res: any) => {
    const { email, password }: LoginRequest = req.body;

    try {
      // Validate input
      if (!email || !isValidEmail(email)) {
        throw createValidationError('email', 'Please provide a valid email address');
      }

      if (!password) {
        throw createValidationError('password', 'Password is required');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw createUnauthorizedError('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw createUnauthorizedError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw createUnauthorizedError('Account is suspended');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.permissionRole 
        } as object,
        config.jwt.secret as string,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      );

      logger.info('User logged in successfully', { userId: user.id, email });

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.permissionRole,
            lastLogin: user.lastLogin,
          },
          token,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });

    } catch (error: any) {
      logger.error('Login failed', error);
      throw error;
    }
  }));

  // Logout user
  router.post('/logout', authMiddleware(prisma, logger), asyncHandler(async (req: any, res: any) => {
    try {
      // In a stateless JWT setup, logout is typically handled client-side
      // Token blacklisting with Redis could be added here if needed
      
      logger.info('User logged out', { userId: req.user.id });

      res.status(200).json({
        status: 'success',
        data: {
          message: 'Logged out successfully'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });

    } catch (error: any) {
      logger.error('Logout failed', error);
      throw error;
    }
  }));

  // Get current user
  router.get('/me', authMiddleware(prisma, logger), asyncHandler(async (req: any, res: any) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          permissionRole: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        }
      });

      if (!user) {
        throw createUnauthorizedError('User not found');
      }

      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });

    } catch (error: any) {
      logger.error('Get current user failed', error);
      throw error;
    }
  }));

  return router;
}

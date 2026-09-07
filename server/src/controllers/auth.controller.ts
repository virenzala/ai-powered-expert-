import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth.middleware';
import { inMemoryStore } from '../services/inMemoryStore';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
        code: 'MISSING_FIELDS',
      });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();

    let existingUser: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingUser = await User.findOne({ email: cleanEmail });
      } catch (dbErr) {
        existingUser = inMemoryStore.findUserByEmail(cleanEmail);
      }
    } else {
      existingUser = inMemoryStore.findUserByEmail(cleanEmail);
    }

    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists.', code: 'USER_EXISTS' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let user: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.create({
          name: String(name).trim(),
          email: cleanEmail,
          passwordHash,
          role: role || 'Sales',
        });
      } catch (createErr) {
        user = inMemoryStore.createUser({
          name: String(name).trim(),
          email: cleanEmail,
          passwordHash,
          role: role || 'Sales',
        });
      }
    } else {
      user = inMemoryStore.createUser({
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
        role: role || 'Sales',
      });
    }

    inMemoryStore.addUser(user);

    const userId = user._id ? user._id.toString() : user.id;
    const token = jwt.sign({ id: userId, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });

    try {
      if (mongoose.connection.readyState === 1) {
        await ActivityLog.create({
          user: userId,
          userName: user.name,
          userRole: user.role,
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: userId,
          details: `User account created for ${user.email} with role ${user.role}.`,
        });
      } else {
        inMemoryStore.addActivityLog({
          userName: user.name,
          userRole: user.role,
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: userId,
          details: `User account created for ${user.email} with role ${user.role}.`,
        });
      }
    } catch (logErr) {
      // Activity log failure should not crash registration
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed due to a server error.',
      code: 'SERVER_ERROR',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        code: 'MISSING_FIELDS',
      });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: cleanEmail });
      } catch (dbErr) {
        user = inMemoryStore.findUserByEmail(cleanEmail);
      }
    }
    
    if (!user) {
      user = inMemoryStore.findUserByEmail(cleanEmail);
    }

    if (!user || user.active === false) {
      res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.', code: 'INVALID_CREDENTIALS' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.', code: 'INVALID_CREDENTIALS' });
      return;
    }

    user.lastLogin = new Date();
    if (mongoose.connection.readyState === 1 && typeof user.save === 'function') {
      try {
        await user.save();
      } catch (e) {
        // Ignore save error
      }
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = jwt.sign({ id: userId, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });

    try {
      if (mongoose.connection.readyState === 1) {
        await ActivityLog.create({
          user: userId,
          userName: user.name,
          userRole: user.role,
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: userId,
          details: `User ${user.email} logged in successfully.`,
        });
      } else {
        inMemoryStore.addActivityLog({
          userName: user.name,
          userRole: user.role,
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: userId,
          details: `User ${user.email} logged in successfully.`,
        });
      }
    } catch (logErr) {
      // Ignore non-critical log errors
    }

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed due to a server error.',
      code: 'SERVER_ERROR',
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return success to avoid email enumeration
    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been generated.' });
    return;
  }

  res.json({
    success: true,
    message: 'Password reset code generated.',
    resetToken: 'mock_reset_token_' + Date.now(),
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { resetToken, newPassword, email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(400).json({ success: false, message: 'Invalid reset request.', code: 'INVALID_RESET' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ success: true, message: 'Password updated successfully. Please log in with your new password.' });
};

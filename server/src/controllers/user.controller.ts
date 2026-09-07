import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { inMemoryStore } from '../services/inMemoryStore';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let users: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      } catch (e) {
        users = inMemoryStore.users;
      }
    } else {
      users = inMemoryStore.users;
    }
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    let existing: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existing = await User.findOne({ email: email.toLowerCase() });
      } catch (e) {
        existing = inMemoryStore.findUserByEmail(email);
      }
    } else {
      existing = inMemoryStore.findUserByEmail(email);
    }

    if (existing) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let user: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.create({
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: role || 'Sales',
        });
      } catch (e) {
        user = inMemoryStore.createUser({ name, email, passwordHash, role });
      }
    } else {
      user = inMemoryStore.createUser({ name, email, passwordHash, role });
    }

    res.status(201).json({
      success: true,
      data: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id ? req.user._id.toString() : req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, avatarUrl, title, phone, bio } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = String(avatarUrl).trim();
    if (title !== undefined) updateData.title = String(title).trim();
    if (phone !== undefined) updateData.phone = String(phone).trim();
    if (bio !== undefined) updateData.bio = String(bio).trim();

    let updatedUser: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-passwordHash');
      } catch (dbErr) {
        updatedUser = inMemoryStore.updateUser(userId, updateData);
      }
    }

    if (!updatedUser) {
      updatedUser = inMemoryStore.updateUser(userId, updateData);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id ? updatedUser._id.toString() : updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        title: updatedUser.title,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, role, active, password, avatarUrl, title, phone, bio } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (typeof active === 'boolean') updateData.active = active;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (title) updateData.title = title;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    let user: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-passwordHash');
      } catch (e) {
        user = inMemoryStore.updateUser(req.params.id, updateData);
      }
    } else {
      user = inMemoryStore.updateUser(req.params.id, updateData);
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        await User.findByIdAndDelete(req.params.id);
      } catch (e) {}
    }
    res.json({ success: true, message: 'User account removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    user: user.toJSON ? user.toJSON() : user,
  });
};

export const register = async (req, res) => {
  try {
    const { username, password, displayName, className } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedUsername = trimmedUsername.toLowerCase();

    // Check if username already exists
    const existingUser = await User.findOne({ normalizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: trimmedUsername,
      normalizedUsername,
      passwordHash,
      displayName: displayName?.trim() || trimmedUsername,
      className: className?.trim() || 'MCA 2nd Sem',
    });

    return sendTokenResponse(newUser, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ normalizedUsername });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'Server error updating password.' });
  }
};

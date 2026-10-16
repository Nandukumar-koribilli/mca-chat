import { User } from '../models/User.js';

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q?.trim() || '';
    if (!query) {
      return res.status(200).json({ success: true, users: [] });
    }

    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeQuery, 'i');
    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { username: regex },
        { displayName: regex },
      ],
    })
      .select('_id username displayName className avatar bio')
      .limit(20);

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ message: 'Error searching users.' });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ normalizedUsername: username }).select(
      '_id username displayName className avatar bio createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Error fetching student profile.' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { displayName, className, bio, avatar, preferences } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (displayName) user.displayName = displayName.trim();
    if (className) user.className = className.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Error updating profile.' });
  }
};

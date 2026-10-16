import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    normalizedUsername: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    className: {
      type: String,
      default: 'MCA 2nd Sem',
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'Student passionate about computer applications and technology.',
      maxlength: 250,
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      notifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Exclude passwordHash when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model('User', userSchema);

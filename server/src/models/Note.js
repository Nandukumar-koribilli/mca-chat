import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      enum: ['green', 'lavender', 'amber', 'rose', 'sky'],
      default: 'green',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Note = mongoose.model('Note', noteSchema);

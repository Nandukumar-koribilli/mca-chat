import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
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
      maxlength: 150,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    testDate: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    location: {
      type: String,
      default: 'Main Hall',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    preparationNotes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed'],
      default: 'upcoming',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Test = mongoose.model('Test', testSchema);

import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
      trim: true, // e.g. "8:30 AM"
    },
    lesson: {
      type: String,
      required: true,
      trim: true, // e.g. "Math"
    },
    teacher: {
      type: String,
      required: true,
      trim: true, // e.g. "Mrs. Goodman"
    },
    teacherAvatar: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: true,
      trim: true, // e.g. "B3, Room 124"
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: 'Monday',
    },
    date: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

export const Schedule = mongoose.model('Schedule', scheduleSchema);

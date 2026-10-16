import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    participantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Enforces uniqueness for direct conversations between pairs of students
    directKey: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    lastMessage: {
      content: { type: String, default: '' },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participantIds: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);

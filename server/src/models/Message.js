import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'system', 'image', 'video', 'file'],
      default: 'text',
    },
    // File catalog metadata (stored in MongoDB for availability & ownership)
    fileMeta: {
      name: { type: String, trim: true },
      fileType: { type: String, trim: true },
      size: { type: Number },
      url: { type: String },
      p2pAvailable: { type: Boolean, default: false },
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);

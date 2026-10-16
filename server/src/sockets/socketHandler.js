import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

// Track online users: userId -> count of active sockets
const onlineUsers = new Map();

export const setupSocketHandlers = (io) => {
  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.headers?.cookie
          ?.split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication required for socket connection.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id username displayName avatar');

      if (!user) {
        return next(new Error('User not found.'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error('Socket authentication failed: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${socket.user.username} (${userId})`);

    // Track online status
    const currentCount = onlineUsers.get(userId) || 0;
    onlineUsers.set(userId, currentCount + 1);

    // Join personal user room for direct notifications
    socket.join(`user:${userId}`);

    // Broadcast user online status
    io.emit('user_online', { userId, username: socket.user.username });

    // Send current list of online user IDs
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // Join a specific conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Security check: must be a member
        const isParticipant = conversation.participantIds.some(
          (p) => p.toString() === userId
        );

        if (isParticipant) {
          socket.join(`conv:${conversationId}`);
        }
      } catch (err) {
        console.error('Socket join_conversation error:', err);
      }
    });

    // Leave a specific conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Send a message over socket (text, image, video, file, or P2P reference)
    socket.on('send_message', async ({ conversationId, content, messageType, fileMeta }) => {
      try {
        if (!content && !fileMeta) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participantIds.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) return;

        const textContent = (content || (fileMeta ? `[Shared ${fileMeta.fileType || 'file'}: ${fileMeta.name}]` : '')).trim();

        // Create and save message with file catalog metadata
        const message = await Message.create({
          conversationId,
          senderId: userId,
          content: textContent,
          messageType: messageType || (fileMeta ? fileMeta.fileType : 'text'),
          fileMeta: fileMeta || undefined,
          readBy: [userId],
        });

        // Update conversation summary
        conversation.lastMessage = {
          content: content.trim(),
          senderId: userId,
          createdAt: new Date(),
        };
        conversation.updatedAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate(
          'senderId',
          '_id username displayName avatar'
        );

        // Broadcast to everyone inside the conversation room
        io.to(`conv:${conversationId}`).emit('new_message', populatedMessage);

        // Also notify each participant's personal room to update their conversation list preview
        conversation.participantIds.forEach((pid) => {
          io.to(`user:${pid.toString()}`).emit('conversation_updated', {
            conversationId,
            lastMessage: populatedMessage,
          });
        });
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        username: socket.user.username,
        displayName: socket.user.displayName,
      });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId,
      });
    });

    // Read receipts
    socket.on('mark_as_read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversationId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );

        socket.to(`conv:${conversationId}`).emit('messages_read', {
          conversationId,
          readByUserId: userId,
        });
      } catch (err) {
        console.error('Socket mark_as_read error:', err);
      }
    });

    // ==========================================
    // Online Peer Discovery & WebRTC Signaling
    // ==========================================
    socket.on('signal_peer', ({ targetUserId, signal, metadata }) => {
      // Direct peer-to-peer signaling between mobile devices
      io.to(`user:${targetUserId}`).emit('peer_signal', {
        fromUserId: userId,
        fromUsername: socket.user.username,
        signal,
        metadata,
      });
    });

    socket.on('p2p_file_announce', ({ conversationId, fileMeta }) => {
      // Announce local P2P media availability to classmates
      socket.to(`conv:${conversationId}`).emit('p2p_file_available', {
        senderId: userId,
        senderUsername: socket.user.username,
        fileMeta,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const remainingCount = (onlineUsers.get(userId) || 1) - 1;
      if (remainingCount <= 0) {
        onlineUsers.delete(userId);
        io.emit('user_offline', { userId });
      } else {
        onlineUsers.set(userId, remainingCount);
      }
      console.log(`[Socket] User disconnected: ${socket.user.username}`);
    });
  });
};

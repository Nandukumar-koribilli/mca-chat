import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participantIds: req.userId,
    })
      .populate('participantIds', '_id username displayName avatar className')
      .populate('createdBy', '_id username displayName')
      .sort({ updatedAt: -1 });

    // Compute unread message count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: req.userId },
          readBy: { $ne: req.userId },
        });

        const convObj = conv.toObject();
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    return res.status(200).json({ success: true, conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ message: 'Error retrieving conversations.' });
  }
};

export const getOrCreateDirectConversation = async (req, res) => {
  try {
    const { recipientUsername, recipientId } = req.body;

    let recipient;
    if (recipientId) {
      recipient = await User.findById(recipientId);
    } else if (recipientUsername) {
      recipient = await User.findOne({ normalizedUsername: recipientUsername.trim().toLowerCase() });
    }

    if (!recipient) {
      return res.status(404).json({ message: 'Classmate not found with that username.' });
    }

    if (recipient._id.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot start a direct conversation with yourself.' });
    }

    // Deterministic direct key prevents duplicates
    const directKey = [req.userId, recipient._id.toString()].sort().join('_');

    let conversation = await Conversation.findOne({ directKey })
      .populate('participantIds', '_id username displayName avatar className')
      .populate('createdBy', '_id username displayName');

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participantIds: [req.userId, recipient._id],
        directKey,
        createdBy: req.userId,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participantIds', '_id username displayName avatar className')
        .populate('createdBy', '_id username displayName');
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error('Direct conversation error:', error);
    return res.status(500).json({ message: 'Error opening direct conversation.' });
  }
};

export const createGroupConversation = async (req, res) => {
  try {
    const { title, description, participantIds } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Group title is required.' });
    }

    const uniqueParticipants = Array.from(
      new Set([req.userId, ...(participantIds || [])])
    );

    let conversation = await Conversation.create({
      type: 'group',
      title: title.trim(),
      description: description?.trim() || '',
      participantIds: uniqueParticipants,
      createdBy: req.userId,
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('participantIds', '_id username displayName avatar className')
      .populate('createdBy', '_id username displayName');

    return res.status(201).json({ success: true, conversation });
  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({ message: 'Error creating group conversation.' });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Authorization check: User must be a participant
    const isParticipant = conversation.participantIds.some(
      (p) => p.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied to this conversation.' });
    }

    const limit = parseInt(req.query.limit) || 100;
    const messages = await Message.find({ conversationId: id })
      .populate('senderId', '_id username displayName avatar')
      .sort({ createdAt: 1 })
      .limit(limit);

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Error retrieving messages.' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, messageType, fileMeta } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Authorization check
    const isParticipant = conversation.participantIds.some(
      (p) => p.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied to this conversation.' });
    }

    const message = await Message.create({
      conversationId: id,
      senderId: req.userId,
      content: content.trim(),
      messageType: messageType || (fileMeta ? fileMeta.fileType : 'text'),
      fileMeta: fileMeta || undefined,
      readBy: [req.userId],
    });

    // Update conversation last message & timestamp
    conversation.lastMessage = {
      content: content.trim(),
      senderId: req.userId,
      createdAt: new Date(),
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'senderId',
      '_id username displayName avatar'
    );

    return res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ message: 'Error sending message.' });
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.updateMany(
      {
        conversationId: id,
        readBy: { $ne: req.userId },
      },
      {
        $addToSet: { readBy: req.userId },
      }
    );

    return res.status(200).json({ success: true, message: 'Conversation marked as read.' });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ message: 'Error marking messages as read.' });
  }
};

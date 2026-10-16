import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Users,
  User,
  MoreVertical,
  Smile,
  Circle,
  Clock,
  Check,
  CheckCheck,
  ArrowLeft,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Share2
} from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { getCachedMessages, saveCachedMessages, saveMediaFile } from '../services/localDb';

export const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const socket = getSocket();

  // Load conversations
  const loadConversations = async (selectFirst = false) => {
    try {
      const res = await api.get('/conversations');
      const convList = res.data.conversations || [];
      setConversations(convList);

      if (selectFirst && convList.length > 0 && !activeConv) {
        selectConversation(convList[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    loadConversations(true);
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('online_users', (userIds) => {
      setOnlineUserIds(new Set(userIds));
    });

    socket.on('user_online', ({ userId }) => {
      setOnlineUserIds((prev) => new Set([...prev, userId]));
    });

    socket.on('user_offline', ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on('new_message', (msg) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
        saveCachedMessages([msg]);
        // Auto mark as read
        socket.emit('mark_as_read', { conversationId: activeConv._id });
      }
      // Refresh conversation preview
      loadConversations(false);
    });

    socket.on('conversation_updated', () => {
      loadConversations(false);
    });

    socket.on('user_typing', ({ conversationId, username }) => {
      if (activeConv && conversationId === activeConv._id) {
        setTypingUsers((prev) => new Set([...prev, username]));
      }
    });

    socket.on('user_stop_typing', ({ conversationId, userId: uid }) => {
      if (activeConv && conversationId === activeConv._id) {
        setTypingUsers(new Set());
      }
    });

    return () => {
      socket.off('online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('new_message');
      socket.off('conversation_updated');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, activeConv]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Load messages for chosen conversation (Offline SQLite/IndexedDB cache first, then MongoDB Atlas)
  const selectConversation = async (conv) => {
    if (!conv) return;
    if (activeConv && socket) {
      socket.emit('leave_conversation', activeConv._id);
    }

    setActiveConv(conv);

    // 1. Instant load from phone local cache (0ms latency)
    const cached = await getCachedMessages(conv._id);
    if (cached && cached.length > 0) {
      setMessages(cached);
    } else {
      setLoadingMessages(true);
    }

    // 2. Fetch fresh from MongoDB Atlas cloud catalog
    try {
      const res = await api.get(`/conversations/${conv._id}/messages`);
      const freshMessages = res.data.messages || [];
      setMessages(freshMessages);
      saveCachedMessages(freshMessages);

      if (socket) {
        socket.emit('join_conversation', conv._id);
        socket.emit('mark_as_read', { conversationId: conv._id });
      }

      await api.post(`/conversations/${conv._id}/read`);

      // Clear unread badge locally
      setConversations((prev) =>
        prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('Failed to load messages from cloud:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Search classmates by username
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Start direct conversation with selected classmate
  const handleStartDirectChat = async (classmate) => {
    try {
      const res = await api.post('/conversations/direct', {
        recipientId: classmate._id,
      });
      const conv = res.data.conversation;
      setSearchQuery('');
      setSearchResults([]);
      await loadConversations(false);
      selectConversation(conv);
    } catch (err) {
      console.error('Failed to start direct conversation:', err);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    const content = inputMessage.trim();
    setInputMessage('');

    if (socket) {
      socket.emit('stop_typing', { conversationId: activeConv._id });
      socket.emit('send_message', {
        conversationId: activeConv._id,
        content,
      });
    } else {
      // HTTP fallback
      try {
        const res = await api.post(`/conversations/${activeConv._id}/messages`, { content });
        setMessages((prev) => [...prev, res.data.message]);
        saveCachedMessages([res.data.message]);
        loadConversations(false);
      } catch (err) {
        console.error('Failed to send message via HTTP:', err);
      }
    }
  };

  // Handle Image, Video, or PDF selected from phone storage / gallery
  const handleAttachmentSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    setUploadingAttachment(true);
    try {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      const isPdf = file.type === 'application/pdf';
      const fileType = isImg ? 'image' : isVid ? 'video' : isPdf ? 'file' : 'file';

      const reader = new FileReader();
      reader.onload = async (evt) => {
        let finalDataUrl = evt.target.result;

        // If large image, optimize with canvas to preserve bandwidth
        if (isImg) {
          try {
            const img = new window.Image();
            img.src = finalDataUrl;
            await new Promise((r) => { img.onload = r; });
            const MAX_DIM = 800;
            if (img.width > MAX_DIM || img.height > MAX_DIM) {
              const canvas = document.createElement('canvas');
              let w = img.width;
              let h = img.height;
              if (w > h) {
                h = Math.round((h * MAX_DIM) / w);
                w = MAX_DIM;
              } else {
                w = Math.round((w * MAX_DIM) / h);
                h = MAX_DIM;
              }
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              finalDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            }
          } catch {
            // Keep original dataUrl if optimization fails
          }
        }

        const fileId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // 1. Save to phone's local storage (media vault)
        await saveMediaFile({
          id: fileId,
          name: file.name,
          fileType,
          size: file.size,
          dataUrl: finalDataUrl,
        });

        // 2. Prepare file catalog metadata for MongoDB Atlas
        const fileMeta = {
          name: file.name,
          fileType,
          size: file.size,
          url: finalDataUrl,
          p2pAvailable: true,
        };

        const caption = `Shared ${fileType}: ${file.name}`;

        // 3. Send over Socket or HTTP
        if (socket) {
          socket.emit('send_message', {
            conversationId: activeConv._id,
            content: caption,
            messageType: fileType,
            fileMeta,
          });
          // Announce P2P file availability over Node.js signaling service
          socket.emit('p2p_file_announce', {
            conversationId: activeConv._id,
            fileMeta,
          });
        } else {
          const res = await api.post(`/conversations/${activeConv._id}/messages`, {
            content: caption,
            messageType: fileType,
            fileMeta,
          });
          setMessages((prev) => [...prev, res.data.message]);
          saveCachedMessages([res.data.message]);
        }

        setUploadingAttachment(false);
        if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to attach media file:', err);
      setUploadingAttachment(false);
    }
  };

  // Typing indicator trigger
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (!socket || !activeConv) return;

    socket.emit('typing', { conversationId: activeConv._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConv._id });
    }, 1500);
  };

  const getConversationTitle = (conv) => {
    if (conv.type === 'group') return conv.title || 'MCA Cohort Discussion';
    const other = conv.participantIds?.find((p) => p._id !== user?._id);
    return other?.displayName || other?.username || 'Classmate';
  };

  const getConversationAvatar = (conv) => {
    if (conv.type === 'group') return null;
    const other = conv.participantIds?.find((p) => p._id !== user?._id);
    return other?.avatar || null;
  };

  const isOtherUserOnline = (conv) => {
    if (conv.type === 'group') return false;
    const other = conv.participantIds?.find((p) => p._id !== user?._id);
    return other ? onlineUserIds.has(other._id) : false;
  };

  return (
    <div className="bg-white rounded-3xl sm:rounded-4xl shadow-card border border-black/[0.04] overflow-hidden h-[calc(100vh-170px)] sm:h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* LEFT PANEL: Conversations & Student Search (Hidden on mobile when chat is active) */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-white h-full ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        {/* Search Students By Username Bar (Essential Requirement 8.2) */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by username..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchQuery.trim() && (
            <div className="mt-2 bg-white rounded-2.5xl border border-gray-100 shadow-card-hover p-2 max-h-60 overflow-y-auto custom-scrollbar">
              <p className="text-[11px] font-bold text-gray-400 px-2 py-1">Classmates</p>
              {searching ? (
                <p className="text-xs text-gray-400 px-2 py-3 text-center">Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-gray-400 px-2 py-3 text-center">No student found.</p>
              ) : (
                searchResults.map((classmate) => (
                  <button
                    key={classmate._id}
                    onClick={() => handleStartDirectChat(classmate)}
                    className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-brand-canvas transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {classmate.avatar ? (
                        <img
                          src={classmate.avatar}
                          alt={classmate.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-dark text-white font-bold text-xs flex items-center justify-center">
                          {classmate.displayName?.charAt(0) || classmate.username?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-brand-dark">{classmate.displayName}</p>
                        <p className="text-[10px] text-gray-400">@{classmate.username}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-purple bg-brand-purple-light px-2.5 py-1 rounded-full">
                      Chat
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-brand-muted">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-semibold">No conversations yet.</p>
              <p className="text-[11px] text-gray-400 mt-1">Search for a classmate above to start messaging.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConv?._id === conv._id;
              const title = getConversationTitle(conv);
              const avatar = getConversationAvatar(conv);
              const isOnline = isOtherUserOnline(conv);

              return (
                <button
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2.5xl transition-all text-left relative ${
                    isActive ? 'bg-brand-canvas shadow-sm font-semibold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {/* Avatar with optional online dot */}
                  <div className="relative flex-shrink-0">
                    {conv.type === 'group' ? (
                      <div className="w-11 h-11 rounded-2xl bg-brand-purple/20 text-brand-purple-text flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : avatar ? (
                      <img src={avatar} alt={title} className="w-11 h-11 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-brand-dark text-white font-bold flex items-center justify-center text-sm">
                        {title.charAt(0)}
                      </div>
                    )}

                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>

                  {/* Conversation Title & Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-brand-dark truncate">{title}</p>
                      <span className="text-[10px] text-gray-400">
                        {conv.lastMessage?.createdAt
                          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 truncate">
                      {conv.lastMessage?.content || 'Start conversation...'}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-purple text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MIDDLE PANEL: Active Chat Stream */}
      <div className={`flex-1 flex flex-col bg-gray-50/40 h-full ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            {/* Active Header */}
            <div className="px-3.5 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-xl hover:bg-gray-100 text-brand-dark transition-colors flex-shrink-0"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative flex-shrink-0">
                  {activeConv.type === 'group' ? (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-purple/20 text-brand-purple-text flex items-center justify-center font-bold">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-dark text-white font-bold flex items-center justify-center text-xs sm:text-sm">
                      {getConversationTitle(activeConv).charAt(0)}
                    </div>
                  )}
                  {isOtherUserOnline(activeConv) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-brand-dark">
                    {getConversationTitle(activeConv)}
                  </h3>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    {activeConv.type === 'group' ? (
                      `${activeConv.participantIds?.length || 4} student members`
                    ) : isOtherUserOnline(activeConv) ? (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                      </span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-2xl hover:bg-gray-100 text-gray-500 flex items-center justify-center">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-brand-muted">
                  <p className="text-xs font-semibold">Start the conversation</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Send your first message to connect with your classmate.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                  const senderName = msg.senderId?.displayName || msg.senderId?.username || 'User';

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-lg ${
                        isMe ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      {activeConv.type === 'group' && !isMe && (
                        <span className="text-[10px] font-bold text-gray-400 mb-0.5 ml-1">
                          {senderName}
                        </span>
                      )}

                      <div
                        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-3xl text-xs leading-relaxed font-medium shadow-sm ${
                          isMe
                            ? 'bg-brand-dark text-white rounded-br-sm'
                            : 'bg-white text-brand-dark border border-black/[0.04] rounded-bl-sm'
                        }`}
                      >
                        {/* File Catalog Attachment (Images, Videos, PDFs from phone local storage & P2P) */}
                        {msg.fileMeta && (
                          <div className="mb-2">
                            {msg.fileMeta.fileType === 'image' && msg.fileMeta.url && (
                              <img
                                src={msg.fileMeta.url}
                                alt={msg.fileMeta.name || 'Shared Photo'}
                                className="rounded-2xl max-h-64 max-w-full object-cover border border-black/10 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => window.open(msg.fileMeta.url, '_blank')}
                              />
                            )}

                            {msg.fileMeta.fileType === 'video' && msg.fileMeta.url && (
                              <video
                                src={msg.fileMeta.url}
                                controls
                                className="rounded-2xl max-h-64 max-w-full border border-black/10"
                              />
                            )}

                            {msg.fileMeta.fileType !== 'image' && msg.fileMeta.fileType !== 'video' && (
                              <div
                                onClick={() => msg.fileMeta.url && window.open(msg.fileMeta.url, '_blank')}
                                className={`flex items-center gap-2.5 p-2.5 rounded-2xl cursor-pointer transition-all ${
                                  isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-brand-canvas hover:bg-gray-100'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-xl bg-brand-purple/20 text-brand-purple-text flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{msg.fileMeta.name}</p>
                                </div>
                                <Download className="w-4 h-4 opacity-75 flex-shrink-0" />
                              </div>
                            )}
                          </div>
                        )}

                        <div>{msg.content}</div>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400 px-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-3 h-3 text-brand-purple ml-0.5" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing notification indicator */}
              {typingUsers.size > 0 && (
                <div className="text-[11px] text-brand-purple font-medium flex items-center gap-2 italic animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>{Array.from(typingUsers).join(', ')} typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar with Phone Gallery & File Attachment */}
            <form onSubmit={handleSendMessage} className="p-2.5 sm:p-4 bg-white border-t border-gray-100 flex items-center gap-1.5 sm:gap-2">
              <input
                type="file"
                ref={attachmentInputRef}
                accept="image/*,video/*,application/pdf"
                className="hidden"
                onChange={handleAttachmentSelect}
              />

              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={uploadingAttachment}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl hover:bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 transition-colors active:scale-95"
                title="Attach image from gallery, video, or PDF"
              >
                <Paperclip className={`w-4 h-4 sm:w-5 sm:h-5 ${uploadingAttachment ? 'animate-spin text-brand-purple' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setInputMessage((prev) => prev + ' 👋 ')}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl hover:bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0"
                title="Add wave"
              >
                <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder={uploadingAttachment ? 'Saving media to phone storage...' : 'Type your message...'}
                disabled={uploadingAttachment}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl sm:rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || uploadingAttachment}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl sm:rounded-2.5xl bg-brand-dark hover:bg-black text-white flex items-center justify-center disabled:opacity-40 transition-all flex-shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-brand-muted">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-brand-dark">No chat selected</h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1">
              Select an existing group or direct conversation from the left, or search for a classmate to begin chatting.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL (Desktop): Participant & Group Info */}
      {activeConv && (
        <div className="hidden xl:flex w-72 border-l border-gray-100 p-6 flex-col justify-between bg-white">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">
              Conversation Details
            </h4>

            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-brand-canvas mx-auto flex items-center justify-center font-bold text-xl text-brand-dark mb-3">
                {getConversationTitle(activeConv).charAt(0)}
              </div>
              <h3 className="text-sm font-bold text-brand-dark">
                {getConversationTitle(activeConv)}
              </h3>
              <p className="text-xs text-brand-muted mt-1">
                {activeConv.type === 'group' ? 'General MCA Group' : 'Direct Conversation'}
              </p>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <h5 className="text-xs font-bold text-brand-dark mb-3">
                Participants ({activeConv.participantIds?.length || 0})
              </h5>
              <div className="space-y-3">
                {activeConv.participantIds?.map((participant) => (
                  <div key={participant._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-dark text-white font-bold text-[10px] flex items-center justify-center">
                        {participant.displayName?.charAt(0) || participant.username?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-brand-dark">{participant.displayName}</p>
                        <p className="text-[10px] text-gray-400">@{participant.username}</p>
                      </div>
                    </div>
                    {onlineUserIds.has(participant._id) ? (
                      <span className="text-[10px] font-semibold text-green-600">Online</span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Offline</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 text-center border-t border-gray-100 pt-3">
            Real-Time Socket.IO & MongoDB Atlas
          </div>
        </div>
      )}
    </div>
  );
};

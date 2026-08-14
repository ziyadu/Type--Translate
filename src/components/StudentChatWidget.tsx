import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  GraduationCap, 
  Sparkles, 
  Bot, 
  User, 
  Lightbulb, 
  Trash2, 
  Minimize2, 
  Maximize2,
  Pencil,
  MoreVertical,
  Check,
  Search,
  Users,
  HelpCircle,
  Filter,
  Smile,
  GripHorizontal,
  Move
} from 'lucide-react';
import { ChatMessage } from '../types';

interface StudentChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  currentContext?: {
    targetText: string;
    targetLang: string;
    wpm: number;
    accuracy: number;
  };
}

export type ChatChannel = 'tutor' | 'group' | 'qna';

interface ChannelConfig {
  id: ChatChannel;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const CHANNELS: ChannelConfig[] = [
  {
    id: 'tutor',
    name: 'Private AI Tutor',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    description: '1-on-1 typing speed & translation assistance',
  },
  {
    id: 'group',
    name: 'Student Study Group',
    icon: <Users className="w-3.5 h-3.5" />,
    description: 'Group chat with fellow learners & AI mod',
  },
  {
    id: 'qna',
    name: 'Q&A & Tips',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    description: 'Ergonomics, posture & technique questions',
  },
];

const INITIAL_CHANNEL_MESSAGES: Record<ChatChannel, ChatMessage[]> = {
  tutor: [
    {
      id: 'welcome-tutor-1',
      role: 'model',
      text: "👋 Hi there! I'm your **Private AI Student Assistant**. Ask me anything about typing speed, touch-typing techniques, translation meanings, or grammar!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  group: [
    {
      id: 'welcome-group-1',
      role: 'model',
      text: "👥 Welcome to the **Student Study Group**! Share your daily WPM milestones, ask group questions, or challenge study buddies to a practice run.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'group-peer-1',
      role: 'user',
      text: "Hey everyone! Just hit 65 WPM on the Spanish text mode! Anyone practicing French?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'group-ai-1',
      role: 'model',
      text: "Awesome achievement! Spanish typing helps build strong rhythm for accent marks and special characters like ¡ and ¿.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ],
  qna: [
    {
      id: 'welcome-qna-1',
      role: 'model',
      text: "💡 Welcome to **Q&A & Tips**! Ask about posture, finger placement, mechanical key switches, or reducing wrist strain.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'qna-tip-1',
      role: 'model',
      text: "📌 **Tip of the day**: Keep your elbows at a 90-degree angle and float your wrists slightly above the desk while typing for maximum ergonomics.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ],
};

const SUGGESTED_PROMPTS = [
  "⚡ How can I increase my WPM speed?",
  "🎯 Tips to improve accuracy & reduce mistakes?",
  "📖 Explain the grammar of this passage",
  "🌍 How does touch typing build muscle memory?",
];

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😜', '😎', '🤓', '🧐', '🥳', '🤔', '🫣', '🤫', '🤯', '😴']
  },
  {
    name: 'Study & Typing',
    emojis: ['⌨️', '💻', '📚', '📖', '✍️', '📝', '🎓', '⚡', '🎯', '💡', '🏆', '🥇', '🚀', '⏳', '📊', '📈', '🧠', '⭐', '📌', '🔍', '⚙️', '🌐', '💬', '🔔']
  },
  {
    name: 'Gestures & Flags',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '💪', '🔥', '✨', '🎉', '💯', '❤️', '💖', '👋', '✌️', '🤞', '🤙', '🙏', '👀', '💯', '🌟', '💖', '🌈', '🇺🇸', '🇪🇸', '🇫🇷', '🇩🇪']
  }
];

export const StudentChatWidget: React.FC<StudentChatWidgetProps> = ({
  isOpen,
  onClose,
  onOpen,
  currentContext,
}) => {
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('tutor');
  const [channelMessages, setChannelMessages] = useState<Record<ChatChannel, ChatMessage[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typewell_student_channels_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading saved channel chat history:', e);
        }
      }
    }
    return INITIAL_CHANNEL_MESSAGES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Draggable Messenger Bubble Position State
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messenger_bubble_pos');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            return parsed;
          }
        } catch (e) {}
      }
      return {
        x: Math.max(16, window.innerWidth - 80),
        y: Math.max(16, window.innerHeight - 150),
      };
    }
    return { x: 20, y: 500 };
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDistanceRef = useRef<number>(0);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    dragStartRef.current = { x: clientX, y: clientY };
    dragOffsetRef.current = {
      x: clientX - bubblePos.x,
      y: clientY - bubblePos.y,
    };

    const handleMove = (moveEvt: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const moveX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const moveY = 'touches' in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY;

      const dx = Math.abs(moveX - dragStartRef.current.x);
      const dy = Math.abs(moveY - dragStartRef.current.y);
      dragDistanceRef.current += dx + dy;

      const newX = Math.min(Math.max(10, moveX - dragOffsetRef.current.x), window.innerWidth - 70);
      const newY = Math.min(Math.max(10, moveY - dragOffsetRef.current.y), window.innerHeight - 70);

      setBubblePos({ x: newX, y: newY });
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);

      localStorage.setItem('messenger_bubble_pos', JSON.stringify(bubblePos));
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragDistanceRef.current < 6) {
      if (isOpen) {
        onClose();
      } else if (onOpen) {
        onOpen();
      }
    }
  };
  
  // Message edit & context menu state
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Emoji picker state
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeEmojiCategoryIndex, setActiveEmojiCategoryIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('typewell_student_channels_history', JSON.stringify(channelMessages));
  }, [channelMessages]);

  const currentMessages = channelMessages[activeChannel] || [];

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return currentMessages;
    const query = searchQuery.toLowerCase().trim();
    return currentMessages.filter((msg) =>
      msg.text.toLowerCase().includes(query) ||
      msg.role.toLowerCase().includes(query) ||
      msg.timestamp.toLowerCase().includes(query)
    );
  }, [currentMessages, searchQuery]);

  useEffect(() => {
    if (isOpen && !isMinimized && !searchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, isMinimized, currentMessages, searchQuery]);

  // Close context menu & emoji picker on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      setActiveMenuMsgId(null);
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  if (!isOpen) return null;

  const handleInsertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMsgs = [...currentMessages, userMsg];
    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel]: newMsgs,
    }));

    setInput('');
    setIsLoading(true);

    try {
      const payload = {
        messages: newMsgs.map((m) => ({
          role: m.role,
          text: m.text,
        })),
        context: {
          ...currentContext,
          channel: activeChannel,
        },
      };

      const response = await fetch('/api/student-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const replyText = data.reply || "Keep practicing! Accuracy builds natural speed over time.";

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChannelMessages((prev) => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), aiMsg],
      }));
    } catch (err) {
      console.error('Error sending student chat message:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'model',
        text: "I'm always here to help! Remember to keep your wrist rested and use all ten fingers on the home row (ASDF JKL;).",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChannelMessages((prev) => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), fallbackMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel]: INITIAL_CHANNEL_MESSAGES[activeChannel] || [],
    }));
    setActiveMenuMsgId(null);
    setEditingMsgId(null);
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel]: prev[activeChannel].filter((m) => m.id !== msgId),
    }));
    setActiveMenuMsgId(null);
  };

  // Start edit mode
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
    setActiveMenuMsgId(null);
  };

  // Save edited message
  const handleSaveEdit = (msgId: string) => {
    if (!editText.trim()) return;
    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel]: prev[activeChannel].map((m) =>
        m.id === msgId ? { ...m, text: editText.trim() } : m
      ),
    }));
    setEditingMsgId(null);
    setEditText('');
  };

  // Touch Long Press Handlers
  const handleTouchStart = (msg: ChatMessage) => {
    if (msg.role !== 'user') return;
    longPressTimerRef.current = setTimeout(() => {
      setActiveMenuMsgId(msg.id);
    }, 450);
  };

  const handleTouchEndOrMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Right Click Context Menu
  const handleContextMenu = (e: React.MouseEvent, msg: ChatMessage) => {
    if (msg.role !== 'user') return;
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuMsgId((prev) => (prev === msg.id ? null : msg.id));
  };

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${Math.min(Math.max(12, bubblePos.x - 390), Math.max(12, window.innerWidth - 450))}px`,
    top: `${Math.min(Math.max(12, bubblePos.y - 540), Math.max(12, window.innerHeight - 580))}px`,
    zIndex: 9999,
  };

  return (
    <>
      {/* Draggable Round Messenger Chat Head Bubble */}
      <div
        id="messenger-round-bubble"
        style={{
          position: 'fixed',
          left: `${bubblePos.x}px`,
          top: `${bubblePos.y}px`,
          zIndex: 99999,
          touchAction: 'none'
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleBubbleClick}
        className="group relative cursor-grab active:cursor-grabbing select-none"
      >
        <button
          type="button"
          id="floating-student-chat-btn"
          className={`w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-[0_10px_35px_rgba(37,99,235,0.55)] border-2 border-white/40 hover:scale-110 active:scale-95 transition-transform duration-200 flex items-center justify-center text-white ${
            isOpen ? 'ring-4 ring-blue-400/50 scale-105' : ''
          }`}
          title="AI Messenger (Drag anywhere on screen, click to toggle)"
        >
          <div className="relative flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white drop-shadow-md" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0b0e1b] rounded-full shadow-sm" />
          </div>
        </button>

        {/* Drag / Click Helper Tooltip */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-white bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none">
          Drag or Click
        </div>
      </div>

      {/* Messenger Chat Window Panel */}
      {isOpen && (
        <div
          id="student-chat-modal"
          style={modalStyle}
          className="w-[94vw] sm:w-[440px] max-w-[95vw] shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="bg-[#0b0e1b] border border-theme-accent/30 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col shadow-[0_15px_50px_rgba(0,0,0,0.85)]">
            
            {/* Header Bar - Draggable Messenger Style */}
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className="bg-gradient-to-r from-[#0d1326] via-[#101830] to-[#0d1326] border-b border-theme-muted/20 px-3.5 py-2.5 flex items-center justify-between select-none shadow-md cursor-grab active:cursor-grabbing"
              title="Drag header to move chat window"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                  <GripHorizontal className="w-4 h-4" />
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-theme-accent/50 flex items-center justify-center text-white shadow-lg">
                    <GraduationCap className="w-4.5 h-4.5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0d1326] rounded-full shadow-sm" title="Active Now" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white tracking-tight">AI Student Messenger</h3>
                    <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                      🟢 Active
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-mono">Drag header anywhere to move</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 hover:text-rose-400 hover:bg-slate-800/60 rounded-full transition-all cursor-pointer"
                  title="Clear Active Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:text-white hover:bg-slate-800/60 rounded-full transition-all cursor-pointer"
                  title={isMinimized ? "Expand Messenger" : "Minimize Messenger"}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:text-white hover:bg-slate-800/60 rounded-full transition-all cursor-pointer"
                  title="Close Messenger"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

        {/* Content Area */}
        {!isMinimized && (
          <>
            {/* Conversation Switcher Tabs */}
            <div className="px-3 pt-2.5 pb-1 bg-[#070914] border-b border-theme-muted/10 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {CHANNELS.map((ch) => {
                const isActive = activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannel(ch.id);
                      setActiveMenuMsgId(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-theme-accent text-black font-semibold shadow-sm'
                        : 'bg-theme-card/60 text-theme-muted hover:text-theme-correct hover:bg-theme-card border border-theme-muted/10'
                    }`}
                  >
                    {ch.icon}
                    <span>{ch.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter / Search Bar */}
            <div className="px-3 py-2 bg-[#090d1d] border-b border-theme-muted/15 flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-3.5 h-3.5 text-theme-muted absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter messages in this chat..."
                  className="w-full bg-[#05070e] border border-theme-muted/20 focus:border-theme-accent/60 rounded-xl pl-8 pr-7 py-1.5 text-xs text-theme-text placeholder-theme-muted/50 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 p-0.5 hover:text-theme-correct text-theme-muted rounded-full cursor-pointer"
                    title="Clear search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {searchQuery && (
                <span className="text-[10px] font-mono px-2 py-1 bg-theme-accent/15 text-theme-accent border border-theme-accent/25 rounded-lg shrink-0">
                  {filteredMessages.length} match{filteredMessages.length !== 1 ? 'es' : ''}
                </span>
              )}
            </div>

            {/* Chat Messages scroll area */}
            <div className="h-[310px] sm:h-[340px] overflow-y-auto p-4 space-y-4 text-xs font-sans">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-theme-muted space-y-2">
                  <Filter className="w-8 h-8 opacity-40 text-theme-accent" />
                  <p className="text-xs font-medium text-theme-text">No messages found</p>
                  <p className="text-[11px] max-w-[240px]">
                    No chat messages match "{searchQuery}". Try searching for another keyword or clear the filter.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-1 px-3 py-1 bg-theme-card hover:bg-theme-accent/20 border border-theme-muted/20 text-xs text-theme-accent rounded-lg cursor-pointer transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isMenuOpen = activeMenuMsgId === msg.id;
                  const isEditing = editingMsgId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 relative group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] ${
                          isUser
                            ? 'bg-theme-accent text-black font-bold'
                            : 'bg-theme-card border border-theme-muted/20 text-theme-accent'
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div className={`space-y-1 max-w-[82%] relative ${isUser ? 'items-end text-right' : 'items-start'}`}>
                        
                        {/* Editing Input State */}
                        {isEditing ? (
                          <div className="space-y-2 bg-theme-card p-2.5 rounded-2xl border border-theme-accent/40 text-left">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full bg-[#05070e] border border-theme-muted/20 rounded-xl p-2 text-xs text-theme-text focus:outline-none focus:border-theme-accent resize-none font-sans"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingMsgId(null)}
                                className="px-2.5 py-1 text-[11px] rounded-lg border border-theme-muted/20 text-theme-muted hover:text-theme-text cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-2.5 py-1 text-[11px] rounded-lg bg-theme-accent text-black font-semibold hover:opacity-90 cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal Messenger Bubble */
                          <div
                            onContextMenu={(e) => handleContextMenu(e, msg)}
                            onTouchStart={() => handleTouchStart(msg)}
                            onTouchEnd={handleTouchEndOrMove}
                            onTouchMove={handleTouchEndOrMove}
                            className={`px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap transition-all select-text cursor-default relative group shadow-sm text-xs ${
                              isUser
                                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white font-medium rounded-tr-xs shadow-blue-900/20 hover:brightness-110'
                                : 'bg-[#182238] text-slate-100 border border-slate-700/40 rounded-tl-xs shadow-black/40'
                            }`}
                          >
                            {msg.text}

                            {/* Trigger Icon Button for explicit menu access */}
                            {isUser && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuMsgId(isMenuOpen ? null : msg.id);
                                }}
                                className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-900 border border-slate-700 hover:border-blue-400 rounded-full text-slate-300 hover:text-white shadow-md cursor-pointer"
                                title="Message Options"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}

                        <div className={`flex items-center gap-1 text-[9px] font-mono px-1 ${isUser ? 'justify-end text-slate-400' : 'text-slate-500'}`}>
                          <span>{msg.timestamp}</span>
                          {isUser && <span className="text-blue-400 font-bold">✓ Delivered</span>}
                        </div>

                        {/* Floating Action Menu for Edit / Delete */}
                        {isMenuOpen && isUser && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-full right-0 mb-1 z-30 bg-[#090c17] border border-theme-accent/30 rounded-xl shadow-xl p-1 flex items-center gap-1 animate-in fade-in zoom-in-95 text-xs font-mono"
                          >
                            <button
                              onClick={() => handleStartEdit(msg)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-theme-accent/15 text-theme-text hover:text-theme-accent transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <div className="w-px h-4 bg-theme-muted/20" />
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}

              {/* Loading Typing Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-6 h-6 rounded-lg bg-theme-card border border-theme-muted/20 flex items-center justify-center text-theme-accent">
                    <Bot className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="bg-[#121629] border border-theme-muted/20 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-theme-muted text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-ping" />
                    <span>Student AI is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            <div className="px-3 py-2 border-t border-theme-muted/10 bg-[#070914] flex gap-1.5 overflow-x-auto no-scrollbar">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="shrink-0 px-2.5 py-1 bg-theme-card hover:bg-theme-accent/20 border border-theme-muted/15 hover:border-theme-accent/30 text-[11px] text-theme-muted hover:text-theme-accent rounded-full transition-all cursor-pointer truncate max-w-[220px]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar & Emoji Picker */}
            <div className="relative" ref={emojiPickerRef}>
              
              {/* Emoji Picker Popover */}
              {isEmojiPickerOpen && (
                <div className="absolute bottom-full left-2 mb-2 w-[320px] max-w-[90vw] bg-[#090d1d] border border-theme-accent/30 rounded-2xl shadow-2xl p-3 z-40 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-theme-muted/15">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                      {EMOJI_CATEGORIES.map((cat, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveEmojiCategoryIndex(idx)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            activeEmojiCategoryIndex === idx
                              ? 'bg-theme-accent text-black font-semibold'
                              : 'text-theme-muted hover:text-theme-text hover:bg-theme-card'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(false)}
                      className="p-1 text-theme-muted hover:text-theme-text rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 max-h-[140px] overflow-y-auto p-1">
                    {EMOJI_CATEGORIES[activeEmojiCategoryIndex]?.emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                        className="text-lg p-1.5 hover:bg-theme-accent/20 rounded-lg transition-transform hover:scale-125 cursor-pointer flex items-center justify-center select-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[#080c19] border-t border-slate-800/80 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                  className={`p-2 rounded-full transition-all cursor-pointer shrink-0 ${
                    isEmojiPickerOpen
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50'
                  }`}
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-900/90 border border-slate-700/60 focus:border-blue-500 rounded-full px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors shadow-inner font-sans"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-full transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
          </div>
        </div>
      )}
    </>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Code, 
  HelpCircle, 
  Sparkles, 
  ThumbsUp, 
  Copy, 
  Check, 
  BookOpen, 
  Flame, 
  ShieldCheck, 
  Hash, 
  ChevronRight, 
  Radio, 
  Search,
  ArrowRight,
  Pin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassLevel } from '../../types';
import { SEO } from '../SEO';

export interface StudyRoomMessage {
  id: string;
  roomId: string;
  authorName: string;
  authorClass: string;
  authorAvatar: string;
  text: string;
  codeSnippet?: string;
  isQuestion?: boolean;
  timestamp: string;
  likes: number;
}

export interface StudyRoomInfo {
  id: string;
  name: string;
  topic: string;
  classLevel: string;
  subject: string;
  description: string;
  zakirTip: string;
  activeUsersCount: number;
}

const DEFAULT_ROOMS: StudyRoomInfo[] = [
  {
    id: 'room-x-writer',
    name: 'Class X: Digital Documentation (Writer)',
    topic: 'Styles, Images & Table of Contents in LibreOffice',
    classLevel: 'X',
    subject: 'IT (Code 402)',
    description: 'Discuss paragraph styles, page breaks, mail merge, and auto-generated TOC for board practicals.',
    zakirTip: 'Tip: For Table of Contents, always remember that Headings 1, 2, and 3 define levels automatically.',
    activeUsersCount: 0
  },
  {
    id: 'room-x-calc',
    name: 'Class X: Electronic Spreadsheet (Calc)',
    topic: 'Consolidating Data, Scenarios, Goal Seek & Macros',
    classLevel: 'X',
    subject: 'IT (Code 402)',
    description: 'Ask doubts about Goal Seek steps, Subtotals, and referencing sheets with absolute paths.',
    zakirTip: 'Tip: Goal Seek only works on formulas having a single variable argument.',
    activeUsersCount: 0
  },
  {
    id: 'room-x-sql',
    name: 'Class X: RDBMS & SQL Commands',
    topic: 'DDL, DML, Primary Key vs Candidate Key',
    classLevel: 'X',
    subject: 'IT (Code 402)',
    description: 'Practice table creation, INSERT queries, and SELECT with WHERE clauses.',
    zakirTip: 'Tip: DDL changes the structure (CREATE, ALTER, DROP), while DML modifies the tuples (SELECT, INSERT, UPDATE, DELETE).',
    activeUsersCount: 0
  },
  {
    id: 'room-xii-pandas',
    name: 'Class XII: Python Pandas & DataFrames',
    topic: 'Series, DataFrame creation, loc vs iloc, GroupBy',
    classLevel: 'XII',
    subject: 'IP (Code 065)',
    description: 'Collaborate on Python code snippets, NumPy array slicing, and DataFrame head/tail methods.',
    zakirTip: 'Tip: df.loc[] uses index labels inclusive of stop index; df.iloc[] uses integer positions exclusive of stop index.',
    activeUsersCount: 0
  },
  {
    id: 'room-xii-sql',
    name: 'Class XII: MySQL & Aggregate Functions',
    topic: 'COUNT, SUM, AVG, GROUP BY, HAVING, and JOINS',
    classLevel: 'XII',
    subject: 'IP (Code 065)',
    description: 'Get help with complex queries, nested grouping, and Equi-Joins vs Natural Joins.',
    zakirTip: 'Tip: WHERE filters individual rows before grouping; HAVING filters aggregate rows after GROUP BY.',
    activeUsersCount: 0
  },
  {
    id: 'room-cyber-safety',
    name: 'Cyber Safety & Digital Society',
    topic: 'Phishing, Malware, IT Act 2000 & Intellectual Property',
    classLevel: 'IX–XII',
    subject: 'Cyber Ethics',
    description: 'Discussion on digital footprint, open source licensing (GPL, CC), and cyber laws.',
    zakirTip: 'Tip: E-waste disposal requires authorized recyclers under the E-Waste Management Rules.',
    activeUsersCount: 0
  }
];

const INITIAL_FALLBACK_MESSAGES: Record<string, StudyRoomMessage[]> = {};

interface StudyRoomViewProps {
  initialRoomId?: string | null;
  onOpenStudyMaterial?: () => void;
}

export const StudyRoomView: React.FC<StudyRoomViewProps> = ({ 
  initialRoomId, 
  onOpenStudyMaterial 
}) => {
  const { studentProfile } = useApp();

  const [rooms, setRooms] = useState<StudyRoomInfo[]>(DEFAULT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>(initialRoomId || DEFAULT_ROOMS[0].id);
  const [messages, setMessages] = useState<StudyRoomMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [activeClassFilter, setActiveClassFilter] = useState<'ALL' | 'X' | 'XII' | 'OTHER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to WebSocket Server
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/study-rooms-ws`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Join the active room
        ws.send(JSON.stringify({
          type: 'join_room',
          roomId: activeRoomId,
          userName: studentProfile.name
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init_messages' && data.roomId === activeRoomId) {
            setMessages(data.messages);
          } else if (data.type === 'new_message' && data.roomId === activeRoomId) {
            setMessages(prev => {
              if (prev.some(m => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          } else if (data.type === 'user_joined' && data.roomId === activeRoomId) {
            setActiveUsersCount(data.activeCount || 1);
          } else if (data.type === 'user_left' && data.roomId === activeRoomId) {
            setActiveUsersCount(data.activeCount || 0);
          } else if (data.type === 'message_liked' && data.roomId === activeRoomId) {
            setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, likes: data.likes } : m));
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    // Fallback load messages from REST or local seed
    fetch(`/api/study-rooms/${activeRoomId}/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        } else {
          setMessages(INITIAL_FALLBACK_MESSAGES[activeRoomId] || []);
        }
      })
      .catch(() => {
        setMessages(INITIAL_FALLBACK_MESSAGES[activeRoomId] || []);
      });

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [activeRoomId, studentProfile.name]);

  // Send message
  const handleSendMessage = () => {
    if (!inputText.trim() && !codeSnippet.trim()) return;

    const messageData = {
      authorName: studentProfile.name,
      authorClass: `Class ${studentProfile.classLevel}`,
      authorAvatar: studentProfile.avatarSeed,
      text: inputText.trim(),
      codeSnippet: showCodeInput && codeSnippet.trim() ? codeSnippet.trim() : undefined,
      isQuestion
    };

    // If WebSocket is connected, emit real-time event
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'send_message',
        roomId: activeRoomId,
        ...messageData
      }));
    } else {
      // HTTP fallback
      fetch(`/api/study-rooms/${activeRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })
        .then(res => res.json())
        .then(newMsg => {
          setMessages(prev => [...prev, newMsg]);
        })
        .catch(() => {
          const fallbackMsg: StudyRoomMessage = {
            id: `msg-${Date.now()}`,
            roomId: activeRoomId,
            ...messageData,
            timestamp: 'Just now',
            likes: 0
          };
          setMessages(prev => [...prev, fallbackMsg]);
        });
    }

    setInputText('');
    setCodeSnippet('');
    setShowCodeInput(false);
    setIsQuestion(false);
  };

  // Like message
  const handleLikeMessage = (messageId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'like_message',
        roomId: activeRoomId,
        messageId
      }));
    } else {
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, likes: m.likes + 1 } : m)
      );
    }
  };

  // Copy code snippet
  const handleCopyCode = (id: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Filtered rooms
  const filteredRooms = rooms.filter(r => {
    if (activeClassFilter === 'X' && r.classLevel !== 'X') return false;
    if (activeClassFilter === 'XII' && r.classLevel !== 'XII') return false;
    if (activeClassFilter === 'OTHER' && (r.classLevel === 'X' || r.classLevel === 'XII')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <SEO
        title="Collaborative Study Rooms"
        description="Join virtual real-time study rooms to collaborate on Python code, SQL queries, and CBSE exam preparation."
      />
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-blue-200 mb-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Real-Time Collaborative Study Rooms</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Virtual Study Rooms & Peer Discussions
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-2xl">
              Connect in real-time with classmates across India to discuss LibreOffice, Python Pandas, MySQL queries, and CBSE exam strategies.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-xs font-bold text-white">
                {isConnected ? 'WebSocket Live' : 'Connected (Auto-Sync)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Rooms Sidebar + Center Chat Area + Right Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ROOM LIST (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-blue-600" />
              <span>Active Study Rooms</span>
            </h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {filteredRooms.length} Available
            </span>
          </div>

          {/* Search Room */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search room or chapter..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveClassFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                activeClassFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveClassFilter('X')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                activeClassFilter === 'X'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Class X (IT 402)
            </button>
            <button
              onClick={() => setActiveClassFilter('XII')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                activeClassFilter === 'XII'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Class XII (IP 065)
            </button>
            <button
              onClick={() => setActiveClassFilter('OTHER')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                activeClassFilter === 'OTHER'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cyber Safety
            </button>
          </div>

          {/* Room Items */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredRooms.map(room => {
              const isCurrent = room.id === activeRoomId;

              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-100">
                      Class {room.classLevel} • {room.subject}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {room.activeUsersCount} studying
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1">
                    {room.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {room.topic}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHAT FEED & INPUT (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-[650px]">
          {/* Room Top Bar */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded">
                  Class {activeRoom.classLevel}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {activeRoom.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{activeRoom.topic}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Users className="w-3.5 h-3.5" />
                <span>{activeUsersCount} Active</span>
              </span>
            </div>
          </div>

          {/* Pinned Zakir Sir's Tip */}
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 py-2.5 flex items-center gap-2.5 text-xs text-amber-950">
            <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
            <span className="font-bold text-amber-900 shrink-0">Zakir Sir's Tip:</span>
            <span className="text-amber-800 line-clamp-1 font-medium">{activeRoom.zakirTip}</span>
          </div>

          {/* Chat Messages Scrollable Area */}
          <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">No messages yet. Be the first to start the discussion or ask a doubt!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isModerator = msg.authorName.includes('Zakir') || msg.authorClass === 'Teacher';
                const isMe = msg.authorName === studentProfile.name;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                      isModerator
                        ? 'bg-amber-500 text-white'
                        : isMe
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {msg.authorName.charAt(0)}
                    </div>

                    {/* Message Body */}
                    <div className={`max-w-xl space-y-1.5 ${isMe ? 'items-end text-right' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {msg.authorName}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          isModerator
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {msg.authorClass}
                        </span>
                        {msg.isQuestion && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                            ❓ Doubt
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Text content card */}
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                          : isModerator
                          ? 'bg-amber-50/80 border border-amber-200 text-slate-900 rounded-tl-xs shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                      }`}>
                        <p>{msg.text}</p>

                        {/* Optional Code Snippet */}
                        {msg.codeSnippet && (
                          <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-200 text-left">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-[10px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1">
                                <Code className="w-3 h-3 text-blue-400" />
                                Code Snippet
                              </span>
                              <button
                                onClick={() => handleCopyCode(msg.id, msg.codeSnippet!)}
                                className="hover:text-white transition-colors"
                                title="Copy code"
                              >
                                {copiedCodeId === msg.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <pre className="p-3 text-[11px] font-mono overflow-x-auto leading-relaxed text-emerald-300">
                              {msg.codeSnippet}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Reactions */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3 text-amber-500" />
                          <span>{msg.likes > 0 ? msg.likes : 'Helpful'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Section */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-2">
            {/* Code Snippet input dropdown */}
            {showCodeInput && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono flex items-center gap-1 text-blue-400 font-bold">
                    <Code className="w-3.5 h-3.5" /> Paste Python / SQL / HTML Code
                  </span>
                  <button
                    onClick={() => setShowCodeInput(false)}
                    className="text-slate-400 hover:text-white text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  value={codeSnippet}
                  onChange={e => setCodeSnippet(e.target.value)}
                  placeholder={`SELECT * FROM Students WHERE Marks > 90;\n-- Or Python code here`}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-mono text-[11px] text-emerald-300 focus:outline-hidden focus:border-blue-500"
                ></textarea>
              </div>
            )}

            {/* Input Toolbar */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestion(!isQuestion)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isQuestion
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Mark as Doubt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    showCodeInput
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Attach Code</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Press Enter to send
              </span>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask a question or share a tip in ${activeRoom.name}...`}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() && !codeSnippet.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

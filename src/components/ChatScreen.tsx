import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Mic, 
  Send, 
  Check, 
  CheckCheck, 
  User, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Eye, 
  Heart,
  X, 
  Trash2, 
  Edit3, 
  Copy, 
  Volume2, 
  VolumeX, 
  Ban, 
  Sparkles,
  Play,
  Pause,
  PhoneOff,
  MicOff,
  VideoOff,
  MapPin,
  Camera,
  Upload,
  Settings,
  LogOut,
  Shield,
  UserCheck,
  UserX,
  MessageSquare,
  RefreshCw,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { ensureFriendsAuthReady } from '../firebase';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  isEdited?: boolean;
  status: 'sent' | 'delivered' | 'read';
  deletedForEveryone?: boolean;
}

export interface GroupPermissions {
  sendMessages: 'all' | 'admins';
  addMembers: 'all' | 'admins';
  editGroupInfo: 'all' | 'admins';
  changeGroupIcon: 'all' | 'admins';
}

export interface GroupMember {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isAdmin: boolean;
  status: 'active' | 'left';
  leftTime?: string;
}

export interface ChatFriend {
  id: string;
  isGroup?: boolean;
  name: string;
  username: string;
  avatarUrl: string;
  isOnline?: boolean;
  location?: string;
  hasFeeling?: boolean;
  feelingText?: string;
  feelingMedia?: string;
  feelingViews?: number;
  feelingTime?: string;
  isFriend?: boolean;
  hasContent?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  email?: string;
  // Group specific properties
  groupDescription?: string;
  groupPermissions?: GroupPermissions;
  groupMembers?: GroupMember[];
  createdBy?: string;
}

const INITIAL_CHATS: ChatFriend[] = [
  {
    id: 'grp_kaduna',
    isGroup: true,
    name: 'Kaduna Digital Creators Hub',
    username: 'kaduna_creators',
    avatarUrl: '',
    isOnline: true,
    location: 'Kaduna, Nigeria',
    hasFeeling: false,
    isFriend: false,
    hasContent: true,
    lastMessage: 'Welcome to Kaduna Digital Creators Hub.',
    lastMessageTime: '10:15 am',
    unreadCount: 0,
    groupDescription: 'Official community hub for verified digital creators, developers and merchants.',
    createdBy: 'me',
    groupPermissions: {
      sendMessages: 'all',
      addMembers: 'all',
      editGroupInfo: 'admins',
      changeGroupIcon: 'admins',
    },
    groupMembers: [
      {
        id: 'me',
        name: 'Isiyaku Haruna',
        username: 'isiyaku_online',
        avatarUrl: '',
        isAdmin: true,
        status: 'active',
      },
    ],
  },
];

interface ChatScreenProps {
  currentUser: UserProfile;
  onViewUserProfile?: (friend: ChatFriend) => void;
  onInsideChatChange?: (inChat: boolean) => void;
  onStatusViewChange?: (isFullScreen: boolean) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ 
  currentUser, 
  onViewUserProfile,
  onInsideChatChange,
  onStatusViewChange
}) => {
  // Chat list with localStorage persistence
  const [chats, setChats] = useState<ChatFriend[]>(INITIAL_CHATS);

  // Load on user switch
  useEffect(() => {
    if (!currentUser.email) return;
    try {
      const saved = localStorage.getItem(`ipay_chats_${currentUser.email.toLowerCase()}`);
      if (saved) setChats(JSON.parse(saved));
      else setChats(INITIAL_CHATS);
    } catch {
      setChats(INITIAL_CHATS);
    }
  }, [currentUser.email]);

  // Save to localStorage whenever chats change
  useEffect(() => {
    if (!currentUser.email) return;
    localStorage.setItem(`ipay_chats_${currentUser.email.toLowerCase()}`, JSON.stringify(chats));
  }, [chats, currentUser.email]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<ChatFriend | null>(null);

  // Chat Filter Tabs (Recent | Friends | Unread | Groups)
  const [activeFilter, setActiveFilter] = useState<'recent' | 'friends' | 'unread' | 'groups'>('recent');

  // My statuses list state (matching screenshot 1791213859261.jpg)
  const [myStatuses, setMyStatuses] = useState<Array<{
    id: string;
    text: string;
    mediaUrl?: string;
    mediaType?: 'text' | 'image' | 'video';
    bgColor?: string;
    time: string;
    viewsCount: number;
    likesCount: number;
    viewers: Array<{ name: string; time: string; avatar: string }>;
    likes: Array<{ name: string; time: string; avatar: string }>;
  }>>([
    {
      id: 'stat_1',
      text: 'Exploring new UI component patterns in React & Vite!',
      mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      bgColor: '#2e7d32',
      time: '25 minutes ago',
      viewsCount: 0,
      likesCount: 0,
      viewers: [],
      likes: [],
    },
    {
      id: 'stat_2',
      text: 'Building seamless creator tools for Northern Nigeria and beyond. 🚀✨',
      mediaType: 'text',
      bgColor: '#7c3aed',
      time: '55 minutes ago',
      viewsCount: 0,
      likesCount: 0,
      viewers: [],
      likes: [],
    },
  ]);

  const [isCreatingTextStatus, setIsCreatingTextStatus] = useState(false);
  const [newTextStatusContent, setNewTextStatusContent] = useState('');
  const [selectedTextBgColor, setSelectedTextBgColor] = useState('#2e7d32');
  const [isCreatingMediaStatus, setIsCreatingMediaStatus] = useState(false);
  const [newMediaStatusUrl, setNewMediaStatusUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');

  // Input refs for Device File Picker and Camera Capture
  const deviceFileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video');
      setNewMediaType(isVideo ? 'video' : 'image');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewMediaStatusUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Full screen viewing & editing state for My Statuses matching screenshot 1791214382212.jpg
  const [fullscreenMyStatusId, setFullscreenMyStatusId] = useState<string | null>(null);
  const [showViewersAndLikesSheet, setShowViewersAndLikesSheet] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editingStatusText, setEditingStatusText] = useState('');
  const [editingStatusBgColor, setEditingStatusBgColor] = useState('#2e7d32');
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);
  const [viewersSheetTab, setViewersSheetTab] = useState<'viewers' | 'likes'>('viewers');
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  // Friend status comments state
  const [friendStatusComments, setFriendStatusComments] = useState<Record<string, Array<{
    id: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    time: string;
  }>>>({
    usr_1: [
      { id: 'c1', authorName: 'Musa Ibrahim', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', text: 'Great update! Looking forward to the release 🔥', time: '12m ago' },
      { id: 'c2', authorName: 'Zainab Umar', authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', text: 'Congrats Amina! 🎉', time: '8m ago' },
    ],
    usr_2: [
      { id: 'c3', authorName: 'Amina Bello', authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', text: 'Love this photo!', time: '1h ago' },
    ],
  });

  const [isStatusCommentsSheetOpen, setIsStatusCommentsSheetOpen] = useState(false);
  const [statusCommentInputText, setStatusCommentInputText] = useState('');

  const STATUS_COLORS = [
    '#2e7d32', // Emerald
    '#1e293b', // Dark Slate
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#0284c7', // Sky Blue
    '#d97706', // Amber
    '#9333ea', // Violet
    '#059669', // Teal
    '#dc2626', // Red
    '#4f46e5', // Indigo
  ];

  // Friend likes tracking
  const [friendStatusLikes, setFriendStatusLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({
    usr_1: { count: 12, isLiked: false },
    usr_2: { count: 8, isLiked: true },
    usr_3: { count: 5, isLiked: false },
    usr_4: { count: 19, isLiked: false },
    usr_5: { count: 14, isLiked: false },
  });

  // Modals & Sheets
  const [isAddFriendsModalOpen, setIsAddFriendsModalOpen] = useState(false);
  const [databaseUsers, setDatabaseUsers] = useState<Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    phoneNumber?: string;
    location?: string;
    avatarUrl?: string;
    followers?: string;
    source: string;
  }>>([]);
  const [isLoadingDbUsers, setIsLoadingDbUsers] = useState(false);
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');

  // Hard force fetch all authentic users from database
  const loadDatabaseUsers = async () => {
    setIsLoadingDbUsers(true);
    try {
      const users = await firebaseAuthService.getAllDatabaseUsers();
      // Filter out me from add friends list
      setDatabaseUsers(users.filter(u => u.email.toLowerCase() !== currentUser.email.toLowerCase()));
    } catch (e) {
      console.warn('Error loading database users:', e);
    } finally {
      setIsLoadingDbUsers(false);
    }
  };

  // Friendship tracking state
  const [friendshipStatuses, setFriendshipStatuses] = useState<Record<string, 'none' | 'pending' | 'approved' | 'received'>>({});
  const [hasInitialSynced, setHasInitialSynced] = useState(false);

  // Absolute state reset on account switch
  useEffect(() => {
    setFriendshipStatuses({});
    setChats(INITIAL_CHATS);
    setHasInitialSynced(false);
  }, [currentUser.email]);

  const [isSyncing, setIsSyncing] = useState(false);
  const syncFriendshipsToChats = async () => {
    if (!currentUser.email || isSyncing) return;
    setIsSyncing(true);
    console.log('[FRIEND SYNC] Starting friendship sync for:', currentUser.email);
    
    try {
      const [friendships, allUsers] = await Promise.all([
        firebaseAuthService.getAllMyFriendships(currentUser.email),
        firebaseAuthService.getAllDatabaseUsers()
      ]);
      
      const statuses: Record<string, 'none' | 'pending' | 'approved' | 'received'> = {};
      const newChatEntries: ChatFriend[] = [];
      
      friendships.forEach((f: any) => {
        const isFromMe = f.from === currentUser.email;
        const otherEmail = (isFromMe ? f.to : f.from).toLowerCase();
        const status = f.status === 'approved' ? 'approved' : (isFromMe ? 'pending' : 'received');
        
        statuses[otherEmail] = status;
        
        const userData = allUsers.find(u => u.email.toLowerCase() === otherEmail);
        if (userData) {
          newChatEntries.push({
            id: userData.id,
            name: userData.name,
            username: userData.username,
            avatarUrl: userData.avatarUrl || '',
            email: userData.email,
            isFriend: f.status === 'approved',
            lastMessage: f.status === 'approved' ? 'You are now friends!' : (isFromMe ? 'Pending Approval' : 'Sent you a friend request'),
            lastMessageTime: 'Just now',
            isOnline: true,
            location: userData.location || 'Nigeria',
          });
        } else {
          // Placeholder if user data not found yet (still persistent!)
          newChatEntries.push({
            id: `usr_${otherEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: otherEmail.split('@')[0],
            username: otherEmail.split('@')[0],
            avatarUrl: '',
            email: otherEmail,
            isFriend: f.status === 'approved',
            lastMessage: f.status === 'approved' ? 'You are now friends!' : (isFromMe ? 'Pending Approval' : 'Sent you a friend request'),
            lastMessageTime: 'Just now',
            isOnline: false,
          });
        }
      });
      
      setFriendshipStatuses(statuses);
      
      // Merge with existing chats (avoid duplicates)
      setChats(prev => {
        const merged = [...prev];
        newChatEntries.forEach(newChat => {
          const idx = merged.findIndex(c => c.email?.toLowerCase() === newChat.email?.toLowerCase());
          if (idx === -1) {
            merged.push(newChat);
          } else {
            // Update existing entry with friendship status if needed
            merged[idx] = { 
              ...merged[idx], 
              ...newChat,
              // Preserving existing state like messages if they were already there
              isFriend: newChat.isFriend,
              lastMessage: newChat.lastMessage || merged[idx].lastMessage,
            };
          }
        });
        return merged;
      });
      
    } catch (err) {
      console.warn('Sync friendships error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const checkFriendships = async () => {
    await syncFriendshipsToChats();
  };

  useEffect(() => {
    if (databaseUsers.length > 0) {
      checkFriendships();
    }
  }, [databaseUsers]);

  const handleSendFriendRequest = async (toEmail: string) => {
    // 1. Prevent duplicate requests
    if (friendshipStatuses[toEmail.toLowerCase()] === 'pending' || friendshipStatuses[toEmail.toLowerCase()] === 'approved') {
      alert('Request already sent or user is already a friend.');
      return;
    }

    // 2. Instant UI update (Optimistic)
    setFriendshipStatuses(prev => ({ ...prev, [toEmail.toLowerCase()]: 'pending' }));
    
    const userData = databaseUsers.find(u => u.email.toLowerCase() === toEmail.toLowerCase());
    if (userData) {
      setChats(prev => {
        const idx = prev.findIndex(c => c.email?.toLowerCase() === toEmail.toLowerCase());
        if (idx !== -1) return prev;
        return [{
          id: userData.id,
          name: userData.name,
          username: userData.username,
          avatarUrl: userData.avatarUrl || '',
          email: userData.email,
          isFriend: false,
          lastMessage: 'Pending Approval',
          lastMessageTime: 'Just now',
          isOnline: true,
          location: userData.location || 'Nigeria',
        }, ...prev];
      });
    }

    // 2. Background database write
    try {
      const success = await firebaseAuthService.sendFriendRequest(currentUser.email, toEmail);
      if (success) {
        await syncFriendshipsToChats();
      } else {
        // Revert on failure
        setFriendshipStatuses(prev => {
          const next = { ...prev };
          delete next[toEmail.toLowerCase()];
          return next;
        });
        alert('Failed to send request. Please try again.');
      }
    } catch (err) {
      console.warn('Send friend request error:', err);
    }
  };

  const handleApproveFriend = async (fromEmail: string) => {
    // 1. Instant UI update
    setFriendshipStatuses(prev => ({ ...prev, [fromEmail.toLowerCase()]: 'approved' }));
    setChats(prev => prev.map(c => 
      c.email?.toLowerCase() === fromEmail.toLowerCase() 
        ? { ...c, isFriend: true, lastMessage: 'You are now friends!' } 
        : c
    ));

    // 2. Background database write
    try {
      const success = await firebaseAuthService.approveFriendRequest(fromEmail, currentUser.email);
      if (success) {
        await syncFriendshipsToChats();
      } else {
        alert('Failed to approve request.');
        await syncFriendshipsToChats(); // Sync back to correct state
      }
    } catch (err) {
      console.warn('Approve friend request error:', err);
    }
  };

  // Real-time subscription to friendships
  useEffect(() => {
    if (!currentUser.email || hasInitialSynced) return;
    
    const setupFriendships = async () => {
      await ensureFriendsAuthReady();
      console.log('[FRIEND SYNC] Subscribing to real-time updates for:', currentUser.email);
      setHasInitialSynced(true);
      const unsubscribe = firebaseAuthService.subscribeToFriendships(currentUser.email, async (friendships) => {
        console.log('[FRIEND SYNC] Received update:', friendships.length, 'entries');
        const allUsers = await firebaseAuthService.getAllDatabaseUsers();
        
        const statuses: Record<string, 'none' | 'pending' | 'approved' | 'received'> = {};
        const newChatEntries: ChatFriend[] = [];
        
        friendships.forEach((f: any) => {
          const isFromMe = f.from === currentUser.email;
          const otherEmail = (isFromMe ? f.to : f.from).toLowerCase();
          const status = f.status === 'approved' ? 'approved' : (isFromMe ? 'pending' : 'received');
          
          statuses[otherEmail] = status;
          
          const userData = allUsers.find(u => u.email.toLowerCase() === otherEmail);
          if (userData) {
            newChatEntries.push({
              id: userData.id,
              name: userData.name,
              username: userData.username,
              avatarUrl: userData.avatarUrl || '',
              email: userData.email,
              isFriend: f.status === 'approved',
              lastMessage: f.status === 'approved' ? 'You are now friends!' : (isFromMe ? 'Pending Approval' : 'Sent you a friend request'),
              lastMessageTime: 'Just now',
              isOnline: true,
              location: userData.location || 'Nigeria',
            });
          } else {
            newChatEntries.push({
              id: `usr_${otherEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              name: otherEmail.split('@')[0],
              username: otherEmail.split('@')[0],
              avatarUrl: '',
              email: otherEmail,
              isFriend: f.status === 'approved',
              lastMessage: f.status === 'approved' ? 'You are now friends!' : (isFromMe ? 'Pending Approval' : 'Sent you a friend request'),
              lastMessageTime: 'Just now',
              isOnline: false,
            });
          }
        });
        
        setFriendshipStatuses(statuses);
        
        setChats(prev => {
          const merged = [...prev];
          newChatEntries.forEach(newChat => {
            const idx = merged.findIndex(c => c.email?.toLowerCase() === newChat.email?.toLowerCase());
            if (idx === -1) {
              merged.push(newChat);
            } else {
              merged[idx] = { 
                ...merged[idx], 
                ...newChat,
                isFriend: newChat.isFriend,
                lastMessage: newChat.lastMessage || merged[idx].lastMessage,
              };
            }
          });
          return merged;
        });
      });
      return unsubscribe;
    };

    let unsub: any;
    setupFriendships().then(u => unsub = u);
    
    return () => {
      if (unsub) unsub();
    };
  }, [currentUser.email, hasInitialSynced]);

  useEffect(() => {
    loadDatabaseUsers();
  }, [currentUser.email]);

  useEffect(() => {
    if (isAddFriendsModalOpen) {
      loadDatabaseUsers();
      syncFriendshipsToChats();
    }
  }, [isAddFriendsModalOpen]);

  // Deep Sync when searching by email to reveal manual Auth users
  useEffect(() => {
    const syncSearch = async () => {
      const q = friendsSearchQuery.trim().toLowerCase();
      if (q.includes('@') && q.length > 5) {
        const check = await firebaseAuthService.checkAccountExists(q);
        if (check.exists) {
          // If a new user was synced, reload the list to reveal them
          loadDatabaseUsers();
        }
      }
    };
    
    const timer = setTimeout(syncSearch, 1000);
    return () => clearTimeout(timer);
  }, [friendsSearchQuery]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [isAddMemberToGroupModalOpen, setIsAddMemberToGroupModalOpen] = useState(false);
  const [isGroupPermissionsModalOpen, setIsGroupPermissionsModalOpen] = useState(false);
  
  // Feelings Viewer State (with Index tracking for Swiping & Segmented Progress)
  const [activeFeelingIndex, setActiveFeelingIndex] = useState<number | null>(null); // -1 = My Feeling, 0..N = Friend
  const [activeFeelingViewerTab, setActiveFeelingViewerTab] = useState<'viewers' | 'likes'>('viewers');

  // Notify parent of status viewer open state to hide bottom buttons
  useEffect(() => {
    onStatusViewChange?.(activeFeelingIndex !== null);
  }, [activeFeelingIndex, onStatusViewChange]);
  
  // Post feeling modal
  const [isPostFeelingModalOpen, setIsPostFeelingModalOpen] = useState(false);
  const [newFeelingText, setNewFeelingText] = useState('');
  const [newFeelingMediaUrl, setNewFeelingMediaUrl] = useState('');
  const [newFeelingMediaType, setNewFeelingMediaType] = useState<'text' | 'image' | 'video'>('text');
  const feelingFileInputRef = useRef<HTMLInputElement | null>(null);

  // Call modal states
  const [activeCallType, setActiveCallType] = useState<'voice' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Group creation state with detailed permissions
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupAvatarUrl, setGroupAvatarUrl] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [groupPermSendMessages, setGroupPermSendMessages] = useState<'all' | 'admins'>('all');
  const [groupPermAddMembers, setGroupPermAddMembers] = useState<'all' | 'admins'>('all');
  const [groupPermEditInfo, setGroupPermEditInfo] = useState<'all' | 'admins'>('admins');
  const [groupPermChangeIcon, setGroupPermChangeIcon] = useState<'all' | 'admins'>('admins');

  // Group avatar file ref
  const groupAvatarInputRef = useRef<HTMLInputElement | null>(null);

  // Conversation messages state per chat
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    usr_1: [
      { id: 'm1', senderId: 'usr_1', senderName: 'Amina Bello', text: 'Hello! Welcome to I-pay chat. Everything is end-to-end encrypted.', timestamp: '9:30 am', isMe: false, status: 'read' },
      { id: 'm2', senderId: 'me', senderName: currentUser.fullName, text: 'Hi Amina! Glad to connect on here.', timestamp: '9:32 am', isMe: true, status: 'read' },
      { id: 'm3', senderId: 'usr_1', senderName: 'Amina Bello', text: 'Did you check out the new creator marketplace presets pack?', timestamp: '9:34 am', isMe: false, status: 'read' },
    ],
    grp_kaduna: [
      { id: 'gm1', senderId: 'usr_2', senderName: 'Musa Ibrahim', text: 'Welcome everyone to the Kaduna Digital Creators Hub!', timestamp: '10:00 am', isMe: false, status: 'read' },
      { id: 'gm2', senderId: 'usr_1', senderName: 'Amina Bello', text: 'Great to have this community space on I-pay.', timestamp: '10:05 am', isMe: false, status: 'read' },
      { id: 'gm3', senderId: 'usr_2', senderName: 'Musa Ibrahim', text: 'Let us schedule the weekend meetup at 4 PM.', timestamp: '10:15 am', isMe: false, status: 'read' },
    ],
    usr_2: [
      { id: 'm4', senderId: 'usr_2', senderName: 'Musa Ibrahim', text: 'Hey, let us connect on WhatsApp or Discord today.', timestamp: 'Yesterday', isMe: false, status: 'read' },
    ],
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Three dots menu & context menu
  const [isThreeDotsMenuOpen, setIsThreeDotsMenuOpen] = useState(false);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<ChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageInput, setEditMessageInput] = useState('');
  
  // Long press for user profile preview
  const [longPressedUser, setLongPressedUser] = useState<ChatFriend | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // Call timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCallType) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCallType]);

  const handleStartLongPress = (friend: ChatFriend) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedUser(friend);
    }, 800);
  };

  const handleEndLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleSelectChat = (friend: ChatFriend) => {
    setActiveChat(friend);
    onInsideChatChange?.(true);
  };

  const handleBackToRecent = () => {
    setActiveChat(null);
    onInsideChatChange?.(false);
    setIsThreeDotsMenuOpen(false);
    setIsGroupInfoModalOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || (!inputMessage.trim() && !isVoiceRecording)) return;

    if (editingMessageId) {
      setMessages((prev) => {
        const chatMsgs = prev[activeChat.id] || [];
        return {
          ...prev,
          [activeChat.id]: chatMsgs.map((m) =>
            m.id === editingMessageId ? { ...m, text: editMessageInput.trim(), isEdited: true } : m
          ),
        };
      });
      setEditingMessageId(null);
      setEditMessageInput('');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      senderName: currentUser.fullName,
      text: inputMessage.trim(),
      timestamp: 'Just now',
      isMe: true,
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }));

    setInputMessage('');
  };

  const handleSendVoiceNote = () => {
    if (!activeChat) return;
    const voiceMsg: ChatMessage = {
      id: `v_${Date.now()}`,
      senderId: 'me',
      senderName: currentUser.fullName,
      text: 'Voice note (0:14)',
      timestamp: 'Just now',
      isMe: true,
      isVoiceNote: true,
      voiceDuration: '0:14',
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), voiceMsg],
    }));
    setIsVoiceRecording(false);
  };

  const handleDeleteMessage = (msgId: string, forEveryone: boolean) => {
    if (!activeChat) return;
    setMessages((prev) => {
      const chatMsgs = prev[activeChat.id] || [];
      if (forEveryone) {
        return {
          ...prev,
          [activeChat.id]: chatMsgs.map((m) =>
            m.id === msgId ? { ...m, deletedForEveryone: true, text: 'This message was deleted' } : m
          ),
        };
      } else {
        return {
          ...prev,
          [activeChat.id]: chatMsgs.filter((m) => m.id !== msgId),
        };
      }
    });
    setSelectedMessageForAction(null);
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const initialMembers: GroupMember[] = [
      {
        id: 'me',
        name: currentUser.fullName || 'Isiyaku Haruna',
        username: currentUser.username || 'user',
        avatarUrl: currentUser.avatarUrl || '',
        isAdmin: true,
        status: 'active',
      },
      ...selectedGroupMembers.map((id) => {
        const friend = chats.find((c) => c.id === id);
        return {
          id: id,
          name: friend?.name || 'Member',
          username: friend?.username || 'member',
          avatarUrl: friend?.avatarUrl || '',
          isAdmin: false,
          status: 'active' as const,
        };
      }),
    ];

    const newGroup: ChatFriend = {
      id: `grp_${Date.now()}`,
      isGroup: true,
      name: groupName.trim(),
      username: `grp_${Date.now().toString().slice(-4)}`,
      avatarUrl: groupAvatarUrl, // can be empty string
      isOnline: true,
      location: 'Group Chat',
      hasFeeling: false,
      isFriend: false,
      hasContent: true,
      lastMessage: `Group created: ${groupDescription || 'Welcome to the group!'}`,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      groupDescription: groupDescription.trim(),
      createdBy: 'me',
      groupPermissions: {
        sendMessages: groupPermSendMessages,
        addMembers: groupPermAddMembers,
        editGroupInfo: groupPermEditInfo,
        changeGroupIcon: groupPermChangeIcon,
      },
      groupMembers: initialMembers,
    };

    setChats((prev) => [newGroup, ...prev]);
    setIsCreateGroupModalOpen(false);
    setGroupName('');
    setGroupDescription('');
    setGroupAvatarUrl('');
    setSelectedGroupMembers([]);
    handleSelectChat(newGroup);
  };

  const handleLeaveGroup = () => {
    if (!activeChat || !activeChat.isGroup) return;
    if (confirm(`Are you sure you want to leave "${activeChat.name}"?`)) {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeChat.id) {
            const updatedMembers: GroupMember[] = (c.groupMembers || []).map((m) =>
              m.id === 'me'
                ? { ...m, status: 'left' as const, leftTime: 'You left just now' }
                : m
            );
            return { ...c, groupMembers: updatedMembers };
          }
          return c;
        })
      );
      handleBackToRecent();
      alert(`You left ${activeChat.name}.`);
    }
  };

  const handlePostFeelingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeelingText.trim()) return;
    const newStat = {
      id: `stat_${Date.now()}`,
      text: newFeelingText.trim(),
      mediaUrl: '',
      mediaType: 'text' as const,
      bgColor: '#2e7d32',
      time: 'Just now',
      viewsCount: 0,
      likesCount: 0,
      viewers: [],
      likes: [],
    };
    setMyStatuses((prev) => [newStat, ...prev]);
    setIsPostFeelingModalOpen(false);
    setNewFeelingText('');
  };

  // Filter chats by tab (Recent, Friends, Unread, Groups) and search query
  const filteredChats = chats.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'recent') return true;
    if (activeFilter === 'friends') return !item.isGroup && item.isFriend;
    if (activeFilter === 'unread') return (item.unreadCount || 0) > 0;
    if (activeFilter === 'groups') return item.isGroup;

    return true;
  });

  // ----------------------------------------------------------------------
  // VIEW 1: ACTIVE CHAT CONVERSATION ROOM
  // ----------------------------------------------------------------------
  if (activeChat) {
    const currentMessages = messages[activeChat.id] || [];
    const isGroup = activeChat.isGroup;
    const currentUserIsAdmin = isGroup && (activeChat.createdBy === 'me' || activeChat.groupMembers?.some(m => m.id === 'me' && m.isAdmin));
    const activeMembers = activeChat.groupMembers?.filter(m => m.status === 'active') || [];
    const leftMembers = activeChat.groupMembers?.filter(m => m.status === 'left') || [];

    return (
      <div className="flex-1 flex flex-col bg-[#e7f3e4] text-slate-900 min-h-screen relative">
        
        {/* Chat Room Top Bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <button
              type="button"
              onClick={handleBackToRecent}
              className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Back to recent chats"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            
            {/* Avatar - Clicking opens Group Info (if group) or User Profile */}
            <div 
              onClick={() => {
                if (isGroup) {
                  setIsGroupInfoModalOpen(true);
                } else {
                  onViewUserProfile?.(activeChat);
                }
              }}
              className="relative cursor-pointer shrink-0"
            >
              {activeChat.avatarUrl ? (
                <img
                  src={activeChat.avatarUrl}
                  alt={activeChat.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-slate-200 shadow-xs ${
                  isGroup ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isGroup ? <Users className="w-5 h-5" /> : activeChat.name.charAt(0)}
                </div>
              )}
              {activeChat.isOnline && !isGroup && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Name and status - Clicking opens Group Info / Profile */}
            <div 
              onClick={() => {
                if (isGroup) {
                  setIsGroupInfoModalOpen(true);
                } else {
                  onViewUserProfile?.(activeChat);
                }
              }}
              className="cursor-pointer min-w-0 flex-1"
            >
              <h2 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {activeChat.name}
              </h2>
              <div className="text-[11px] text-emerald-700 font-semibold truncate">
                {isGroup ? (
                  <span>Group members • tap for group info</span>
                ) : activeChat.isOnline ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    online
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">offline</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons: Audio Call, Video Call, Three Dots */}
          <div className="flex items-center gap-1 text-slate-700 shrink-0">
            {!isGroup && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveCallType('voice')}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700 hover:text-[#2e7d32]"
                  title="Voice Call"
                >
                  <Phone className="w-5 h-5 stroke-[1.85]" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCallType('video')}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700 hover:text-[#2e7d32]"
                  title="Video Call"
                >
                  <Video className="w-5 h-5 stroke-[1.85]" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsThreeDotsMenuOpen(!isThreeDotsMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
              title="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Three Dots Menu - Customized for Groups vs 1-on-1 */}
        {isThreeDotsMenuOpen && (
          <div className="absolute top-14 right-4 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 w-48 text-xs font-semibold animate-in fade-in">
            {isGroup ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    alert('Notifications muted for this group.');
                    setIsThreeDotsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                >
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span>Mute Notifications</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear all messages in this group?')) {
                      setMessages((prev) => ({ ...prev, [activeChat.id]: [] }));
                    }
                    setIsThreeDotsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-slate-500" />
                  <span>Wipe / Clear Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsThreeDotsMenuOpen(false);
                    handleLeaveGroup();
                  }}
                  className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Group</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onViewUserProfile?.(activeChat);
                    setIsThreeDotsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>View Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Notifications muted for this chat.');
                    setIsThreeDotsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                >
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span>Mute Notifications</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear all messages in this conversation?')) {
                      setMessages((prev) => ({ ...prev, [activeChat.id]: [] }));
                    }
                    setIsThreeDotsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Wipe / Clear Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`User ${activeChat.name} has been blocked.`);
                    setIsThreeDotsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <Ban className="w-4 h-4" />
                  <span>Block User</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 p-4 pb-24 overflow-y-auto space-y-3">
          
          {/* Friend Request Approval Banner (Request #10) */}
          {!isGroup && activeChat.email && friendshipStatuses[activeChat.email] === 'received' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5 mb-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shadow-inner">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">New Friend Request</h3>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {activeChat.name} sent you a friend request. Approve to start chatting!
                  </p>
                </div>
                <div className="flex gap-2 w-full pt-2">
                  <button
                    onClick={() => handleApproveFriend(activeChat.email || '')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-transform active:scale-95"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => alert('Ignore functionality - request stays until approved/denied')}
                    className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-600 font-bold text-xs rounded-2xl hover:bg-slate-50 transition-transform active:scale-95"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Approval Notice for Sender */}
          {!isGroup && activeChat.email && friendshipStatuses[activeChat.email] === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <RefreshCw className="w-6 h-6 text-amber-600 animate-spin" />
                <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Unapproved Friend</div>
                <p className="text-[10px] text-slate-600 max-w-[200px]">
                  Your request is waiting for {activeChat.name} to approve. You will be notified once they accept!
                </p>
              </div>
            </div>
          )}

          {currentMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No messages yet. Send a friendly greeting or voice note to start!
            </div>
          ) : (
            currentMessages.map((msg) => (
              <div
                key={msg.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedMessageForAction(msg);
                }}
                onClick={() => setSelectedMessageForAction(msg)}
                className={`flex flex-col cursor-pointer transition-all ${
                  msg.isMe ? 'items-end' : 'items-start'
                }`}
              >
                {/* Sender Name in Group Chat */}
                {isGroup && !msg.isMe && (
                  <span className="text-[10px] font-bold text-emerald-800 ml-3 mb-0.5">
                    {msg.senderName}
                  </span>
                )}

                <div
                  className={`p-3.5 rounded-3xl max-w-[82%] text-xs sm:text-sm shadow-xs transition-transform active:scale-[0.98] ${
                    msg.isMe
                      ? 'bg-slate-700 text-white rounded-tr-xs'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                  } ${msg.deletedForEveryone ? 'italic opacity-60' : ''}`}
                >
                  {/* Voice Note Player */}
                  {msg.isVoiceNote ? (
                    <div className="flex items-center gap-3 py-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlayingVoice(isPlayingVoice === msg.id ? null : msg.id);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          msg.isMe ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
                        }`}
                      >
                        {isPlayingVoice === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="flex flex-col">
                        <div className="font-mono text-xs tracking-wider">
                          {isPlayingVoice === msg.id ? 'ılılılllıılılı' : 'ıılılılılılıı'}
                        </div>
                        <span className="text-[10px] opacity-75">{msg.voiceDuration || '0:14'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="leading-relaxed">{msg.text}</div>
                  )}

                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      msg.isMe ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {msg.isEdited && <span className="italic">edited • </span>}
                    <span>{msg.timestamp}</span>
                    {msg.isMe && (
                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Actions Modal */}
        {selectedMessageForAction && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in"
            onClick={() => setSelectedMessageForAction(null)}
          >
            <div 
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Message Options</h3>
                <button onClick={() => setSelectedMessageForAction(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-100 line-clamp-2">
                "{selectedMessageForAction.text}"
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                {/* Edit Message (Sender only) */}
                {selectedMessageForAction.isMe && !selectedMessageForAction.deletedForEveryone && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMessageId(selectedMessageForAction.id);
                      setEditMessageInput(selectedMessageForAction.text);
                      setInputMessage(selectedMessageForAction.text);
                      setSelectedMessageForAction(null);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-800 flex items-center gap-2.5"
                  >
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span>Edit Message</span>
                  </button>
                )}

                {/* Delete for Everyone (Sender only) */}
                {selectedMessageForAction.isMe && !selectedMessageForAction.deletedForEveryone && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(selectedMessageForAction.id, true)}
                    className="w-full py-2.5 px-3 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete for Everyone</span>
                  </button>
                )}

                {/* Delete for Me */}
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(selectedMessageForAction.id, false)}
                  className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-800 flex items-center gap-2.5"
                >
                  <Trash2 className="w-4 h-4 text-slate-500" />
                  <span>Delete for Me</span>
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedMessageForAction.text);
                    setSelectedMessageForAction(null);
                    alert('Copied to clipboard!');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-800 flex items-center gap-2.5"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Text</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-3 bg-white border-t border-slate-200 z-50">
          {editingMessageId && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl mb-2 flex items-center justify-between text-xs text-blue-800 font-medium">
              <span>Editing message...</span>
              <button onClick={() => setEditingMessageId(null)} className="text-blue-600 hover:text-blue-900">Cancel</button>
            </div>
          )}

          {/* Input restricted if not approved (except for groups) */}
          {!isGroup && activeChat.email && friendshipStatuses[activeChat.email] && friendshipStatuses[activeChat.email] !== 'approved' ? (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center justify-center">
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Messaging Locked until Approved</span>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Attachment: Choose Image, Video, or Audio from device')}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5 stroke-[1.85]" />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 h-11 px-4 text-xs sm:text-sm bg-slate-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2e7d32]/20 border border-transparent focus:border-[#2e7d32] transition-all"
            />

            <button
              type="button"
              onClick={handleSendVoiceNote}
              className="p-2.5 text-slate-600 hover:text-[#2e7d32] rounded-full hover:bg-slate-100 transition-colors"
              title="Send Voice Note"
            >
              <Mic className="w-5 h-5 stroke-[1.85]" />
            </button>

            <button
              type="submit"
              className="w-11 h-11 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
          )}
        </div>

        {/* Group Info Modal */}
        {isGroupInfoModalOpen && isGroup && (
          <div className="fixed inset-0 z-50 bg-white min-h-screen flex flex-col overflow-y-auto animate-in slide-in-from-bottom-2">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10 shadow-xs">
              <button onClick={() => setIsGroupInfoModalOpen(false)} className="p-2 -ml-2 text-slate-700">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-slate-900 text-base">Group Details</h2>
              <div className="w-6" />
            </div>

            <div className="p-5 max-w-lg mx-auto w-full space-y-5 pb-24">
              {/* Group Header Card */}
              <div className="flex flex-col items-center text-center p-5 bg-slate-50 rounded-3xl border border-slate-200 shadow-xs">
                {activeChat.avatarUrl ? (
                  <img src={activeChat.avatarUrl} alt={activeChat.name} className="w-24 h-24 rounded-full object-cover border-2 border-emerald-600 shadow-md mb-3" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-700 text-white flex items-center justify-center text-3xl font-bold shadow-md mb-3">
                    <Users className="w-10 h-10" />
                  </div>
                )}
                <h3 className="font-bold text-slate-900 text-lg">{activeChat.name}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">{activeChat.groupDescription || 'No description added yet.'}</p>
                <div className="mt-3 text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {activeMembers.length} Active Members • End-to-End Encrypted
                </div>
              </div>

              {/* Admin Permissions & Settings Button */}
              {currentUserIsAdmin && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-700" />
                      Group Admin Settings
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">Control who can send messages, add members, or edit info</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGroupPermissionsModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#2e7d32] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#256829]"
                  >
                    Edit Permissions
                  </button>
                </div>
              )}

              {/* Add Members Action */}
              {(currentUserIsAdmin || activeChat.groupPermissions?.addMembers === 'all') && (
                <button
                  type="button"
                  onClick={() => setIsAddMemberToGroupModalOpen(true)}
                  className="w-full py-3 px-4 bg-white border border-slate-300 hover:border-slate-800 rounded-2xl font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-center gap-2 shadow-xs"
                >
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  <span>Add Participants to Group</span>
                </button>
              )}

              {/* Active Members List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Active Participants ({activeMembers.length})
                </h4>

                {activeMembers.map((m) => (
                  <div key={m.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 font-bold text-xs flex items-center justify-center text-slate-700">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {m.isAdmin && (
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">@{m.username}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const targetFriend = chats.find(c => c.id === m.id) || {
                          id: m.id,
                          name: m.name,
                          username: m.username,
                          avatarUrl: m.avatarUrl,
                          isOnline: true,
                          location: 'Kaduna, Nigeria',
                          lastMessage: '',
                          lastMessageTime: '',
                        };
                        onViewUserProfile?.(targetFriend);
                        setIsGroupInfoModalOpen(false);
                      }}
                      className="text-xs font-semibold text-emerald-700 hover:underline px-2"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>

              {/* Past / Left Members */}
              {leftMembers.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Past Participants / Those Who Left ({leftMembers.length})
                  </h4>

                  {leftMembers.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between opacity-75">
                      <div className="flex items-center gap-3">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-9 h-9 rounded-full object-cover grayscale" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-300 font-bold text-xs flex items-center justify-center text-slate-600">
                            {m.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-700 text-xs">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.leftTime || 'Left the group'}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded-md">
                        Left
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Exit Group Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-sm rounded-2xl border border-red-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit & Leave Group</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Group Permissions Modal (Admin Only) */}
        {isGroupPermissionsModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Group Admin Permissions</h3>
                <button onClick={() => setIsGroupPermissionsModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* 1. Send Messages */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-900">Send Messages</div>
                    <div className="text-[10px] text-slate-500">Who can send chat messages</div>
                  </div>
                  <select
                    value={activeChat.groupPermissions?.sendMessages || 'all'}
                    onChange={(e) => {
                      const val = e.target.value as 'all' | 'admins';
                      setChats((prev) =>
                        prev.map((c) =>
                          c.id === activeChat.id
                            ? { ...c, groupPermissions: { ...c.groupPermissions!, sendMessages: val } }
                            : c
                        )
                      );
                    }}
                    className="h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="all">All Members</option>
                    <option value="admins">Only Admins</option>
                  </select>
                </div>

                {/* 2. Add Members */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-900">Add Participants</div>
                    <div className="text-[10px] text-slate-500">Who can add other friends</div>
                  </div>
                  <select
                    value={activeChat.groupPermissions?.addMembers || 'all'}
                    onChange={(e) => {
                      const val = e.target.value as 'all' | 'admins';
                      setChats((prev) =>
                        prev.map((c) =>
                          c.id === activeChat.id
                            ? { ...c, groupPermissions: { ...c.groupPermissions!, addMembers: val } }
                            : c
                        )
                      );
                    }}
                    className="h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="all">All Members</option>
                    <option value="admins">Only Admins</option>
                  </select>
                </div>

                {/* 3. Edit Group Info */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-900">Edit Group Info</div>
                    <div className="text-[10px] text-slate-500">Change description & details</div>
                  </div>
                  <select
                    value={activeChat.groupPermissions?.editGroupInfo || 'admins'}
                    onChange={(e) => {
                      const val = e.target.value as 'all' | 'admins';
                      setChats((prev) =>
                        prev.map((c) =>
                          c.id === activeChat.id
                            ? { ...c, groupPermissions: { ...c.groupPermissions!, editGroupInfo: val } }
                            : c
                        )
                      );
                    }}
                    className="h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="admins">Only Admins</option>
                    <option value="all">All Members</option>
                  </select>
                </div>

                {/* 4. Change Group Icon */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-900">Change Group Icon</div>
                    <div className="text-[10px] text-slate-500">Upload or replace avatar</div>
                  </div>
                  <select
                    value={activeChat.groupPermissions?.changeGroupIcon || 'admins'}
                    onChange={(e) => {
                      const val = e.target.value as 'all' | 'admins';
                      setChats((prev) =>
                        prev.map((c) =>
                          c.id === activeChat.id
                            ? { ...c, groupPermissions: { ...c.groupPermissions!, changeGroupIcon: val } }
                            : c
                        )
                      );
                    }}
                    className="h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="admins">Only Admins</option>
                    <option value="all">All Members</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGroupPermissionsModalOpen(false)}
                className="w-full h-10 bg-[#2e7d32] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Permissions
              </button>
            </div>
          </div>
        )}

        {/* Add Member To Group Modal */}
        {isAddMemberToGroupModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Add Friends to Group</h3>
                <button onClick={() => setIsAddMemberToGroupModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {chats.filter(c => !c.isGroup && !activeMembers.some(m => m.id === c.id)).map((friend) => (
                  <div key={friend.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{friend.name}</div>
                        <div className="text-[10px] text-slate-400">{friend.location}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newMember: GroupMember = {
                          id: friend.id,
                          name: friend.name,
                          username: friend.username,
                          avatarUrl: friend.avatarUrl,
                          isAdmin: false,
                          status: 'active',
                        };
                        setChats((prev) =>
                          prev.map((c) =>
                            c.id === activeChat.id
                              ? { ...c, groupMembers: [...(c.groupMembers || []), newMember] }
                              : c
                          )
                        );
                        alert(`${friend.name} added to the group!`);
                        setIsAddMemberToGroupModalOpen(false);
                      }}
                      className="px-3 py-1 bg-[#2e7d32] text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audio & Video Call Overlay */}
        {activeCallType && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-8 text-white animate-in zoom-in-95">
            <div className="text-center pt-8">
              <h2 className="text-xl font-bold">{activeChat.name}</h2>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                {activeCallType === 'voice' ? '📞 Voice Call Connected' : '📹 HD Video Call Active'}
              </div>
              <div className="font-mono text-sm mt-2 text-slate-300">
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="relative my-auto">
              <img
                src={activeChat.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={activeChat.name}
                className="w-36 h-36 rounded-full object-cover border-4 border-emerald-500 shadow-2xl animate-pulse"
              />
            </div>

            <div className="flex items-center justify-center gap-6 pb-8">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveCallType(null)}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isVideoOff ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW 2: MAIN CHAT INBOX & FEELINGS / STORIES (Left Screen in Sketch)
  // ----------------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 pb-28 overflow-y-auto">
      
      {/* Top Header matching Sketch */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-1.5">
              status
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] -mt-0.5">Feelings & Stories</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => syncFriendshipsToChats()}
              disabled={isSyncing}
              className={`w-8 h-8 flex items-center justify-center text-slate-600 hover:text-[#2e7d32] rounded-full hover:bg-slate-100 transition-all ${isSyncing ? 'animate-spin text-emerald-600' : ''}`}
              title="Sync Friendships"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-[#2e7d32] rounded-full hover:bg-slate-100 transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status feelings bar integrated into header */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3.5 overflow-x-auto pb-1 scrollbar-none">
            {/* First: Your Own Feeling / Add Feeling */}
            <div className="flex flex-col items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveFeelingIndex(-1);
                }}
                className="w-14 h-14 rounded-full border-2 border-dashed border-[#2e7d32] bg-emerald-50/70 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform relative group shadow-xs"
              >
                {myStatuses.length > 0 ? (
                  <span className="text-xl">✨</span>
                ) : (
                  <Plus className="w-5 h-5 text-[#2e7d32]" />
                )}
                {myStatuses.length > 0 && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#2e7d32] text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white">
                    {myStatuses.length}
                  </span>
                )}
              </button>
              <span className="text-[10px] font-bold text-slate-800 mt-1">
                {myStatuses.length > 0 ? 'My Status' : '+ Add'}
              </span>
            </div>

            {/* Friends with Feelings */}
            {chats.filter(c => !c.isGroup && c.hasFeeling).map((friend, idx) => (
              <div key={friend.id} className="flex flex-col items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveFeelingIndex(idx)}
                  onMouseDown={() => handleStartLongPress(friend)}
                  onMouseUp={handleEndLongPress}
                  onTouchStart={() => handleStartLongPress(friend)}
                  onTouchEnd={handleEndLongPress}
                  className="w-14 h-14 rounded-full border-2 border-[#2e7d32] p-0.5 hover:scale-105 active:scale-95 transition-transform relative"
                >
                  <img
                    src={friend.avatarUrl}
                    alt={friend.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {friend.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </button>
                <span className="text-[10px] font-semibold text-slate-700 mt-1 max-w-[56px] truncate text-center">
                  {friend.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Action Row: Create Group & Add Friends */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsCreateGroupModalOpen(true)}
            className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition-colors"
          >
            <Users className="w-4 h-4 text-[#2e7d32]" />
            <span>Create Group</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsAddFriendsModalOpen(true)}
            className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4 text-[#2e7d32]" />
            <span>Add Friends</span>
          </button>
        </div>

        {/* Pending Requests Section (Request #10) */}
        {(() => {
          const pending = Object.entries(friendshipStatuses).filter(([_, status]) => status === 'pending');
          if (pending.length === 0) return null;
          return (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wider">
                  <UserPlus className="w-4 h-4" />
                  Friend Requests
                </h3>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">{pending.length} New</span>
              </div>
              <div className="space-y-2">
                {pending.map(([email]) => {
                  const userData = databaseUsers.find(u => u.email === email);
                  if (!userData) return null;
                  return (
                    <div key={email} className="flex items-center justify-between bg-white/80 p-3 rounded-xl border border-amber-100 shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                          {userData.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">{userData.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApproveFriend(email)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-xs hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 4 Filter Tabs: Recent | Friends | Unread | Groups */}
        <div className="flex items-center gap-2 pt-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'recent', label: 'Recent', count: chats.length },
            { id: 'friends', label: 'Friends', count: chats.filter(c => !c.isGroup).length },
            { id: 'unread', label: 'Unread', count: chats.filter(c => (c.unreadCount || 0) > 0).length },
            { id: 'groups', label: 'Groups', count: chats.filter(c => c.isGroup).length },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Chats Stream List */}
        <div className="space-y-2 pt-1">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                onMouseDown={() => handleStartLongPress(chat)}
                onMouseUp={handleEndLongPress}
                onTouchStart={() => handleStartLongPress(chat)}
                onTouchEnd={handleEndLongPress}
                className="p-3.5 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-300 flex items-center justify-between gap-3.5 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <div className="relative shrink-0">
                  {chat.avatarUrl ? (
                    <img
                      src={chat.avatarUrl}
                      alt={chat.name}
                      className="w-13 h-13 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className={`w-13 h-13 rounded-full flex items-center justify-center font-bold text-base shadow-xs ${
                      chat.isGroup ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {chat.isGroup ? <Users className="w-6 h-6" /> : chat.name.charAt(0)}
                    </div>
                  )}
                  {chat.isOnline && !chat.isGroup && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                      {chat.name}
                      {chat.isGroup ? (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          Group
                        </span>
                      ) : chat.email && friendshipStatuses[chat.email] === 'pending' ? (
                        <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tight border border-amber-100">
                          Pending
                        </span>
                      ) : chat.email && friendshipStatuses[chat.email] === 'received' ? (
                        <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tight border border-blue-100">
                          Request
                        </span>
                      ) : !chat.isFriend ? (
                        <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tight border border-rose-100">
                          Unfriend
                        </span>
                      ) : null}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unreadCount ? (
                  <span className="w-5 h-5 rounded-full bg-[#2e7d32] text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                    {chat.unreadCount}
                  </span>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No conversations found in "{activeFilter}".
            </div>
          )}
        </div>

      </div>

      {/* Long Press User Profile Preview Modal */}
      {longPressedUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLongPressedUser(null)}
        >
          <div
            className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-[#2e7d32] shadow-md">
              {longPressedUser.avatarUrl ? (
                <img src={longPressedUser.avatarUrl} alt={longPressedUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-700 text-white flex items-center justify-center text-3xl font-bold">
                  {longPressedUser.isGroup ? <Users className="w-10 h-10" /> : longPressedUser.name.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">{longPressedUser.name}</h3>
              <p className="text-xs text-slate-500">@{longPressedUser.username} • {longPressedUser.location}</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onViewUserProfile?.(longPressedUser);
                  setLongPressedUser(null);
                }}
                className="w-full py-3 bg-[#2e7d32] text-white font-bold text-xs rounded-xl hover:bg-[#256829] shadow-xs flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>View Full Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSelectChat(longPressedUser);
                  setLongPressedUser(null);
                }}
                className="w-full py-3 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Open Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Feelings / Status Viewer */}
      {activeFeelingIndex !== null && (() => {
        const friendsWithFeelings = chats.filter((c) => !c.isGroup && c.hasFeeling);
        const isMyStatus = activeFeelingIndex === -1;
        const currentFriend = !isMyStatus ? friendsWithFeelings[activeFeelingIndex] : null;

        if (isMyStatus) {
          // If viewing a specific status in full-screen mode matching screenshot 1791214382212.jpg
          if (fullscreenMyStatusId) {
            const currentStat = myStatuses.find(s => s.id === fullscreenMyStatusId) || myStatuses[0];
            if (!currentStat) {
              setFullscreenMyStatusId(null);
              return null;
            }

            return (
              <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between text-white animate-in fade-in select-none">
                
                {/* Top Segmented Story Progress Bar */}
                <div className="pt-3 px-4 flex items-center gap-1.5 z-20">
                  {myStatuses.map((s) => (
                    <div
                      key={s.id}
                      className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
                    >
                      <div
                        className={`h-full transition-all duration-300 ${
                          s.id === currentStat.id ? 'w-full bg-emerald-400' : 'w-full bg-white/50'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Top Header matching screenshot 1791214382212.jpg */}
                <div className="px-4 py-3 flex items-center justify-between z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFullscreenMyStatusId(null)}
                      className="p-1 -ml-1 text-white hover:text-slate-200"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    
                    {/* Avatar with green + badge */}
                    <div className="relative shrink-0">
                      <img
                        src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border border-white/60 object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-black">
                        +
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm leading-tight text-white">My status</h3>
                      <span className="text-[11px] text-slate-300">{currentStat.time}</span>
                    </div>
                  </div>

                  {/* Three Dots Menu for Fullscreen View */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setStatusMenuOpenId(statusMenuOpenId === currentStat.id ? null : currentStat.id)}
                      className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10"
                    >
                      <MoreVertical className="w-6 h-6" />
                    </button>

                    {statusMenuOpenId === currentStat.id && (
                      <div className="absolute top-12 right-0 bg-[#202c33] border border-slate-700 rounded-2xl shadow-2xl py-2 w-44 z-50 text-xs font-semibold text-white">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStatusId(currentStat.id);
                            setEditingStatusText(currentStat.text);
                            setEditingStatusBgColor(currentStat.bgColor || '#2e7d32');
                            setStatusMenuOpenId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-[#2a3942] flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4 text-emerald-400" />
                          <span>Edit Status</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this status update?')) {
                              setMyStatuses(prev => prev.filter(s => s.id !== currentStat.id));
                              setFullscreenMyStatusId(null);
                              setStatusMenuOpenId(null);
                            }
                          }}
                          className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-[#2a3942] flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span>Delete Status</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Content / Media */}
                <div className="my-auto px-4 text-center z-15 relative flex flex-col items-center justify-center">
                  {currentStat.mediaUrl ? (
                    <div className="max-h-[60vh] w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
                      <img src={currentStat.mediaUrl} alt="Status Media" className="w-full h-full object-contain bg-black" />
                    </div>
                  ) : (
                    <div
                      className="p-8 rounded-3xl max-w-md w-full my-auto flex items-center justify-center min-h-[40vh] shadow-2xl"
                      style={{ backgroundColor: currentStat.bgColor || '#2e7d32' }}
                    >
                      <p className="text-xl sm:text-2xl font-bold leading-relaxed text-white drop-shadow-md">
                        "{currentStat.text}"
                      </p>
                    </div>
                  )}

                  {/* Text Caption at Bottom matching screenshot 1791214382212.jpg */}
                  {currentStat.mediaUrl && currentStat.text && (
                    <div className="mt-4 max-w-sm text-left px-2">
                      <p className="text-sm font-semibold text-white drop-shadow-md">
                        {isCaptionExpanded ? currentStat.text : currentStat.text.slice(0, 80)}
                        {currentStat.text.length > 80 && (
                          <button
                            type="button"
                            onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                            className="ml-1 text-emerald-400 font-bold hover:underline"
                          >
                            {isCaptionExpanded ? 'Show less' : '... Read more'}
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Bar matching screenshot 1791214382212.jpg: ONLY Views button, NO Facebook or Instagram icons */}
                <div className="p-4 z-20 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent">
                  {/* Eye / Views button pill */}
                  <button
                    type="button"
                    onClick={() => setShowViewersAndLikesSheet(true)}
                    className="flex items-center gap-2 bg-[#202c33]/90 hover:bg-[#2a3942] text-white px-4 py-2 rounded-full border border-slate-700/80 text-xs font-bold shadow-xl transition-all active:scale-95"
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>{currentStat.viewsCount || currentStat.viewers.length}</span>
                  </button>

                  {/* Clean right side without Facebook or Instagram icons per instructions */}
                  <div className="text-[11px] text-slate-400 font-mono">
                    Tap views to see list
                  </div>
                </div>

                {/* Viewers & Likes Sheet */}
                {showViewersAndLikesSheet && (
                  <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
                    <div className="bg-[#202c33] rounded-t-3xl p-5 border-t border-slate-700 space-y-4 max-h-[60vh] overflow-y-auto shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setViewersSheetTab('viewers')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                              viewersSheetTab === 'viewers' ? 'bg-[#00a884] text-white' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            <span>{currentStat.viewers.length} Views</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setViewersSheetTab('likes')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                              viewersSheetTab === 'likes' ? 'bg-[#00a884] text-white' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            <span>{currentStat.likes.length} Likes</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowViewersAndLikesSheet(false)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Viewers or Likes List */}
                      <div className="space-y-3">
                        {viewersSheetTab === 'viewers' ? (
                          currentStat.viewers.length > 0 ? (
                            currentStat.viewers.map((v, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#2a3942]">
                                <div className="flex items-center gap-3">
                                  <img src={v.avatar} alt={v.name} className="w-8 h-8 rounded-full object-cover" />
                                  <span className="font-bold text-xs text-white">{v.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">{v.time}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-slate-400 text-xs">No viewers yet</div>
                          )
                        ) : (
                          currentStat.likes.length > 0 ? (
                            currentStat.likes.map((l, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#2a3942]">
                                <div className="flex items-center gap-3">
                                  <img src={l.avatar} alt={l.name} className="w-8 h-8 rounded-full object-cover" />
                                  <span className="font-bold text-xs text-white">{l.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-red-400 font-bold">
                                  <Heart className="w-3.5 h-3.5 fill-current" />
                                  <span>{l.time}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-slate-400 text-xs">No likes yet</div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Otherwise show "My status" list view matching screenshot 1791213859261.jpg
          return (
            <div className="fixed inset-0 z-50 bg-[#111b21] flex flex-col justify-between text-white animate-in fade-in select-none">
              {/* Top Header matching screenshot 1791213859261.jpg */}
              <div className="px-4 py-4 flex items-center justify-between border-b border-slate-800 bg-[#202c33]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveFeelingIndex(null)}
                    className="p-1 -ml-1 text-white hover:text-slate-200"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h1 className="text-lg font-bold">My status</h1>
                </div>
              </div>

              {/* Status List View in Line matching screenshot */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {myStatuses.length > 0 ? (
                  myStatuses.map((stat) => (
                    <div
                      key={stat.id}
                      onClick={() => setFullscreenMyStatusId(stat.id)}
                      className="flex items-center justify-between p-3.5 bg-[#202c33] hover:bg-[#2a3942] rounded-2xl border border-slate-800 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {stat.mediaUrl ? (
                          <img src={stat.mediaUrl} alt="Status thumbnail" className="w-12 h-12 rounded-full object-cover border border-emerald-500 shrink-0 group-hover:scale-105 transition-transform" />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: stat.bgColor || '#2e7d32' }}
                          >
                            💬
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{stat.viewsCount} views</span>
                            <span>•</span>
                            <span className="text-emerald-400">❤️ {stat.likesCount}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{stat.time}</div>
                        </div>
                      </div>

                      {/* Three Dots Menu for Status Item */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusMenuOpenId(statusMenuOpenId === stat.id ? null : stat.id);
                          }}
                          className="p-2 text-slate-400 hover:text-white rounded-full"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {statusMenuOpenId === stat.id && (
                          <div
                            className="absolute right-0 top-10 bg-[#2a3942] border border-slate-700 rounded-2xl shadow-2xl py-2 w-40 z-50 text-xs font-semibold text-white animate-in fade-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStatusId(stat.id);
                                setEditingStatusText(stat.text);
                                setEditingStatusBgColor(stat.bgColor || '#2e7d32');
                                setStatusMenuOpenId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-[#202c33] flex items-center gap-2"
                            >
                              <Edit3 className="w-4 h-4 text-emerald-400" />
                              <span>Edit Status</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Delete this status update?')) {
                                  setMyStatuses(prev => prev.filter(s => s.id !== stat.id));
                                  setStatusMenuOpenId(null);
                                }
                              }}
                              className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-[#202c33] flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                              <span>Delete Status</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No status updates posted yet. Tap the buttons below to post text, photos, or videos!
                  </div>
                )}

                {/* Encryption notice matching screenshot */}
                <div className="text-center py-6 px-4 text-xs text-slate-400 leading-relaxed">
                  🔒 Your statuses are <span className="text-emerald-400 font-semibold">end-to-end encrypted</span>. They will disappear after 24 hours.
                </div>
              </div>

              {/* Floating Action Buttons / Add Status Bar matching WhatsApp style */}
              <div className="p-4 bg-[#202c33] border-t border-slate-800 flex items-center justify-end gap-3 z-20">
                <button
                  type="button"
                  onClick={() => setIsCreatingTextStatus(true)}
                  className="w-12 h-12 rounded-full bg-[#00a884] hover:bg-[#008f72] text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
                  title="Post Text Status with Color"
                >
                  <Edit3 className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreatingMediaStatus(true)}
                  className="w-14 h-14 rounded-full bg-[#00a884] hover:bg-[#008f72] text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
                  title="Post Image or Video Status"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>

              {/* Edit Status Modal */}
              {editingStatusId && (
                <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                  <div className="w-full max-w-sm bg-[#202c33] rounded-3xl p-6 border border-slate-700 space-y-4 shadow-2xl text-white">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                      <h3 className="font-bold text-sm">Edit Status Update</h3>
                      <button onClick={() => setEditingStatusId(null)} className="p-1 text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-300">Update Caption / Text</label>
                      <textarea
                        rows={3}
                        value={editingStatusText}
                        onChange={(e) => setEditingStatusText(e.target.value)}
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00a884]"
                      />

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingStatusId(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMyStatuses(prev => prev.map(s => s.id === editingStatusId ? { ...s, text: editingStatusText.trim() } : s));
                            setEditingStatusId(null);
                          }}
                          className="px-4 py-2 bg-[#00a884] hover:bg-[#008f72] text-white text-xs font-bold rounded-xl shadow-lg"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Status Creator Modal with 10 Color Choices */}
              {isCreatingTextStatus && (
                <div className="fixed inset-0 z-60 bg-slate-950/90 flex flex-col justify-between p-6 animate-in zoom-in-95" style={{ backgroundColor: selectedTextBgColor }}>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTextStatus(false)}
                      className="p-2 text-white bg-black/30 rounded-full"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-sm">Create Text Status</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newTextStatusContent.trim()) return;
                        const newStat = {
                          id: `stat_${Date.now()}`,
                          text: newTextStatusContent.trim(),
                          mediaType: 'text' as const,
                          bgColor: selectedTextBgColor,
                          time: 'Just now',
                          viewsCount: 0,
                          likesCount: 0,
                          viewers: [],
                          likes: [],
                        };
                        setMyStatuses(prev => [newStat, ...prev]);
                        setNewTextStatusContent('');
                        setIsCreatingTextStatus(false);
                      }}
                      className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-full shadow-lg"
                    >
                      Post Status
                    </button>
                  </div>

                  {/* TextArea input centered */}
                  <div className="my-auto max-w-md mx-auto w-full">
                    <textarea
                      rows={4}
                      value={newTextStatusContent}
                      onChange={(e) => setNewTextStatusContent(e.target.value)}
                      placeholder="Type a status..."
                      className="w-full bg-transparent text-white placeholder-white/60 text-center font-bold text-2xl sm:text-3xl focus:outline-none resize-none"
                      autoFocus
                    />
                  </div>

                  {/* 10 Color Palette Choices */}
                  <div className="space-y-3 pb-4">
                    <div className="text-center text-xs font-bold text-white/80">Choose background color (10 options)</div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {STATUS_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedTextBgColor(col)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            selectedTextBgColor === col ? 'scale-125 border-white shadow-xl' : 'border-white/30 hover:scale-110'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Media Status Creator Modal (Image or Video from device or camera) */}
              {isCreatingMediaStatus && (
                <div className="fixed inset-0 z-60 bg-slate-950/95 flex flex-col justify-between p-6 animate-in zoom-in-95 text-white">
                  {/* Hidden file inputs for Device Picker and Camera Capture */}
                  <input
                    type="file"
                    ref={deviceFileInputRef}
                    accept="image/*,video/*"
                    onChange={handleMediaFileChange}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*,video/*"
                    capture="environment"
                    onChange={handleMediaFileChange}
                    className="hidden"
                  />

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsCreatingMediaStatus(false)}
                      className="p-2 text-white bg-black/30 rounded-full hover:bg-black/50"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-sm">Post Photo or Video Status</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newStat = {
                          id: `stat_${Date.now()}`,
                          text: newTextStatusContent.trim() || (newMediaType === 'video' ? 'Shared a video status' : 'Shared a photo status'),
                          mediaUrl: newMediaStatusUrl,
                          mediaType: newMediaType,
                          bgColor: '#111b21',
                          time: 'Just now',
                          viewsCount: 0,
                          likesCount: 0,
                          viewers: [],
                          likes: [],
                        };
                        setMyStatuses(prev => [newStat, ...prev]);
                        setNewTextStatusContent('');
                        setIsCreatingMediaStatus(false);
                      }}
                      className="px-4 py-2 bg-[#00a884] text-white font-bold text-xs rounded-full shadow-lg hover:bg-[#008f72]"
                    >
                      Post Status
                    </button>
                  </div>

                  <div className="my-auto max-w-sm mx-auto w-full space-y-4 text-center">
                    {/* Device Upload or Camera Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => deviceFileInputRef.current?.click()}
                        className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="py-3 px-4 rounded-2xl bg-[#00a884] hover:bg-[#008f72] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Photo/Video</span>
                      </button>
                    </div>

                    {/* Media Preview Box */}
                    <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl relative flex items-center justify-center">
                      {newMediaType === 'video' && newMediaStatusUrl.startsWith('data:video') ? (
                        <video src={newMediaStatusUrl} controls className="w-full h-full object-contain" />
                      ) : (
                        <img src={newMediaStatusUrl} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-300 border border-slate-700">
                        {newMediaType === 'video' ? '▶ Video Selected' : '📷 Photo Selected'}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={newTextStatusContent}
                      onChange={(e) => setNewTextStatusContent(e.target.value)}
                      placeholder="Add a caption..."
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        }

        const totalStories = friendsWithFeelings.length;
        const currentProgressIndex = activeFeelingIndex;

        const handleNextFeeling = () => {
          if (activeFeelingIndex < friendsWithFeelings.length - 1) {
            setActiveFeelingIndex(activeFeelingIndex + 1);
          } else {
            setActiveFeelingIndex(null);
          }
        };

        const handlePrevFeeling = () => {
          if (activeFeelingIndex > 0) {
            setActiveFeelingIndex(activeFeelingIndex - 1);
          } else {
            setActiveFeelingIndex(null);
          }
        };

        const handleLikeFriendStatus = (friendId: string) => {
          setFriendStatusLikes((prev) => {
            const current = prev[friendId] || { count: 10, isLiked: false };
            const nextLiked = !current.isLiked;
            return {
              ...prev,
              [friendId]: {
                count: nextLiked ? current.count + 1 : Math.max(0, current.count - 1),
                isLiked: nextLiked,
              },
            };
          });
        };

        return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between text-white animate-in fade-in select-none">
            
            {/* Top Segmented Story Progress Bar */}
            <div className="pt-3 px-4 flex items-center gap-1.5 z-20">
              {Array.from({ length: totalStories }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      i < currentProgressIndex
                        ? 'w-full bg-white'
                        : i === currentProgressIndex
                        ? 'w-full bg-emerald-400 animate-pulse'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Header: Author Avatar, Name, Time, Close */}
            <div className="px-4 py-3 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveFeelingIndex(null)}
                  className="p-1 -ml-1 text-white/80 hover:text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <img
                  src={currentFriend?.avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-white/60 object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white">
                    {currentFriend?.name}
                  </h3>
                  <span className="text-[11px] text-slate-300">
                    {currentFriend?.feelingTime}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveFeelingIndex(null)}
                className="p-2 text-white/80 hover:text-white rounded-full bg-black/40"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tap Left / Right Navigation Touch Overlays */}
            <div className="absolute inset-0 flex z-10">
              <div className="w-1/3 h-full cursor-pointer" onClick={handlePrevFeeling} />
              <div className="w-1/3 h-full" />
              <div className="w-1/3 h-full cursor-pointer" onClick={handleNextFeeling} />
            </div>

            {/* Status Content Body */}
            <div className="my-auto px-6 text-center z-15 relative">
              <p className="text-xl sm:text-2xl font-bold leading-relaxed text-white drop-shadow-md">
                "{currentFriend?.feelingText}"
              </p>

              <div className="text-xs text-slate-400 mt-4">
                Tap right side for next status, left for previous
              </div>
            </div>

            {/* Friend's Feeling Bottom Action Bar: Reply + Floating Like Button + Comments button */}
            {currentFriend && (
              <div className="p-4 bg-gradient-to-t from-black/90 to-transparent z-20 flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Reply to ${currentFriend.name.split(' ')[0]}...`}
                  value={statusCommentInputText}
                  onChange={(e) => setStatusCommentInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && statusCommentInputText.trim()) {
                      const newComm = {
                        id: `comm_${Date.now()}`,
                        authorName: currentUser.fullName || 'You',
                        authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                        text: statusCommentInputText.trim(),
                        time: 'Just now',
                      };
                      setFriendStatusComments(prev => ({
                        ...prev,
                        [currentFriend.id]: [...(prev[currentFriend.id] || []), newComm]
                      }));
                      setStatusCommentInputText('');
                      alert('Comment posted on status!');
                    }
                  }}
                  className="flex-1 h-12 px-4 rounded-full bg-white/20 text-white placeholder-white/60 text-xs sm:text-sm focus:outline-none focus:bg-white/30 border border-white/20"
                />

                {/* Floating Like Button */}
                {(() => {
                  const likeInfo = friendStatusLikes[currentFriend.id] || { count: 12, isLiked: false };
                  return (
                    <button
                      type="button"
                      onClick={() => handleLikeFriendStatus(currentFriend.id)}
                      className={`h-12 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-125 ${
                        likeInfo.isLiked
                          ? 'bg-red-600 text-white'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likeInfo.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs font-bold">{likeInfo.count}</span>
                    </button>
                  );
                })()}

                {/* Click comments to list those who commented/can comment while bottom buttons remain hidden */}
                <button
                  type="button"
                  onClick={() => setIsStatusCommentsSheetOpen(true)}
                  className="h-12 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center gap-1.5 text-white shadow-lg font-bold text-xs transition-transform active:scale-95 shrink-0"
                  title="View & List Status Comments"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Comments ({(friendStatusComments[currentFriend.id] || []).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (statusCommentInputText.trim()) {
                      const newComm = {
                        id: `comm_${Date.now()}`,
                        authorName: currentUser.fullName || 'You',
                        authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                        text: statusCommentInputText.trim(),
                        time: 'Just now',
                      };
                      setFriendStatusComments(prev => ({
                        ...prev,
                        [currentFriend.id]: [...(prev[currentFriend.id] || []), newComm]
                      }));
                      setStatusCommentInputText('');
                      alert('Reply / comment posted directly to status!');
                    } else {
                      setIsStatusCommentsSheetOpen(true);
                    }
                  }}
                  className="w-12 h-12 bg-[#2e7d32] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            )}

            {/* Status Comments Sheet Drawer (Listing those who can comment) */}
            {isStatusCommentsSheetOpen && currentFriend && (
              <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
                <div className="bg-[#202c33] rounded-t-3xl p-5 border-t border-slate-700 space-y-4 max-h-[70vh] flex flex-col shadow-2xl text-white">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3 shrink-0">
                    <div>
                      <h3 className="font-bold text-sm">Status Comments & Replies</h3>
                      <p className="text-[10px] text-slate-400">List of friends who can comment on {currentFriend.name}'s status</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsStatusCommentsSheetOpen(false);
                          setActiveFeelingIndex(null);
                          handleSelectChat(currentFriend);
                        }}
                        className="px-3 py-1.5 bg-[#00a884] text-white font-bold text-xs rounded-full shadow-xs hover:bg-[#008f72]"
                      >
                        Open Chat
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsStatusCommentsSheetOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Comment list */}
                  <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1">
                    {(friendStatusComments[currentFriend.id] || []).length > 0 ? (
                      (friendStatusComments[currentFriend.id] || []).map((comm) => (
                        <div key={comm.id} className="p-3 bg-[#2a3942] rounded-2xl border border-slate-700/60 flex items-start gap-3">
                          <img src={comm.authorAvatar} alt={comm.authorName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{comm.authorName}</span>
                              <span className="text-[10px] text-slate-400">{comm.time}</span>
                            </div>
                            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{comm.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No comments yet. Type below to be the first to comment on this status!
                      </div>
                    )}
                  </div>

                  {/* Post new comment input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700 shrink-0">
                    <input
                      type="text"
                      value={statusCommentInputText}
                      onChange={(e) => setStatusCommentInputText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 h-11 px-4 bg-slate-900 border border-slate-700 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00a884]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!statusCommentInputText.trim()) return;
                          const newComm = {
                            id: `comm_${Date.now()}`,
                            authorName: currentUser.fullName || 'You',
                            authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                            text: statusCommentInputText.trim(),
                            time: 'Just now',
                          };
                          setFriendStatusComments(prev => ({
                            ...prev,
                            [currentFriend.id]: [...(prev[currentFriend.id] || []), newComm]
                          }));
                          setStatusCommentInputText('');
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (!statusCommentInputText.trim()) return;
                        const newComm = {
                          id: `comm_${Date.now()}`,
                          authorName: currentUser.fullName || 'You',
                          authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                          text: statusCommentInputText.trim(),
                          time: 'Just now',
                        };
                        setFriendStatusComments(prev => ({
                          ...prev,
                          [currentFriend.id]: [...(prev[currentFriend.id] || []), newComm]
                        }));
                        setStatusCommentInputText('');
                      }}
                      className="w-11 h-11 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full flex items-center justify-center shrink-0 shadow-lg active:scale-95"
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Post Feeling Modal (Support Text, Photos, or Videos from device) */}
      {isPostFeelingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Share Feeling / Status</h3>
              <button onClick={() => setIsPostFeelingModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFeelingText.trim() && !newFeelingMediaUrl) return;
                const newStat = {
                  id: `stat_${Date.now()}`,
                  text: newFeelingText.trim() || 'Shared a status update',
                  mediaUrl: newFeelingMediaUrl,
                  mediaType: newFeelingMediaType,
                  bgColor: '#2e7d32',
                  time: 'Just now',
                  viewsCount: 0,
                  likesCount: 0,
                  viewers: [],
                  likes: [],
                };
                setMyStatuses(prev => [newStat, ...prev]);
                setIsPostFeelingModalOpen(false);
                setNewFeelingText('');
                setNewFeelingMediaUrl('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What's your feeling or message?</label>
                <textarea
                  rows={3}
                  value={newFeelingText}
                  onChange={(e) => setNewFeelingText(e.target.value)}
                  placeholder="Share what you're doing, thinking or feeling..."
                  className="w-full p-3.5 text-xs sm:text-sm border border-slate-300 rounded-2xl focus:outline-none focus:border-[#2e7d32]"
                  required
                  autoFocus
                />
              </div>

              {/* Attach Photo or Video from device */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attach Photo or Video (Optional)</label>
                <div
                  onClick={() => feelingFileInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-slate-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>{newFeelingMediaUrl ? '✓ Media Selected (Change)' : 'Choose Image or Video from Device'}</span>
                </div>
                <input
                  ref={feelingFileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = () => {
                        if (typeof r.result === 'string') {
                          setNewFeelingMediaUrl(r.result);
                          setNewFeelingMediaType(file.type.startsWith('video') ? 'video' : 'image');
                        }
                      };
                      r.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#2e7d32] hover:bg-[#256829] text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Publish Status</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Friends Modal - Hard Forces ALL Auth Users from Database */}
      {isAddFriendsModalOpen && (
        <div className="fixed inset-0 z-50 bg-white min-h-screen flex flex-col overflow-y-auto animate-in slide-in-from-bottom-2">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10 shadow-xs">
            <button onClick={() => setIsAddFriendsModalOpen(false)} className="p-2 -ml-2 text-slate-700 hover:text-slate-900">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h2 className="font-bold text-slate-900 text-base">Find & Add Friends</h2>
            </div>
            <div className="w-6" />
          </div>

          <div className="p-5 max-w-lg mx-auto w-full space-y-4 pb-20">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
              <input
                type="text"
                value={friendsSearchQuery}
                onChange={(e) => setFriendsSearchQuery(e.target.value)}
                placeholder="Search by name, username, email or location..."
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            {databaseUsers.filter(u => {
              const isMe = currentUser && (
                (currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                (currentUser.username && u.username.toLowerCase() === currentUser.username.toLowerCase())
              );
              return !isMe;
            }).length === 0 && !isLoadingDbUsers && (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center text-xs text-slate-500">
                No other database accounts found yet.
              </div>
            )}

            <div className="space-y-3">
              {databaseUsers
                .filter((u) => {
                  const isMe = currentUser && (
                    (currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                    (currentUser.username && u.username.toLowerCase() === currentUser.username.toLowerCase())
                  );
                  if (isMe) return false;

                  // Hide if already requested or friends
                  const status = friendshipStatuses[u.email];
                  if (status === 'pending' || status === 'approved') return false;

                  const q = friendsSearchQuery.toLowerCase();
                  return (
                    !q ||
                    u.name.toLowerCase().includes(q) ||
                    u.username.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    (u.location && u.location.toLowerCase().includes(q))
                  );
                })
                .map((u) => (
                  <div
                    key={u.id}
                    className="p-4 bg-white rounded-3xl border border-slate-200 hover:border-emerald-500 shadow-sm flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-xs" />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xl sm:text-2xl shadow-md shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg truncate">{u.name}</h4>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            Live User
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate">@{u.username}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{u.location || 'Nigeria'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                      {friendshipStatuses[u.email] === 'approved' ? (
                        <button
                          type="button"
                          onClick={() => {
                            const existing = chats.find(c => c.username === u.username || c.id === u.id);
                            if (existing) {
                              setActiveChat(existing);
                            } else {
                              const newChatObj: ChatFriend = {
                                id: u.id,
                                isGroup: false,
                                name: u.name,
                                username: u.username,
                                avatarUrl: u.avatarUrl || '',
                                isOnline: true,
                                location: u.location || 'Kaduna, Nigeria',
                                isFriend: true,
                                hasContent: true,
                                lastMessage: 'Direct Chat with Database User',
                                lastMessageTime: 'Just now',
                                unreadCount: 0,
                                email: u.email,
                              };
                              setChats(prev => [newChatObj, ...prev]);
                              setActiveChat(newChatObj);
                            }
                            setIsAddFriendsModalOpen(false);
                          }}
                          className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-sm hover:bg-slate-800 flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Chat</span>
                        </button>
                      ) : friendshipStatuses[u.email] === 'pending' ? (
                        <div className="px-4 py-2.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-2xl border border-amber-200 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Pending</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendFriendRequest(u.email)}
                          className="px-4 py-2.5 bg-[#2e7d32] text-white font-bold text-xs rounded-2xl shadow-sm hover:bg-[#256829] flex items-center gap-1.5"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Friend</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>


          </div>
        </div>
      )}

      {/* Create Group Modal with Detailed WhatsApp Permissions */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-white min-h-screen flex flex-col overflow-y-auto animate-in slide-in-from-bottom-2">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10 shadow-xs">
            <button onClick={() => setIsCreateGroupModalOpen(false)} className="p-2 -ml-2 text-slate-700">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="font-bold text-slate-900 text-base">New Group Setup</h2>
            <div className="w-6" />
          </div>

          <form onSubmit={handleCreateGroupSubmit} className="p-5 max-w-lg mx-auto w-full space-y-5 pb-24">
            
            {/* Group Icon Upload or Skip */}
            <div className="flex items-center gap-4">
              <div 
                onClick={() => groupAvatarInputRef.current?.click()}
                className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer overflow-hidden relative shadow-inner"
                title="Click to upload group icon (optional)"
              >
                {groupAvatarUrl ? (
                  <img src={groupAvatarUrl} alt="Group Icon" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </div>
              <input
                ref={groupAvatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const r = new FileReader();
                    r.onload = () => {
                      if (typeof r.result === 'string') setGroupAvatarUrl(r.result);
                    };
                    r.readAsDataURL(file);
                  }
                }}
              />
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Group Subject / Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Kaduna Creators Hub"
                  className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Group Description</label>
              <textarea
                rows={2}
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Group purpose, rules and guidelines..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-xs sm:text-sm"
              />
            </div>

            {/* Detailed WhatsApp-Style Group Permissions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>Admin Permissions Control (WhatsApp-Style)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* 1. Send Messages */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="font-semibold text-slate-800">Send Messages</span>
                  <select
                    value={groupPermSendMessages}
                    onChange={(e) => setGroupPermSendMessages(e.target.value as any)}
                    className="mt-1 h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="all">All Members</option>
                    <option value="admins">Only Admins</option>
                  </select>
                </div>

                {/* 2. Add Members */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="font-semibold text-slate-800">Add Other Members</span>
                  <select
                    value={groupPermAddMembers}
                    onChange={(e) => setGroupPermAddMembers(e.target.value as any)}
                    className="mt-1 h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="all">All Members</option>
                    <option value="admins">Only Admins</option>
                  </select>
                </div>

                {/* 3. Edit Group Info */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="font-semibold text-slate-800">Edit Info & Description</span>
                  <select
                    value={groupPermEditInfo}
                    onChange={(e) => setGroupPermEditInfo(e.target.value as any)}
                    className="mt-1 h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="admins">Only Admins</option>
                    <option value="all">All Members</option>
                  </select>
                </div>

                {/* 4. Change Group Icon */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="font-semibold text-slate-800">Change Group Icon</span>
                  <select
                    value={groupPermChangeIcon}
                    onChange={(e) => setGroupPermChangeIcon(e.target.value as any)}
                    className="mt-1 h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="admins">Only Admins</option>
                    <option value="all">All Members</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Select Members */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Select Members from Friends ({selectedGroupMembers.length})</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {chats.filter(c => !c.isGroup && c.isFriend).map((f) => {
                  const isSelected = selectedGroupMembers.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        setSelectedGroupMembers((prev) =>
                          isSelected ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                        );
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={f.avatarUrl} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{f.name}</div>
                          <div className="text-[10px] text-slate-500">{f.location}</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-[#2e7d32] border-[#2e7d32] text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 bg-[#2e7d32] hover:bg-[#256829] text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Create Group & Start Chatting</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

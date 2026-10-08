import React, { useState, useRef } from 'react';
import { 
  ArrowLeft,
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Pause, 
  Film, 
  Music, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Check, 
  X, 
  Send, 
  Volume2, 
  UserPlus, 
  UserCheck, 
  Sparkles, 
  Upload, 
  Eye,
  Clock,
  ExternalLink,
  Search,
  Bookmark,
  MoreVertical
} from 'lucide-react';
import { PostItem, ContentTab, UserProfile, CommentItem } from '../types';

export const INITIAL_POPULATED_POSTS: PostItem[] = [
  {
    id: 'post_1',
    type: 'posts',
    title: 'Kaduna Creative Festival',
    description: 'Just finished shooting new creative photography portraits for the Kaduna Youth Festival! Excited to share these exclusive presets with everyone on I-pay. Check them out in the Market! 📸✨',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 142,
    comments: 18,
    createdAt: '2h ago',
    isLiked: false,
    isFollowing: false,
    authorName: 'Amina Bello',
    authorUsername: 'amina_bello',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Kaduna, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_2',
    type: 'posts',
    title: 'Tech Meetup in Zaria Hub',
    description: 'Amazing turnout at the Northern Tech Innovation Meetup. Discussing fintech solutions and scalable creator tools. 🚀',
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 215,
    comments: 24,
    createdAt: '5h ago',
    isLiked: true,
    isFollowing: true,
    authorName: 'Kabiru Sani',
    authorUsername: 'kabiru_dev',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Zaria, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_3',
    type: 'posts',
    title: 'Morning Coffee & Code',
    description: 'Starting the day right with fresh coffee and building responsive React components. Consistent daily practice is key! ☕💻',
    mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 98,
    comments: 12,
    createdAt: '1d ago',
    isLiked: false,
    isFollowing: false,
    authorName: 'Zainab Umar',
    authorUsername: 'zainab_u',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Kano, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_4',
    type: 'posts',
    title: 'Artisan Market Exhibition',
    description: 'Handmade leather crafts and textile designs on display this weekend. Support local Nigerian artisans! 🎨🧵',
    mediaUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 310,
    comments: 45,
    createdAt: '1d ago',
    isLiked: true,
    isFollowing: true,
    authorName: 'Fatima Ahmed',
    authorUsername: 'fatima_a',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Abuja, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_5',
    type: 'posts',
    title: 'Football Championship Victory',
    description: 'Unforgettable final match! Our team took home the trophy after a thrilling penalty shootout. ⚽🏆',
    mediaUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 420,
    comments: 50,
    createdAt: '2d ago',
    isLiked: false,
    isFollowing: false,
    authorName: 'Ibrahim Sani',
    authorUsername: 'ibrahim_s',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Kaduna, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_6',
    type: 'posts',
    title: 'Modern Architecture in Abuja',
    description: 'Exploring futuristic building designs and sustainable urban architecture in the capital city. 🏢✨',
    mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 185,
    comments: 19,
    createdAt: '2d ago',
    isLiked: true,
    isFollowing: false,
    authorName: 'Usman Danfodio',
    authorUsername: 'usman_d',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Abuja, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_7',
    type: 'posts',
    title: 'Traditional Northern Cuisine',
    description: 'Preparing miyan kuka and tuwo shinkafa with fresh local ingredients. Nothing beats home-cooked meals! 🍲',
    mediaUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 290,
    comments: 38,
    createdAt: '3d ago',
    isLiked: false,
    isFollowing: true,
    authorName: 'Hafsat Bello',
    authorUsername: 'hafsat_b',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Katsina, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_8',
    type: 'posts',
    title: 'Startup Pitch Night',
    description: 'Pitched our digital wallet integration at the regional incubation showcase. Great feedback from mentors and investors! 💡',
    mediaUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 312,
    comments: 27,
    createdAt: '3d ago',
    isLiked: true,
    isFollowing: false,
    authorName: 'Aliyu Mahmud',
    authorUsername: 'aliyu_m',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Kaduna, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_9',
    type: 'posts',
    title: 'Sunset over Zaria Hills',
    description: 'Breathtaking golden hour views during our evening hike. Nature always provides the best calm. 🌄',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 410,
    comments: 52,
    createdAt: '4d ago',
    isLiked: false,
    isFollowing: true,
    authorName: 'Musa Ibrahim',
    authorUsername: 'musa_ib',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Zaria, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_10',
    type: 'posts',
    title: 'Coding Bootcamp Graduation',
    description: 'Proud of our cohort graduating from the full-stack web development program. Ready to build the future! 🎓💻',
    mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 530,
    comments: 64,
    createdAt: '4d ago',
    isLiked: true,
    isFollowing: false,
    authorName: 'Zainab Umar',
    authorUsername: 'zainab_u',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Kaduna, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_11',
    type: 'films',
    title: 'Kaduna Horizon: Feature Film',
    description: 'An exclusive documentary covering digital commerce and creator growth across Northern Nigeria.',
    mediaUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    videoDuration: '1:32:00',
    likes: 856,
    comments: 94,
    createdAt: 'Yesterday',
    isLiked: false,
    isFollowing: true,
    authorName: 'Fatima Ahmed',
    authorUsername: 'fatima_a',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Abuja, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_12',
    type: 'musics',
    title: 'Northern Waves (Acoustic Beats)',
    description: 'Brand new acoustic Afro-fusion single recorded live in studio. Listen with headphones!',
    mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    mediaType: 'audio',
    videoDuration: '3:42',
    likes: 512,
    comments: 63,
    createdAt: '2 days ago',
    isLiked: true,
    isFollowing: false,
    authorName: 'Zainab Umar',
    authorUsername: 'zainab_u',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Zaria, Nigeria',
    commentsList: [],
  },
  {
    id: 'post_13',
    type: 'posts',
    title: 'Community Tech Library Opening',
    description: 'Opening doors to free coding classes and internet access for local youth in Kaduna. Come join us! 📚⚡',
    mediaUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    likes: 345,
    comments: 40,
    createdAt: '5d ago',
    isLiked: false,
    isFollowing: false,
    authorName: 'Amina Bello',
    authorUsername: 'amina_bello',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Kaduna, Nigeria',
    commentsList: [],
  },

  // 15 Reels matching sketch 1791208692547.jpg & 1791208686571.jpg
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `reel_${i + 1}`,
    type: 'reels' as const,
    title: `Creator Reel Highlight #${i + 1}`,
    description: `Catching moments and cinematic clips from daily creators across Kaduna & Zaria #Reel #${i + 1} 🎬🔥`,
    mediaUrl: i % 2 === 0 
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video' as const,
    videoDuration: `0:${30 + (i % 30)}`,
    likes: 120 + i * 15,
    comments: 12 + i * 3,
    createdAt: `${i + 1}h ago`,
    isLiked: i % 2 === 0,
    isFollowing: i % 3 === 0,
    authorName: i % 2 === 0 ? 'Musa Ibrahim' : 'Amina Bello',
    authorUsername: i % 2 === 0 ? 'musa_ib' : 'amina_bello',
    authorAvatar: i % 2 === 0 
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Kaduna, Nigeria',
    commentsList: [],
  })),

  // 10 Feature Films matching sketch 1791208680917.jpg (duration 2:01 hours)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `film_${i + 1}`,
    type: 'films' as const,
    title: `Northern Cinema Epic Feature Film #${i + 1}: Kaduna Horizons`,
    description: `An acclaimed feature-length cinematic masterpiece exploring culture, tech innovation, and rich drama across Northern Nigeria. Full duration 2:01 hours.`,
    mediaUrl: i % 2 === 0
      ? 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video' as const,
    videoDuration: '2:01:00',
    likes: 450 + i * 25,
    comments: 32 + i * 5,
    createdAt: `${i + 1} days ago`,
    isLiked: i % 2 === 0,
    isFollowing: i % 3 === 0,
    authorName: i % 2 === 0 ? 'Fatima Ahmed' : 'Ibrahim Sani',
    authorUsername: i % 2 === 0 ? 'fatima_a' : 'ibrahim_s',
    authorAvatar: i % 2 === 0
      ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Abuja, Nigeria',
    commentsList: [],
  })),

  // 15 Musics matching sketch 1791208674528.jpg
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `music_${i + 1}`,
    type: 'musics' as const,
    title: `Northern Afro-Fusion Beat Track #${i + 1}: Zaria Grooves`,
    description: `Brand new spatial audio acoustic single recorded live in studio. Listen with headphones for full spatial sound experience! 🎧🎵 #${i + 1}`,
    mediaUrl: i % 2 === 0
      ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    mediaType: 'audio' as const,
    videoDuration: `3:${15 + (i % 30)}`,
    likes: 210 + i * 12,
    comments: 18 + i * 2,
    createdAt: `${i + 1} days ago`,
    isLiked: i % 2 === 0,
    isFollowing: i % 3 === 0,
    authorName: i % 2 === 0 ? 'Zainab Umar' : 'Musa Ibrahim',
    authorUsername: i % 2 === 0 ? 'zainab_u' : 'musa_ib',
    authorAvatar: i % 2 === 0
      ? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorLocation: 'Zaria, Nigeria',
    commentsList: [],
  }))
];

interface MediaFeedScreenProps {
  currentUser: UserProfile;
  posts: PostItem[];
  onAddPost: (post: PostItem) => void;
  onViewUserProfile?: (author: { name: string; username: string; avatarUrl: string }) => void;
  onFullScreenChange?: (isFullScreen: boolean) => void;
}

export const MediaFeedScreen: React.FC<MediaFeedScreenProps> = ({
  currentUser,
  posts,
  onAddPost,
  onViewUserProfile,
  onFullScreenChange,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'films' | 'musics'>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(null);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [isFilmFullScreen, setIsFilmFullScreen] = useState(false);

  // Comments Drawer Modal
  const [activeCommentsPost, setActiveCommentsPost] = useState<PostItem | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Notify parent of full screen state (reels, film full screen, or active comments overlay)
  React.useEffect(() => {
    onFullScreenChange?.(Boolean(selectedReelId || isFilmFullScreen || activeCommentsPost));
  }, [selectedReelId, isFilmFullScreen, activeCommentsPost, onFullScreenChange]);

  const [feedPosts, setFeedPosts] = useState<PostItem[]>(() => {
    return posts.length > 0 ? [...posts, ...INITIAL_POPULATED_POSTS] : INITIAL_POPULATED_POSTS;
  });

  // Creation Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'posts' | 'reels' | 'films' | 'musics'>('posts');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createMediaUrl, setCreateMediaUrl] = useState('');
  const [createMediaType, setCreateMediaType] = useState<'image' | 'video' | 'audio' | 'none'>('none');
  const [createDuration, setCreateDuration] = useState('');

  // File Upload Ref
  const filePickerRef = useRef<HTMLInputElement | null>(null);

  // Playing audio / video states
  const [playingMediaId, setPlayingMediaId] = useState<string | null>(null);

  const handleLikeToggle = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  const handleFollowToggle = (authorUsername: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.authorUsername === authorUsername) {
          return { ...p, isFollowing: !p.isFollowing };
        }
        return p;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentsPost || !commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `comm_${Date.now()}`,
      author: currentUser.fullName || 'You',
      avatar: currentUser.avatarUrl || '',
      text: commentInput.trim(),
      time: 'Just now',
    };

    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === activeCommentsPost.id) {
          const updatedComments = [...(p.commentsList || []), newComment];
          const updatedPost = {
            ...p,
            comments: p.comments + 1,
            commentsList: updatedComments,
          };
          setActiveCommentsPost(updatedPost);
          return updatedPost;
        }
        return p;
      })
    );

    setCommentInput('');
  };

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCreateMediaUrl(reader.result);
          if (isVideo) setCreateMediaType('video');
          else if (isAudio) setCreateMediaType('audio');
          else setCreateMediaType('image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createDescription.trim() && !createMediaUrl) return;

    const newPost: PostItem = {
      id: `user_post_${Date.now()}`,
      type: createType,
      title: createTitle.trim() || `${createType.charAt(0).toUpperCase() + createType.slice(1)} Update`,
      description: createDescription.trim(),
      mediaUrl: createMediaUrl,
      mediaType: createMediaType,
      videoDuration: createDuration || (createType === 'films' ? '1:24:00' : createType === 'reels' ? '0:30' : '3:15'),
      likes: 0,
      comments: 0,
      createdAt: 'Just now',
      isLiked: false,
      isFollowing: false,
      authorName: currentUser.fullName || 'Isiyaku Haruna',
      authorUsername: currentUser.username || 'user',
      authorAvatar: currentUser.avatarUrl || '',
      authorLocation: currentUser.currentLocation || currentUser.location || 'Kaduna, Nigeria',
      commentsList: [],
    };

    setFeedPosts([newPost, ...feedPosts]);
    onAddPost(newPost);

    // Reset Form
    setIsCreateModalOpen(false);
    setCreateTitle('');
    setCreateDescription('');
    setCreateMediaUrl('');
    setCreateMediaType('none');
    setCreateDuration('');
  };

  const filteredPosts = feedPosts.filter((p) => {
    const matchesTab = p.type === activeTab;
    if (!searchQuery.trim()) return matchesTab;
    const q = searchQuery.toLowerCase();
    return matchesTab && (
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.authorName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#f0f4f0]/60 text-slate-900 pb-32 overflow-y-auto">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Small Search Bar Row */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-xs mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
            />
          </div>
        </div>

        {/* Full Occupy Screen Header Buttons with Plus button straight after music */}
        <div className="flex items-center justify-between px-3 text-xs sm:text-sm font-bold w-full">
          {(['posts', 'reels', 'films', 'musics'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedReelId(null);
                  setSelectedFilmId(null);
                  setSelectedMusicId(null);
                  setIsFilmFullScreen(false);
                }}
                className={`py-3 px-1 capitalize transition-colors relative flex-1 text-center shrink-0 ${
                  isActive ? 'text-[#2e7d32] font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'musics' ? 'Music' : tab === 'posts' ? 'Post' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-[#2e7d32] rounded-full" />
                )}
              </button>
            );
          })}

          {/* Plus button straight after music */}
          <div className="px-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-8 h-8 rounded-full bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95"
              title="Create Post, Reel, Film or Music"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'musics' && !selectedMusicId ? (
        /* MUSICS GRID LIST VIEW matching sketch 1791208674528.jpg (Left) */
        <div className="p-4 sm:p-6 max-w-xl mx-auto w-full pb-32 space-y-4">
          <div className="text-xs font-bold text-slate-500 px-1">Home &gt; Musics section</div>
          <div className="font-extrabold text-lg text-slate-900 px-1">Musics Grid List</div>
          
          <div className="space-y-3">
            {filteredPosts.map((music) => (
              <div
                key={music.id}
                onClick={() => setSelectedMusicId(music.id)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                {/* Music Thumbnail / Note Box */}
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Music className="w-6 h-6" />
                </div>

                {/* Title & Artist lines */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">{music.title}</h4>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{music.authorName} • {music.videoDuration}</p>
                </div>

                {/* Three dots menu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Music options');
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'musics' && selectedMusicId ? (
        /* MUSICS PLAYER FULL SCREEN VIEW matching sketch 1791208674528.jpg (Right) */
        (() => {
          const music = feedPosts.find(p => p.id === selectedMusicId) || filteredPosts[0];
          return (
            <div className="p-4 sm:p-6 max-w-xl mx-auto w-full pb-32 space-y-6">
              {/* Back Header */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMusicId(null)}
                  className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 font-bold text-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Home &gt; Musics</span>
                </button>
              </div>

              <div className="text-center font-extrabold text-lg text-slate-900">Musics Player Full Screen</div>

              {/* Large Album Art Center Square */}
              <div className="aspect-square w-64 sm:w-72 rounded-3xl overflow-hidden bg-slate-950 shadow-2xl mx-auto relative group">
                <img
                  src={music.mediaUrl}
                  alt={music.title}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
                    <Music className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Title & Artist */}
              <div className="text-center space-y-1">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{music.title}</h2>
                <h3 className="text-sm font-bold text-emerald-700">{music.authorName}</h3>
              </div>

              {/* Scrubber / Progress Bar */}
              <div className="space-y-2 px-2">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2e7d32] h-full w-1/3 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
                  <span>0:00</span>
                  <span>{music.videoDuration || '3:45'}</span>
                </div>
              </div>

              {/* Playback Control Buttons matching sketch: Pause, Play, Pause, Like, Share */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={() => alert('Previous track')}
                  className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-transform active:scale-95"
                >
                  <Pause className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => alert('Play / Pause')}
                  className="w-16 h-16 rounded-full bg-[#2e7d32] hover:bg-[#256829] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  <Play className="w-7 h-7 ml-0.5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={() => alert('Next track')}
                  className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-transform active:scale-95"
                >
                  <Pause className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLikeToggle(music.id)}
                  className={`w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center transition-transform active:scale-125 ${
                    music.isLiked ? 'text-red-500' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${music.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Music link copied!');
                  }}
                  className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-transform active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })()
      ) : activeTab === 'reels' && !selectedReelId ? (
        /* REELS GRID VIEW matching sketch 1791208692547.jpg */
        <div className="p-4 grid grid-cols-2 gap-3.5 max-w-xl mx-auto w-full pb-32">
          {filteredPosts.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setSelectedReelId(reel.id)}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 shadow-md cursor-pointer group hover:scale-[1.02] transition-transform"
            >
              <img
                src={reel.mediaUrl}
                alt={reel.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                  <Play className="w-6 h-6 ml-0.5 fill-white" />
                </div>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2 bg-black/65 backdrop-blur-md px-2.5 py-2 rounded-xl text-white">
                {reel.authorAvatar ? (
                  <img src={reel.authorAvatar} alt={reel.authorName} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {reel.authorName.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-bold truncate flex-1">{reel.authorName}</span>
                <span className="text-[10px] text-slate-300 font-mono">{reel.videoDuration}</span>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'reels' && selectedReelId ? (
        /* FULL-SCREEN REELS VIEWER matching sketch 1791208686571.jpg */
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
          {/* Header */}
          <div className="px-5 py-3.5 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center gap-3 z-20">
            <button
              onClick={() => setSelectedReelId(null)}
              className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-sm font-bold">Home &gt; Reels</span>
            </button>
          </div>

          {/* Vertical Scrollable Reels Feed */}
          <div className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-none flex flex-col items-center">
            {filteredPosts.map((reel) => (
              <div
                key={reel.id}
                className="w-full max-w-md h-full min-h-[calc(100vh-64px)] snap-start relative flex flex-col justify-end p-5 bg-slate-950 overflow-hidden"
              >
                <img
                  src={reel.mediaUrl}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </div>
                </div>

                {/* Right Sidebar Actions */}
                <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6 z-10">
                  <div className="relative">
                    {reel.authorAvatar ? (
                      <img src={reel.authorAvatar} alt={reel.authorName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                        {reel.authorName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleLikeToggle(reel.id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform active:scale-125 ${reel.isLiked ? 'text-red-500' : 'text-white'}`}>
                      <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </div>
                    <span className="text-xs font-bold text-white shadow-sm">{reel.likes}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentsPost(reel)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white shadow-sm">{reel.comments}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Reel link copied!');
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white">Share</span>
                  </button>
                </div>

                {/* Bottom Author & Caption Info */}
                <div className="relative z-10 pb-6 pr-16 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white">{reel.authorName}</h4>
                    <span className="text-xs text-emerald-400 font-semibold">• {reel.createdAt}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">
                    {reel.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'films' && !selectedFilmId ? (
        /* FILMS GRID VIEW matching YouTube feed in Screenshot_2026-10-05-15-57-16-18.jpg */
        <div className="p-4 sm:p-6 space-y-6 max-w-xl mx-auto w-full pb-32">
          {filteredPosts.map((film) => (
            <div
              key={film.id}
              onClick={() => setSelectedFilmId(film.id)}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-all"
            >
              {/* Landscape Thumbnail Video Banner */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={film.mediaUrl}
                  alt={film.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow-xl">
                    <Play className="w-7 h-7 ml-0.5 fill-current" />
                  </div>
                </div>
                {/* Duration Timestamp Badge at bottom-right */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white font-mono text-xs px-2.5 py-1 rounded-lg backdrop-blur-md">
                  {film.videoDuration}
                </div>
              </div>

              {/* YouTube-style Metadata Row */}
              <div className="p-4 flex items-start gap-3.5">
                {/* Channel Avatar */}
                {film.authorAvatar ? (
                  <img
                    src={film.authorAvatar}
                    alt={film.authorName}
                    className="w-10 h-10 rounded-full object-cover border shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
                    {film.authorName.charAt(0)}
                  </div>
                )}

                {/* Title & Channel Subtitle */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug">
                    {film.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>{film.authorName}</span>
                    <span>•</span>
                    <span>{(film.likes * 32).toLocaleString()} views</span>
                    <span>•</span>
                    <span>{film.createdAt}</span>
                  </div>
                </div>

                {/* Three dots menu icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('More options');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full transition-colors shrink-0"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'films' && selectedFilmId && !isFilmFullScreen ? (
        /* FILMS WATCH PAGE matching YouTube style & sketch 1791208680917.jpg (Right) */
        (() => {
          const film = feedPosts.find(p => p.id === selectedFilmId) || filteredPosts[0];
          return (
            <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full pb-32 space-y-5">
              {/* Back Header */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFilmId(null)}
                  className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 font-bold text-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Home</span>
                </button>
              </div>

              {/* Enlarged Large Landscape Video Player */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-2xl group">
                <img
                  src={film.mediaUrl}
                  alt={film.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button
                    onClick={() => setIsFilmFullScreen(true)}
                    className="w-20 h-20 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Play className="w-10 h-10 ml-1 fill-current" />
                  </button>
                </div>
                {/* Duration & Rotate Button */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white font-mono">
                  <span className="bg-black/65 px-3 py-1.5 rounded-xl backdrop-blur-md font-bold">Duration: {film.videoDuration}</span>
                  <button
                    onClick={() => setIsFilmFullScreen(true)}
                    className="px-3.5 py-1.5 bg-black/75 hover:bg-black/90 rounded-xl backdrop-blur-md text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Rotate / Fullscreen ⤢</span>
                  </button>
                </div>
              </div>

              {/* Title & YouTube-style Watches / Views Header */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">{film.title}</h1>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-500">
                  <span className="text-emerald-700 font-bold">{(film.likes * 32).toLocaleString()} watches</span>
                  <span>•</span>
                  <span>{film.createdAt}</span>
                  <span>•</span>
                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs">Official Film</span>
                </div>
              </div>

              {/* Author & Follow Row */}
              <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3.5">
                  {film.authorAvatar ? (
                    <img src={film.authorAvatar} alt={film.authorName} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-base">
                      {film.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{film.authorName}</h4>
                    <span className="text-xs font-medium text-slate-500">{film.authorLocation || 'Abuja, Nigeria'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleFollowToggle(film.authorUsername)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    film.isFollowing ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#2e7d32] text-white hover:bg-[#256829]'
                  }`}
                >
                  {film.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* Action Buttons Bar: Likes, Share, Bookmark */}
              <div className="flex items-center justify-around bg-white p-4 rounded-3xl border border-slate-200 shadow-xs text-xs sm:text-sm font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => handleLikeToggle(film.id)}
                  className={`flex items-center gap-2 transition-transform active:scale-125 ${film.isLiked ? 'text-red-500 font-extrabold' : 'hover:text-slate-900'}`}
                >
                  <Heart className={`w-5 h-5 ${film.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{film.likes} Likes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Film link copied!');
                  }}
                  className="flex items-center gap-2 hover:text-slate-900"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Film saved to watchlist!')}
                  className="flex items-center gap-2 hover:text-slate-900"
                >
                  <Bookmark className="w-5 h-5" />
                  <span>Save</span>
                </button>
              </div>

              {/* Description / Synopsis */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Description & Synopsis</h3>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                  {film.description}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">#NorthernCinema</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">#FeatureFilm</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">#2HoursEpic</span>
                </div>
              </div>

              {/* Full Comments Section */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <span>Comments ({film.comments})</span>
                  </h3>
                </div>

                {/* Comment Input Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!commentInput.trim()) return;
                    const newComment = {
                      id: `comm_${Date.now()}`,
                      author: currentUser.fullName || 'You',
                      avatar: currentUser.avatarUrl || '',
                      text: commentInput.trim(),
                      time: 'Just now',
                    };
                    setFeedPosts((prev) =>
                      prev.map((p) => {
                        if (p.id === film.id) {
                          return {
                            ...p,
                            comments: p.comments + 1,
                            commentsList: [...(p.commentsList || []), newComment],
                          };
                        }
                        return p;
                      })
                    );
                    setCommentInput('');
                  }} 
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add a comment on this film..."
                    className="flex-1 h-11 px-4 bg-slate-100 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
                  />
                  <button
                    type="submit"
                    className="h-11 px-5 bg-[#2e7d32] text-white rounded-2xl text-xs sm:text-sm font-bold hover:bg-[#256829] shrink-0"
                  >
                    Post
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-3.5 pt-2">
                  {film.commentsList && film.commentsList.length > 0 ? (
                    film.commentsList.map((comm) => (
                      <div key={comm.id} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        {comm.avatar ? (
                          <img src={comm.avatar} alt={comm.author} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {comm.author.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900">{comm.author}</span>
                            <span className="text-[10px] text-slate-400">{comm.time}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 mt-1 break-words">{comm.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs sm:text-sm italic">
                      No comments yet. Be the first to share your thoughts on this film!
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      ) : activeTab === 'films' && isFilmFullScreen ? (
        /* FILMS FULL SCREEN ROTATE VIEW (Empty buttons except back button) */
        (() => {
          const film = feedPosts.find(p => p.id === selectedFilmId) || filteredPosts[0];
          return (
            <div className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center p-0">
              {/* Only back button in empty buttons view */}
              <div className="absolute top-4 left-4 z-20">
                <button
                  onClick={() => setIsFilmFullScreen(false)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Film Watch</span>
                </button>
              </div>

              <div className="w-full h-full relative flex items-center justify-center">
                <img
                  src={film.mediaUrl}
                  alt={film.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
                    <Play className="w-10 h-10 ml-1 fill-white" />
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* STANDARD FEED (Posts, Musics) */
        <div className="p-4 sm:p-6 space-y-6 max-w-xl mx-auto w-full pb-32">
          {filteredPosts.map((post) => (
          <div 
            key={post.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Author Header Row: Avatar, Name, Location, Timestamp, Follow button */}
            <div className="p-4 sm:p-5 pb-3.5 flex items-center justify-between">
              <div 
                onClick={() => onViewUserProfile?.({
                  name: post.authorName,
                  username: post.authorUsername,
                  avatarUrl: post.authorAvatar,
                })}
                className="flex items-center gap-3.5 cursor-pointer"
              >
                {post.authorAvatar ? (
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-emerald-100 shadow-xs"
                  />
                ) : (
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                    {post.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight hover:underline">
                    {post.authorName}
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                    {post.createdAt} {post.authorLocation && `• ${post.authorLocation}`}
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              {post.authorUsername !== currentUser.username && (
                <button
                  type="button"
                  onClick={() => handleFollowToggle(post.authorUsername)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    post.isFollowing
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-[#2e7d32] hover:bg-[#256829] text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {post.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Post Description (Above image / video Facebook style as requested) */}
            {post.description && (
              <div className="px-4 sm:px-5 pb-4 text-sm sm:text-base text-slate-800 leading-relaxed break-words font-normal">
                {post.description}
              </div>
            )}

            {/* Media Content Body */}
            {post.type === 'reels' ? (
              /* REEL CARD matching sketch */
              <div className="relative w-full aspect-[4/5] sm:aspect-[9/16] max-h-[640px] bg-slate-950 overflow-hidden group">
                <img
                  src={post.mediaUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Reel Play Button Overlay */}
                <div 
                  onClick={() => setPlayingMediaId(playingMediaId === post.id ? null : post.id)}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer"
                >
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/35 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-2xl">
                    {playingMediaId === post.id ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </div>
                </div>

                {/* Reel Badge */}
                <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm font-bold rounded-full flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Reel</span>
                  {post.videoDuration && <span className="opacity-80">• {post.videoDuration}</span>}
                </div>
              </div>
            ) : post.type === 'films' ? (
              /* FILM CARD matching sketch (Films resterampte lou filme) */
              <div className="p-4 sm:p-5 bg-slate-900 text-white space-y-4">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-800 group shadow-lg">
                  <img
                    src={post.mediaUrl || 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    onClick={() => setPlayingMediaId(playingMediaId === post.id ? null : post.id)}
                    className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform">
                      {playingMediaId === post.id ? <Pause className="w-7 h-7 sm:w-8 sm:h-8" /> : <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" />}
                    </div>
                  </div>
                  <div className="absolute top-3.5 left-3.5 px-3 py-1.5 bg-black/75 backdrop-blur-md rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-emerald-400" />
                    <span>Feature Film</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-mono">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>{post.videoDuration || '1:32:00'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlayingMediaId(post.id)}
                    className="px-6 py-2.5 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Now</span>
                  </button>
                </div>
              </div>
            ) : post.type === 'musics' ? (
              /* MUSIC AUDIO CARD */
              <div className="p-5 bg-emerald-950 text-white rounded-2xl mx-4 sm:mx-5 mb-4 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-800 flex items-center justify-center text-white shadow-lg">
                      <Music className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg text-white">{post.title}</h4>
                      <p className="text-xs sm:text-sm text-emerald-300 font-medium">{post.authorName} • Audio Track</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPlayingMediaId(playingMediaId === post.id ? null : post.id)}
                    className="w-13 h-13 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    {playingMediaId === post.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-emerald-300 tracking-widest pt-1">
                  <span className="text-emerald-400 font-bold">ılılılllıılılıllllıılılılllıı</span>
                  <span className="text-xs ml-auto font-sans text-emerald-200">{post.videoDuration || '3:45'}</span>
                </div>
              </div>
            ) : (
              /* STANDARD PHOTO / POST CARD */
              post.mediaUrl && (
                <div className="w-full max-h-[560px] sm:max-h-[620px] bg-slate-100 overflow-hidden">
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}

            {/* Bottom Action Bar: Like ❤️, Comment 💬, Share 🔗 */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-sm sm:text-base font-bold text-slate-600">
              <div className="flex items-center gap-8">
                
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => handleLikeToggle(post.id)}
                  className={`flex items-center gap-2 transition-transform active:scale-125 ${
                    post.isLiked ? 'text-red-500 font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-sm sm:text-base">{post.likes}</span>
                </button>

                {/* Comment Button */}
                <button
                  type="button"
                  onClick={() => setActiveCommentsPost(post)}
                  className="flex items-center gap-2 hover:text-slate-900"
                >
                  <MessageCircle className="w-6 h-6 stroke-[1.85]" />
                  <span className="text-sm sm:text-base">{post.comments}</span>
                </button>
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Post link copied to clipboard!');
                }}
                className="flex items-center gap-2 hover:text-slate-900"
              >
                <Share2 className="w-6 h-6 stroke-[1.85]" />
                <span className="text-sm sm:text-base">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Creation Modal / Page (Post, Reels, Films, Musics from device) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-white min-h-screen flex flex-col overflow-y-auto animate-in slide-in-from-bottom-2">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10 shadow-xs">
            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 -ml-2 text-slate-700">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="font-bold text-slate-900 text-base">Create & Publish Media</h2>
            <div className="w-6" />
          </div>

          <form onSubmit={handlePublishPost} className="p-5 max-w-lg mx-auto w-full space-y-5 pb-28">
            
            {/* Media Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Content Format</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'posts', label: 'Post', icon: FileText },
                  { id: 'reels', label: 'Reel', icon: Video },
                  { id: 'films', label: 'Film', icon: Film },
                  { id: 'musics', label: 'Music', icon: Music },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = createType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCreateType(item.id as any)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title / Subject</label>
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="e.g. Kaduna Highlights, New Song Release..."
                className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-sm font-semibold"
              />
            </div>

            {/* Description Text (Facebook Style Above Image/Video) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Story / Description</label>
              <textarea
                rows={4}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Write your story, caption or message here. This will display above your photo or video..."
                className="w-full p-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:border-slate-900 text-sm leading-relaxed"
                required
              />
            </div>

            {/* Device Media Upload (Images, Videos, or Audio) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Attach Media from Your Device</label>
              
              <div 
                onClick={() => filePickerRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors p-4 text-center group"
              >
                {createMediaUrl ? (
                  <div className="relative w-full max-h-56 rounded-2xl overflow-hidden">
                    {createMediaType === 'video' ? (
                      <div className="w-full h-40 bg-slate-900 flex items-center justify-center text-white gap-2 font-bold text-xs">
                        <Video className="w-6 h-6 text-emerald-400" />
                        <span>Video file selected from device</span>
                      </div>
                    ) : createMediaType === 'audio' ? (
                      <div className="w-full h-32 bg-emerald-950 flex items-center justify-center text-white gap-2 font-bold text-xs">
                        <Music className="w-6 h-6 text-emerald-400" />
                        <span>Audio file selected from device</span>
                      </div>
                    ) : (
                      <img src={createMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateMediaUrl('');
                        setCreateMediaType('none');
                      }}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-emerald-700 mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">Choose Image, Video or Audio</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Upload photos, reels, or music directly from your phone</span>
                  </>
                )}
              </div>

              <input
                ref={filePickerRef}
                type="file"
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={handleDeviceFileUpload}
              />
            </div>

            {/* Optional Duration (for Films/Reels/Music) */}
            {(createType === 'films' || createType === 'reels' || createType === 'musics') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Optional)</label>
                <input
                  type="text"
                  value={createDuration}
                  onChange={(e) => setCreateDuration(e.target.value)}
                  placeholder={createType === 'films' ? 'e.g. 1:32:00' : createType === 'reels' ? '0:45' : '3:45'}
                  className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-xs font-medium"
                />
              </div>
            )}

            {/* Submit Post */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Publish to Media Feed</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments Drawer Modal */}
      {activeCommentsPost && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          onClick={() => setActiveCommentsPost(null)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[80vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Comments ({activeCommentsPost.commentsList?.length || 0})</h3>
                <p className="text-[11px] text-slate-400">On {activeCommentsPost.authorName}'s post</p>
              </div>
              <button onClick={() => setActiveCommentsPost(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[160px]">
              {activeCommentsPost.commentsList && activeCommentsPost.commentsList.length > 0 ? (
                activeCommentsPost.commentsList.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                    <img src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={c.author} className="w-8 h-8 rounded-full object-cover mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{c.author}</span>
                        <span className="text-[10px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed break-words">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No comments yet. Be the first to start the conversation!
                </div>
              )}
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 h-11 px-4 text-xs bg-slate-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2e7d32]/20 border border-transparent focus:border-[#2e7d32]"
                autoFocus
              />
              <button
                type="submit"
                className="w-11 h-11 bg-[#2e7d32] text-white rounded-full flex items-center justify-center hover:bg-[#256829] shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export type AuthScreen = 
  | 'signup' 
  | 'login' 
  | 'otp' 
  | 'set-password' 
  | 'forgot-password' 
  | 'profile-setup'
  | 'dashboard'
  | 'admin';

export type OtpDestination = 'phone' | 'email';

export type DashboardTab = 'home' | 'chat' | 'payment' | 'market' | 'profile' | 'ai';

export type ContentTab = 'all' | 'posts' | 'reels' | 'films' | 'musics' | 'products';

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface PostItem {
  id: string;
  type: 'posts' | 'reels' | 'films' | 'musics' | 'products';
  title: string;
  description: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'none';
  videoDuration?: string;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
  isFollowing?: boolean;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorLocation?: string;
  commentsList?: CommentItem[];
}

export interface SocialLinkItem {
  platformId: string;
  platformName: string;
  username: string;
  linkUrl: string;
  contentBio: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  bio: string;
  
  // About & Personal details
  hobby: string;
  country: string;
  currentLocation: string;
  location: string;
  lifeStatus: string;
  travel: string;
  experience: string;
  school: string;
  occupation: string;
  
  // Contact & Social
  socialHandle: string;
  socialLinks?: SocialLinkItem[];
  publicPhone: string;
  monetization: 'Free Account' | 'Monetized Creator' | 'Pro Business';
  website: string;
  
  // Legacy / setup fields
  currency?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  transactionPinSet?: boolean;

  // Stats (swipeable stats counter with 👁️ watches / views)
  postsCount: number;
  followersCount: number;
  followingCount: number;
  watchesCount: number;

  // Verification & Wallet
  isProfileCompleted?: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  walletBalance: number;
  virtualCard: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    isFrozen: boolean;
    cardType: 'visa' | 'mastercard';
  };
}

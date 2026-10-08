import React, { useState } from 'react';
import { 
  Home, 
  MessageSquare, 
  CreditCard, 
  Store, 
  User, 
  Sparkles, 
  Search, 
  Bell, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Plus, 
  ShoppingBag,
  TrendingUp,
  Heart,
  MessageCircle,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Wallet,
  Phone,
  Wifi,
  History,
  Plane,
  Building2,
  X,
  Sun,
  Zap,
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Minus
} from 'lucide-react';
import { UserProfile, DashboardTab, PostItem } from '../types';
import { BottomNavBar } from './BottomNavBar';
import { ProfileView } from './ProfileView';
import { ChatScreen, ChatFriend } from './ChatScreen';
import { MediaFeedScreen } from './MediaFeedScreen';
import { SettingsModal } from './SettingsModal';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { profileCloudService } from '../services/profileCloudService';

// 15 Apps matching sketch 1791208668336.jpg
const MOCK_APPS = [
  { id: 'app_1', name: 'I-Pay POS Terminal', platform: 'Android | iPhone', rating: '4.8', price: 'Free', icon: '📱' },
  { id: 'app_2', name: 'Kaduna Chat Messenger', platform: 'Android | iPhone', rating: '4.7', price: 'Free', icon: '💬' },
  { id: 'app_3', name: 'Afritune Beats Stream', platform: 'Android | iPhone', rating: '4.9', price: '$2.99', icon: '🎵' },
  { id: 'app_4', name: 'Zaria Code IDE Studio', platform: 'Android', rating: '4.6', price: '$4.99', icon: '💻' },
  { id: 'app_5', name: 'Hausa Learning Companion', platform: 'Android | iPhone', rating: '4.9', price: 'Free', icon: '📚' },
  { id: 'app_6', name: 'Northern Trade Marketplace', platform: 'Android | iPhone', rating: '4.5', price: 'Free', icon: '🛍️' },
  { id: 'app_7', name: 'Arewa Preset Photo Editor', platform: 'Android | iPhone', rating: '4.8', price: '$1.99', icon: '📸' },
  { id: 'app_8', name: 'Swift Express Delivery', platform: 'Android | iPhone', rating: '4.4', price: 'Free', icon: '🚀' },
  { id: 'app_9', name: 'Kano Commodity Tracker', platform: 'Android', rating: '4.6', price: 'Free', icon: '📈' },
  { id: 'app_10', name: 'Naira Budget & Expense', platform: 'Android | iPhone', rating: '4.7', price: '$0.99', icon: '💰' },
  { id: 'app_11', name: 'Sokoto Solar Utility', platform: 'Android | iPhone', rating: '4.5', price: 'Free', icon: '☀️' },
  { id: 'app_12', name: 'Borno AgriTech Hub', platform: 'Android', rating: '4.6', price: 'Free', icon: '🌾' },
  { id: 'app_13', name: 'Abuja Real Estate Finder', platform: 'Android | iPhone', rating: '4.8', price: 'Free', icon: '🏠' },
  { id: 'app_14', name: 'Jos Cargo Logistics', platform: 'Android | iPhone', rating: '4.3', price: 'Free', icon: '📦' },
  { id: 'app_15', name: 'Katsina TeleHealth Doctor', platform: 'Android | iPhone', rating: '4.9', price: 'Free', icon: '🏥' },
];

// 100 Products including Fans, Plates, Kitchenware, Northern Crafts, Tech, Appliances & Digital Goods
const MOCK_PRODUCTS = [
  // 1-12: Fans & Cooling Solutions
  { id: 'prod_1', title: 'Ox 18" Rechargeable Standing Fan with Remote', category: 'Fans & Cooling', price: '₦ 38,500', numPrice: 38500, image: 'https://images.unsplash.com/photo-1618941709600-94ac0b69fc50?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_2', title: 'Solar Powered Dual Blade Standing Fan', category: 'Fans & Cooling', price: '₦ 45,000', numPrice: 45000, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_3', title: 'Industrial 56" High Speed Ceiling Fan', category: 'Fans & Cooling', price: '₦ 28,000', numPrice: 28000, image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_4', title: 'Mini USB Desktop Cooling Fan', category: 'Fans & Cooling', price: '₦ 6,500', numPrice: 6500, image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_5', title: 'Portable Rechargeable Handheld Turbo Fan', category: 'Fans & Cooling', price: '₦ 4,200', numPrice: 4200, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_6', title: 'Bladeless Quiet Tower Air Fan', category: 'Fans & Cooling', price: '₦ 65,000', numPrice: 65000, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_7', title: 'Outdoor Water Misting Fan 20"', category: 'Fans & Cooling', price: '₦ 52,000', numPrice: 52000, image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_8', title: 'Smart Oscillation Wall Mounted Fan', category: 'Fans & Cooling', price: '₦ 32,000', numPrice: 32000, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_9', title: 'Dual Head 12V Car Dashboard Cooling Fan', category: 'Fans & Cooling', price: '₦ 8,500', numPrice: 8500, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_10', title: 'Heavy Duty Metal Floor Orbit Fan', category: 'Fans & Cooling', price: '₦ 42,000', numPrice: 42000, image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_11', title: 'Silent Bedroom Clip-on Fan 8"', category: 'Fans & Cooling', price: '₦ 7,800', numPrice: 7800, image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_12', title: 'Solar Attic Exhaust Vent Fan', category: 'Fans & Cooling', price: '₦ 38,000', numPrice: 38000, image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&auto=format&fit=crop&q=80' },

  // 13-28: Plates, Bowls & Dining Ware
  { id: 'prod_13', title: 'Luxury Gold Edge Ceramic Dinner Plate Set (6pcs)', category: 'Plates & Dining', price: '₦ 24,000', numPrice: 24000, image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_14', title: 'Royal White Porcelain Rice Plates (4pcs)', category: 'Plates & Dining', price: '₦ 18,500', numPrice: 18500, image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_15', title: 'Unbreakable Melamine Dinner Plate Pack (12pcs)', category: 'Plates & Dining', price: '₦ 15,000', numPrice: 15000, image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_16', title: 'Stainless Steel Serving Tray & Plate Set', category: 'Plates & Dining', price: '₦ 16,500', numPrice: 16500, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_17', title: 'Nordic Deep Soup Bowls Set (6pcs)', category: 'Plates & Dining', price: '₦ 14,000', numPrice: 14000, image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_18', title: 'Glass Fruit & Salad Plate Set', category: 'Plates & Dining', price: '₦ 12,800', numPrice: 12800, image: 'https://images.unsplash.com/photo-1590595906931-81f04f0cce35?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_19', title: 'Non-stick Granite Cookware Pots Set (10pcs)', category: 'Cookware', price: '₦ 55,000', numPrice: 55000, image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_20', title: 'Electric Smart Pressure Cooker 6L', category: 'Appliances', price: '₦ 48,000', numPrice: 48000, image: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_21', title: 'Thermal Stainless Steel Water Flask 3L', category: 'Kitchenware', price: '₦ 16,000', numPrice: 16000, image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_22', title: 'Traditional Northern Clay Cooking Pot', category: 'Handicrafts', price: '₦ 9,500', numPrice: 9500, image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_23', title: 'Handcarved Wooden Salad Bowl Set', category: 'Kitchenware', price: '₦ 13,500', numPrice: 13500, image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_24', title: 'Golden Cutlery Spoon & Fork Set (24pcs)', category: 'Kitchenware', price: '₦ 19,000', numPrice: 19000, image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_25', title: 'Glass Juice Tumbler Set with Straw (6pcs)', category: 'Kitchenware', price: '₦ 11,000', numPrice: 11000, image: 'https://images.unsplash.com/photo-1590595906931-81f04f0cce35?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_26', title: 'Electric Food Blender & Smoothie Maker 1.5L', category: 'Appliances', price: '₦ 22,500', numPrice: 22500, image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_27', title: 'Automatic Bread Toaster 2-Slice', category: 'Appliances', price: '₦ 14,500', numPrice: 14500, image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&auto=format&fit=crop&q=80' },
  { id: 'prod_28', title: 'Ceramic Tea Pot & Cup Gift Set', category: 'Kitchenware', price: '₦ 21,000', numPrice: 21000, image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&auto=format&fit=crop&q=80' },

  // 29-100: Digital Products, Northern Crafts, Electronics & Fashion
  ...Array.from({ length: 72 }, (_, i) => {
    const idx = i + 29;
    const baseTemplates = [
      { name: 'Rechargeable Solar Standing Fan 16"', cat: 'Fans & Cooling', p: 34000, img: 'https://images.unsplash.com/photo-1618941709600-94ac0b69fc50?w=400&auto=format&fit=crop&q=80' },
      { name: 'Ceramic Floral Dinner Plate Set (8pcs)', cat: 'Plates & Dining', p: 26500, img: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400&auto=format&fit=crop&q=80' },
      { name: 'Digital Creator Presets Pack', cat: 'Digital Goods', p: 12500, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
      { name: 'Social Media Graphic Kit', cat: 'Digital Templates', p: 8000, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80' },
      { name: 'Handmade Northern Leather Bag', cat: 'Physical Crafts', p: 35000, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80' },
      { name: 'Traditional Embroidered Cap Set', cat: 'Apparel', p: 14000, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80' },
      { name: 'Smart Fitness Tracker Band', cat: 'Electronics', p: 22000, img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&auto=format&fit=crop&q=80' },
      { name: 'Wireless Noise Cancel Earbuds', cat: 'Audio Gear', p: 28000, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80' },
      { name: 'Portable Solar Power Bank 20k', cat: 'Gadgets', p: 19500, img: 'https://images.unsplash.com/photo-1609592424009-dd27902d1a3c?w=400&auto=format&fit=crop&q=80' },
      { name: 'Professional Podcast Mic Kit', cat: 'Creator Hardware', p: 42000, img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80' },
      { name: 'Full HD WebCam Pro 1080p', cat: 'Video Hardware', p: 16000, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80' },
      { name: 'LED Studio Ring Light Setup', cat: 'Lighting', p: 24000, img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&auto=format&fit=crop&q=80' },
    ];
    const t = baseTemplates[i % baseTemplates.length];
    return {
      id: `prod_${idx}`,
      title: `${t.name} #${idx}`,
      category: t.cat,
      price: `₦ ${(t.p + (i * 200)).toLocaleString()}`,
      numPrice: t.p + (i * 200),
      image: t.img,
    };
  })
];

// 15 Books matching sketch 1791208668336.jpg
const MOCK_BOOKS = [
  { id: 'book_1', title: 'The Northern Creator Guide', author: 'Amina Bello', price: '₦ 3,500', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_2', title: 'Fintech Revolution in Africa', author: 'Isiyaku Haruna', price: '₦ 4,500', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_3', title: 'Secrets of Digital Commerce', author: 'Kabiru Sani', price: '₦ 2,800', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_4', title: 'Hausa Literature Anthology', author: 'Fatima Ahmed', price: '₦ 3,200', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_5', title: 'Coding for Young Innovators', author: 'Musa Ibrahim', price: '₦ 5,000', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_6', title: 'History of Ancient Zaria City', author: 'Dr. Usman Danfodio', price: '₦ 4,000', image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_7', title: 'Modern Mobile UI/UX Design', author: 'Zainab Umar', price: '₦ 6,000', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_8', title: 'Entrepreneurship Playbook 2026', author: 'Ibrahim Sani', price: '₦ 3,800', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_9', title: 'Acoustic Rhythms & Poetry', author: 'Hafsat Bello', price: '₦ 2,500', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_10', title: 'Solar Energy for Beginners', author: 'Aliyu Mahmud', price: '₦ 4,200', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_11', title: 'Financial Freedom with I-Pay', author: 'Sani Abba', price: '₦ 3,000', image: 'https://images.unsplash.com/photo-1510172951991-856a654063f9?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_12', title: 'The Art of Visual Storytelling', author: 'Balarabe Musa', price: '₦ 4,800', image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_13', title: 'Northern Nigerian Culinary Delights', author: 'Hadiza Umar', price: '₦ 3,600', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_14', title: 'AgriTech Transformation', author: 'Nura Mohammad', price: '₦ 5,200', image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&auto=format&fit=crop&q=80' },
  { id: 'book_15', title: 'Mindset of African Tech Leaders', author: 'Suleiman Isa', price: '₦ 4,600', image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80' },
];

interface DashboardScreenProps {
  user: UserProfile;
  posts: PostItem[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onAddPost: (post: PostItem) => void;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  posts,
  onUpdateUser,
  onAddPost,
  onLogout,
}) => {
  // Default landing opens on Home after sign in
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [isInsideActiveChat, setIsInsideActiveChat] = useState(false);
  const [isChatStatusFullScreen, setIsChatStatusFullScreen] = useState(false);
  const [isMediaFullScreen, setIsMediaFullScreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Visitor profile state
  const [visitorProfile, setVisitorProfile] = useState<UserProfile | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  // Payment states
  const [showCvv, setShowCvv] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(user.virtualCard.isFrozen);
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [showSendSuccess, setShowSendSuccess] = useState(false);

  // Payment Board States
  const [activePaymentModal, setActivePaymentModal] = useState<'fund' | 'send' | 'solar' | 'electric' | 'airtime' | 'data' | 'history' | 'flight' | 'hotel' | 'card' | null>(null);
  const [accountNumberCopied, setAccountNumberCopied] = useState(false);
  
  // Airtime/Data modal form state
  const [airtimeNetwork, setAirtimeNetwork] = useState('MTN');
  const [airtimePhone, setAirtimePhone] = useState(user.phoneNumber || '08031234567');
  const [airtimeAmount, setAirtimeAmount] = useState('1000');
  const [selectedDataPlan, setSelectedDataPlan] = useState('3.5GB Monthly - ₦2,000');
  
  // Flight modal form state
  const [flightFrom, setFlightFrom] = useState('Abuja (ABV)');
  const [flightTo, setFlightTo] = useState('Lagos (LOS)');
  const [flightDate, setFlightDate] = useState('2026-10-10');
  
  // Hotel modal form state
  const [hotelCity, setHotelCity] = useState('Kaduna');
  const [hotelCheckIn, setHotelCheckIn] = useState('2026-10-12');

  // Transactions History
  const [transactionHistory, setTransactionsHistory] = useState([
    { id: 'tx_1', type: 'Airtime Purchase', detail: 'MTN ₦1,000 to 08031234567', amount: '₦ 1,000.00', date: 'Today, 2:15 PM', status: 'Successful', icon: '📱' },
    { id: 'tx_2', type: 'Data Bundle', detail: 'Airtel 3.5GB Monthly', amount: '₦ 2,000.00', date: 'Yesterday, 6:40 PM', status: 'Successful', icon: '📶' },
    { id: 'tx_3', type: 'Wallet Funding', detail: 'Bank Transfer via Microfinance', amount: '+ ₦ 50,000.00', date: '03 Oct, 2026', status: 'Successful', icon: '💰' },
    { id: 'tx_4', type: 'Flight Booking', detail: 'Air Peace ABV -> LOS', amount: '₦ 85,000.00', date: '01 Oct, 2026', status: 'Successful', icon: '✈️' },
  ]);

  // Market Tab States matching sketch 1791208668336.jpg
  const [marketTab, setMarketTab] = useState<'apps' | 'products' | 'books'>('apps');
  const [appsFilter, setAppsFilter] = useState<'all' | 'android' | 'iphone'>('all');

  // Shopping Cart States
  const [cartItems, setCartItems] = useState<Array<{ id: string; title: string; price: string; numPrice: number; image: string; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (prod: typeof MOCK_PRODUCTS[0]) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === prod.id);
      if (existing) {
        return prev.map(item => item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: prod.id, title: prod.title, price: prod.price, numPrice: prod.numPrice || 15000, image: prod.image, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as typeof prev);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.numPrice * item.quantity), 0);

  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponses, setAiResponses] = useState<Array<{ q: string; a: string }>>([
    { q: 'How do I monetize my creator profile?', a: 'You can enable monetization in your Profile > Edit Profile > Monetization to unlock tips and digital product sales on I-pay.' },
  ]);

  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(sendAmount);
    if (!amt || amt <= 0 || amt > user.walletBalance) return;

    onUpdateUser({ walletBalance: user.walletBalance - amt });
    setShowSendSuccess(true);
    setSendAmount('');
    setSendRecipient('');
    setTimeout(() => setShowSendSuccess(false), 3500);
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const q = aiPrompt.trim();
    setAiResponses((prev) => [
      ...prev,
      { 
        q, 
        a: `Regarding "${q}": I-pay online helps you manage payments, protect transactions, and grow your creator profile with zero friction.` 
      }
    ]);
    setAiPrompt('');
  };

  const handleViewUserProfileFromChat = async (friend: ChatFriend) => {
    showToast('Revealing user profile from database...');
    const email = friend.email || (friend.username?.includes('@') ? friend.username : `${friend.username}@gmail.com`);
    
    try {
      // 1. Fetch deep from both Firestore and Profile Cloud
      const [dbProfile, cloudProfile] = await Promise.all([
        firebaseAuthService.loadUserProfile(email),
        profileCloudService.getProfile(email)
      ]);

      const finalProfile = {
        ...(dbProfile || {}),
        ...(cloudProfile || {}),
        // Ensure critical fields from chat are present if missing in DB
        fullName: cloudProfile?.fullName || dbProfile?.fullName || friend.name,
        username: cloudProfile?.username || dbProfile?.username || friend.username,
        email: email,
        avatarUrl: cloudProfile?.avatarUrl || dbProfile?.avatarUrl || friend.avatarUrl,
        location: cloudProfile?.location || dbProfile?.location || friend.location || 'Nigeria',
      };

      setVisitorProfile(finalProfile as UserProfile);
      setActiveTab('profile');
    } catch (err) {
      console.error('Failed to reveal profile:', err);
      showToast('Error fetching user profile.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 min-h-screen relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sticky top-0 z-50 bg-[#2e7d32] text-white px-5 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md animate-in slide-in-from-top">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white px-1">✕</button>
        </div>
      )}

      {/* Dynamic Tab Content */}
      <div className="flex-1 flex flex-col">
        
        {/* TAB 5: PROFILE (User Details matching Sketch IMG-20261004-WA2985.jpg) */}
        {activeTab === 'profile' && (
          <div className="flex-1 flex flex-col relative">
            {visitorProfile && (
              <button 
                onClick={() => setVisitorProfile(null)}
                className="absolute top-4 left-4 z-40 bg-white shadow-lg p-2 rounded-full border border-slate-200 text-slate-700 hover:text-slate-900"
                title="Back to my profile"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <ProfileView
              user={visitorProfile || user}
              posts={visitorProfile ? [] : posts}
              onUpdateUser={onUpdateUser}
              onAddPost={onAddPost}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isVisitor={!!visitorProfile}
            />
          </div>
        )}

        {/* TAB 2: MEDIA FEED (Combined Media Feed matching Screenshot_20261005-032040.png) */}
        {activeTab === 'home' && (
          <MediaFeedScreen
            currentUser={user}
            posts={posts}
            onAddPost={onAddPost}
            onViewUserProfile={() => setActiveTab('profile')}
            onFullScreenChange={setIsMediaFullScreen}
          />
        )}

        {/* TAB 3: CHAT (Full Implementation from Sketch IMG-20261004-WA2988.jpg) */}
        {activeTab === 'chat' && (
          <ChatScreen
            currentUser={user}
            onViewUserProfile={handleViewUserProfileFromChat}
            onInsideChatChange={setIsInsideActiveChat}
            onStatusViewChange={setIsChatStatusFullScreen}
          />
        )}

        {/* TAB 4: PAYMENT & WALLET (Matching Sketch 1791208661738.jpg) */}
        {activeTab === 'payment' && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-28 overflow-y-auto">
            {/* Top Title: Payment */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-center sticky top-0 z-30 shadow-xs">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Payment
              </h1>
            </div>

            <div className="p-5 space-y-5 max-w-lg mx-auto w-full">
              
              {/* Balance Card Header */}
              <div className="bg-gradient-to-br from-[#1e3a1e] via-[#2e7d32] to-[#122b12] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 font-bold text-7xl select-none">
                  I-PAY
                </div>

                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Balance</span>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                      ₦ {(user.walletBalance * 1000).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </div>

                    {/* 8-Digit I-Pay Account Number */}
                    <div className="mt-3 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-emerald-400/30">
                      <span className="text-xs text-emerald-300 font-medium">I-Pay No:</span>
                      <span className="font-mono text-xs font-bold tracking-widest text-white">8294 0173</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('82940173');
                          setAccountNumberCopied(true);
                          setTimeout(() => setAccountNumberCopied(false), 2500);
                        }}
                        className="ml-1 p-1 text-emerald-300 hover:text-white"
                        title="Copy 8-digit Account Number"
                      >
                        {accountNumberCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Fund Account Button by the side */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('fund')}
                    className="bg-white hover:bg-emerald-50 text-[#1e3a1e] font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4 text-[#2e7d32]" />
                    <span>Fund Account</span>
                  </button>
                </div>
              </div>

              {/* 9 Service Sketch Buttons Grid matching Sketch 1791208661738.jpg */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {/* 1. I-pay Send */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('send')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <Send className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">I-pay Send</span>
                  </button>

                  {/* 2. Solar Recharge */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('solar')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <Sun className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Solar Recharge</span>
                  </button>

                  {/* 3. Electric */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('electric')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <Zap className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Electric</span>
                  </button>

                  {/* 4. Airtime */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('airtime')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Airtime</span>
                  </button>

                  {/* 5. Data */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('data')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <Wifi className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Data</span>
                  </button>

                  {/* 6. History */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('history')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <History className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">History</span>
                  </button>

                  {/* 7. Flight */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('flight')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <Plane className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Flight</span>
                  </button>

                  {/* 8. Hotel */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('hotel')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <Building2 className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Hotel</span>
                  </button>

                  {/* 9. Card */}
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('card')}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-all text-slate-800 shadow-2xs group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <CreditCard className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Card</span>
                  </button>
                </div>
              </div>

              {/* Recent Transactions List directly under service buttons - Nothing More below this! */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Transactions</h3>
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal('history')}
                    className="text-xs font-bold text-[#2e7d32] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2.5">
                  {transactionHistory.map((tx) => (
                    <div key={tx.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl p-2 bg-white rounded-xl shadow-2xs border border-slate-200/60">{tx.icon}</span>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{tx.type}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{tx.detail}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{tx.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-xs text-[#2e7d32]">{tx.amount}</div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Service Action Modals */}
            {/* 0. I-pay Send Modal */}
            {activePaymentModal === 'send' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-base flex items-center gap-2">💸 I-pay Send</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!sendAmount || !sendRecipient) return;
                    const newTx = {
                      id: `tx_${Date.now()}`,
                      type: 'Money Transfer',
                      detail: `Sent to ${sendRecipient}`,
                      amount: `₦ ${sendAmount}.00`,
                      date: 'Just now',
                      status: 'Successful',
                      icon: '💸'
                    };
                    setTransactionsHistory(prev => [newTx, ...prev]);
                    alert(`Successfully sent ₦${sendAmount} to ${sendRecipient}!`);
                    setActivePaymentModal(null);
                  }} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Recipient Username or 8-digit I-Pay No.</label>
                      <input
                        type="text"
                        value={sendRecipient}
                        onChange={(e) => setSendRecipient(e.target.value)}
                        placeholder="@username or 82940173"
                        className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Amount (₦)</label>
                      <input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-bold text-sm"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f72] text-white font-bold text-sm rounded-2xl shadow-md transition-transform active:scale-95"
                    >
                      Send Money
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 0.1. Solar Recharge Modal */}
            {activePaymentModal === 'solar' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-base flex items-center gap-2">☀️ Solar Recharge</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Solar Meter Account ID</label>
                      <input
                        type="text"
                        placeholder="Enter Solar Meter ID (e.g. SOL-884920)"
                        className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Select Solar Package</label>
                      <select className="w-full h-11 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium">
                        <option>Sokoto Solar Basic (30 Days) - ₦5,000</option>
                        <option>Northern Home Solar Pro (30 Days) - ₦12,000</option>
                        <option>Arewa Business Solar Max (30 Days) - ₦25,000</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTx = {
                          id: `tx_${Date.now()}`,
                          type: 'Solar Recharge',
                          detail: 'Sokoto Solar Utility Token',
                          amount: '₦ 5,000.00',
                          date: 'Just now',
                          status: 'Successful',
                          icon: '☀️'
                        };
                        setTransactionsHistory(prev => [newTx, ...prev]);
                        alert('Solar Recharge Token generated: 8492-0193-4810-5928!');
                        setActivePaymentModal(null);
                      }}
                      className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f72] text-white font-bold text-sm rounded-2xl shadow-md transition-transform active:scale-95"
                    >
                      Recharge Solar Power
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 0.2. Electric Modal */}
            {activePaymentModal === 'electric' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-base flex items-center gap-2">⚡ Electric Bill Payment</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Disco Provider</label>
                      <select className="w-full h-11 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium">
                        <option>Kaduna Electric (KADECO)</option>
                        <option>Kano Electric (KEDCO)</option>
                        <option>Abuja Electric (AEDC)</option>
                        <option>Jos Electric (JEDPLC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Meter Number</label>
                      <input
                        type="text"
                        placeholder="Enter 11-digit Meter Number"
                        className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Amount (₦)</label>
                      <input
                        type="number"
                        placeholder="3000"
                        className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-bold text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTx = {
                          id: `tx_${Date.now()}`,
                          type: 'Electricity Token',
                          detail: 'Kaduna Electric Prepaid',
                          amount: '₦ 3,000.00',
                          date: 'Just now',
                          status: 'Successful',
                          icon: '⚡'
                        };
                        setTransactionsHistory(prev => [newTx, ...prev]);
                        alert('Electricity Meter Token generated: 4920-1049-5820-1920!');
                        setActivePaymentModal(null);
                      }}
                      className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f72] text-white font-bold text-sm rounded-2xl shadow-md transition-transform active:scale-95"
                    >
                      Pay Electricity Bill
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 1. Fund Account Modal */}
            {activePaymentModal === 'fund' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-base">Fund Your I-Pay Account</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Bank Transfer Details</span>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Name:</span>
                        <span className="font-bold text-slate-900">I-Pay Microfinance Bank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Number:</span>
                        <span className="font-mono font-extrabold text-[#2e7d32] text-sm">8294 0173</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Name:</span>
                        <span className="font-bold text-slate-900">{(user.fullName || 'Isiyaku Haruna').toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-slate-500 pt-1">
                    Transfer any amount to this account number to automatically top up your balance in under 1 minute!
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateUser({ walletBalance: user.walletBalance + 50 });
                      alert('₦ 50,000 added to your account successfully!');
                      setActivePaymentModal(null);
                    }}
                    className="w-full py-3 bg-[#2e7d32] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#256829]"
                  >
                    Simulate Bank Deposit (+₦ 50,000)
                  </button>
                </div>
              </div>
            )}

            {/* 2. Airtime Modal Screen matching Sketch 1791208661738.jpg */}
            {activePaymentModal === 'airtime' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 border border-slate-200">
                  {/* Header: < Airtime */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActivePaymentModal(null)}
                      className="p-1 -ml-1 text-slate-700 hover:text-black flex items-center gap-1 font-bold text-xs"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-extrabold text-base text-slate-900 text-center flex-1 pr-4">Airtime</h3>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Phone Number Input */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Phone Number</label>
                      <input
                        type="text"
                        value={airtimePhone}
                        onChange={(e) => setAirtimePhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium text-xs placeholder:text-slate-400"
                      />
                    </div>

                    {/* Network Selector */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Network</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['MTN', 'Airtel', 'Glo', '9mobile'].map((net) => (
                          <button
                            key={net}
                            type="button"
                            onClick={() => setAirtimeNetwork(net)}
                            className={`py-2 rounded-xl font-bold transition-all border text-xs ${
                              airtimeNetwork === net
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {net}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Amount</label>
                      <input
                        type="text"
                        value={airtimeAmount ? `₦ ${airtimeAmount}` : ''}
                        onChange={(e) => setAirtimeAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Select amount"
                        className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-extrabold text-sm placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>

                    {/* 3x3 Keypad / Preset Amount Grid matching Sketch 1791208661738.jpg */}
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      {['100', '200', '500', '1000', '2000', '5000', '10000', '20000', 'Custom'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            if (amt !== 'Custom') setAirtimeAmount(amt);
                          }}
                          className={`py-3 rounded-2xl border font-bold text-xs transition-all active:scale-95 ${
                            airtimeAmount === amt
                              ? 'bg-[#00a884] text-white border-[#00a884] shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
                          }`}
                        >
                          {amt === 'Custom' ? 'Custom' : `₦${parseInt(amt).toLocaleString()}`}
                        </button>
                      ))}
                    </div>

                    {/* Large Green Pay Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!airtimeAmount || !airtimePhone) return;
                        const newTx = {
                          id: `tx_${Date.now()}`,
                          type: 'Airtime Purchase',
                          detail: `${airtimeNetwork} ₦${airtimeAmount} to ${airtimePhone}`,
                          amount: `₦ ${airtimeAmount}.00`,
                          date: 'Just now',
                          status: 'Successful',
                          icon: '📱'
                        };
                        setTransactionsHistory(prev => [newTx, ...prev]);
                        alert(`Successfully recharged ₦${airtimeAmount} ${airtimeNetwork} Airtime to ${airtimePhone}!`);
                        setActivePaymentModal(null);
                      }}
                      className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f72] text-white font-bold text-base rounded-2xl shadow-lg transition-transform active:scale-95 mt-3"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Data Modal */}
            {activePaymentModal === 'data' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-base flex items-center gap-2">📶 Internet Data Bundles</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Network Provider</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['MTN', 'Airtel', 'Glo', '9mobile'].map((net) => (
                          <button
                            key={net}
                            type="button"
                            onClick={() => setAirtimeNetwork(net)}
                            className={`py-2 rounded-xl font-bold transition-colors border ${
                              airtimeNetwork === net ? 'bg-[#2e7d32] text-white border-[#2e7d32]' : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {net}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Select Bundle</label>
                      <select
                        value={selectedDataPlan}
                        onChange={(e) => setSelectedDataPlan(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      >
                        <option>1.5GB Monthly - ₦1,000</option>
                        <option>3.5GB Monthly - ₦2,000</option>
                        <option>10GB Monthly - ₦4,500</option>
                        <option>20GB Monthly - ₦8,000</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={airtimePhone}
                        onChange={(e) => setAirtimePhone(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newTx = {
                          id: `tx_${Date.now()}`,
                          type: 'Data Bundle',
                          detail: `${airtimeNetwork} ${selectedDataPlan} to ${airtimePhone}`,
                          amount: selectedDataPlan.split('-')[1]?.trim() || '₦2,000.00',
                          date: 'Just now',
                          status: 'Successful',
                          icon: '📶'
                        };
                        setTransactionsHistory(prev => [newTx, ...prev]);
                        alert(`Successfully activated ${selectedDataPlan} ${airtimeNetwork} Data for ${airtimePhone}!`);
                        setActivePaymentModal(null);
                      }}
                      className="w-full py-3 bg-[#2e7d32] text-white font-bold rounded-xl shadow-md hover:bg-[#256829] mt-2"
                    >
                      Buy Data Bundle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Transaction History Modal */}
            {activePaymentModal === 'history' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                    <h3 className="font-bold text-base flex items-center gap-2">📜 Transaction History</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {transactionHistory.map((tx) => (
                      <div key={tx.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 bg-white rounded-xl shadow-xs">{tx.icon}</span>
                          <div>
                            <div className="font-bold text-xs text-slate-900">{tx.type}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{tx.detail}</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{tx.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-xs text-[#2e7d32]">{tx.amount}</div>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Flight Booking Modal */}
            {activePaymentModal === 'flight' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-base flex items-center gap-2">✈️ Flight Booking</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Departure Airport</label>
                      <select
                        value={flightFrom}
                        onChange={(e) => setFlightFrom(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      >
                        <option>Abuja (ABV) - Nnamdi Azikiwe</option>
                        <option>Lagos (LOS) - Murtala Muhammed</option>
                        <option>Kano (KAN) - Mallam Aminu Kano</option>
                        <option>Kaduna (KAD) - Kaduna International</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Destination Airport</label>
                      <select
                        value={flightTo}
                        onChange={(e) => setFlightTo(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      >
                        <option>Lagos (LOS) - Murtala Muhammed</option>
                        <option>Abuja (ABV) - Nnamdi Azikiwe</option>
                        <option>Port Harcourt (PHC)</option>
                        <option>Enugu (ENU)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Departure Date</label>
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newTx = {
                          id: `tx_${Date.now()}`,
                          type: 'Flight Ticket',
                          detail: `${flightFrom} -> ${flightTo}`,
                          amount: '₦ 85,000.00',
                          date: 'Just now',
                          status: 'Successful',
                          icon: '✈️'
                        };
                        setTransactionsHistory(prev => [newTx, ...prev]);
                        alert(`Flight booking reserved from ${flightFrom} to ${flightTo} on ${flightDate}!`);
                        setActivePaymentModal(null);
                      }}
                      className="w-full py-3 bg-[#2e7d32] text-white font-bold rounded-xl shadow-md hover:bg-[#256829] mt-2"
                    >
                      Book Flight (₦85,000)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Hotel Reservation Modal */}
            {activePaymentModal === 'hotel' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-base flex items-center gap-2">🏨 Hotel Reservation</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Destination City</label>
                      <input
                        type="text"
                        value={hotelCity}
                        onChange={(e) => setHotelCity(e.target.value)}
                        placeholder="City, e.g. Kaduna, Abuja, Lagos"
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Check-in Date</label>
                      <input
                        type="date"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newTx = {
                          id: `tx_${Date.now()}`,
                          type: 'Hotel Booking',
                          detail: `Luxury Suite in ${hotelCity}`,
                          amount: '₦ 45,000.00',
                          date: 'Just now',
                          status: 'Successful',
                          icon: '🏨'
                        };
                        setTransactionsHistory(prev => [newTx, ...prev]);
                        alert(`Hotel reservation confirmed in ${hotelCity} starting ${hotelCheckIn}!`);
                        setActivePaymentModal(null);
                      }}
                      className="w-full py-3 bg-[#2e7d32] text-white font-bold rounded-xl shadow-md hover:bg-[#256829] mt-2"
                    >
                      Reserve Hotel Room (₦45,000/night)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Virtual Card Modal */}
            {activePaymentModal === 'card' && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-base flex items-center gap-2">💳 I-Pay Virtual Card</h3>
                    <button onClick={() => setActivePaymentModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="w-full aspect-[1.586/1] rounded-3xl p-5 text-white bg-gradient-to-tr from-[#3a6828] via-[#528337] to-[#8fae63] flex flex-col justify-between shadow-lg">
                    <div className="flex justify-between items-center text-xs font-extrabold tracking-wider">
                      <span>I-PAY ONLINE</span>
                      <span className="font-mono text-xs">VISA</span>
                    </div>
                    <div className="font-mono text-base tracking-widest my-auto font-bold">
                      {user.virtualCard.cardNumber}
                    </div>
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="block text-[9px] opacity-75">CARDHOLDER</span>
                        <span className="font-bold">{(user.fullName || 'ISIYAKU HARUNA').toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] opacity-75">EXPIRES</span>
                        <span className="font-mono font-bold">{user.virtualCard.expiryDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700">Card Status:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isCardFrozen;
                        setIsCardFrozen(nextState);
                        onUpdateUser({ virtualCard: { ...user.virtualCard, isFrozen: nextState } });
                      }}
                      className={`px-3 py-1 rounded-full font-bold text-xs ${
                        isCardFrozen ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isCardFrozen ? '❄️ Frozen' : '✅ Active'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: MARKET matching sketch 1791208668336.jpg */}
        {activeTab === 'market' && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-28 overflow-y-auto">
            {/* Top Header Title syncs with selected category: Apps Market, Products Market, Bookstore Market */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
              <div className="w-8" />
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight text-center">
                {marketTab === 'apps' && 'Apps Market'}
                {marketTab === 'products' && 'Products Market (100 Items)'}
                {marketTab === 'books' && 'Bookstore Market'}
              </h1>
              
              {/* Shopping Cart Header Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4 text-[#00a884]" />
                <span className="hidden sm:inline">Cart</span>
                {totalCartCount > 0 && (
                  <span className="bg-[#00a884] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>

            <div className="p-5 space-y-5 max-w-lg mx-auto w-full">
              {/* Category Segmented Control Tabs: [ Apps ] | [ Products ] | [ Books ] */}
              <div className="grid grid-cols-3 gap-2 bg-slate-200 p-1.5 rounded-2xl shadow-inner text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMarketTab('apps')}
                  className={`py-2.5 rounded-xl transition-all shadow-xs ${
                    marketTab === 'apps'
                      ? 'bg-[#00a884] text-white shadow-md scale-100'
                      : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Apps
                </button>
                <button
                  type="button"
                  onClick={() => setMarketTab('products')}
                  className={`py-2.5 rounded-xl transition-all shadow-xs ${
                    marketTab === 'products'
                      ? 'bg-[#00a884] text-white shadow-md scale-100'
                      : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => setMarketTab('books')}
                  className={`py-2.5 rounded-xl transition-all shadow-xs ${
                    marketTab === 'books'
                      ? 'bg-[#00a884] text-white shadow-md scale-100'
                      : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Books
                </button>
              </div>

              {/* 1. APPS TAB CONTENT (15 Items) */}
              {marketTab === 'apps' && (
                <div className="space-y-4">
                  {/* Android / iPhone Filter Tags */}
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAppsFilter('all')}
                      className={`px-3 py-1.5 rounded-full border transition-all ${
                        appsFilter === 'all'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      All Apps (15)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppsFilter('android')}
                      className={`px-3 py-1.5 rounded-full border transition-all ${
                        appsFilter === 'android'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppsFilter('iphone')}
                      className={`px-3 py-1.5 rounded-full border transition-all ${
                        appsFilter === 'iphone'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      iPhone / iOS
                    </button>
                  </div>

                  {/* Grid of 15 Apps matching sketch 1791208668336.jpg */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {MOCK_APPS.filter(app => {
                      if (appsFilter === 'android') return app.platform.includes('Android');
                      if (appsFilter === 'iphone') return app.platform.includes('iPhone');
                      return true;
                    }).map((app) => (
                      <div
                        key={app.id}
                        className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                            {app.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 text-xs truncate">{app.name}</h3>
                            <span className="text-[10px] text-slate-500 font-medium block truncate mt-0.5">{app.platform}</span>
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-0.5">
                              <span>⭐ {app.rating}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Installing / opening ${app.name}...`)}
                          className="w-full py-2 bg-[#2e7d32] hover:bg-[#256829] text-white rounded-xl text-xs font-bold shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-1"
                        >
                          <span>Get</span>
                          <span className="text-[10px] opacity-80">({app.price})</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. PRODUCTS TAB CONTENT (100 Items with Fans, Plates, Kitchenware & Very Small Cart Button) */}
              {marketTab === 'products' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 font-bold flex items-center justify-between px-1">
                    <span>Showing 100 Products (Fans, Plates, Appliances)</span>
                    <span className="text-[#00a884]">{totalCartCount} in Cart</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {MOCK_PRODUCTS.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-3 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-2 relative"
                      >
                        <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 relative">
                          <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {prod.category}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">{prod.title}</h3>
                          <div className="text-xs font-extrabold text-[#2e7d32] mt-1">{prod.price}</div>
                        </div>

                        {/* Action buttons: Very Small Sleek Cart Button + Buy Button */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {/* Very small, elegant Cart Button */}
                          <button
                            type="button"
                            onClick={() => handleAddToCart(prod)}
                            className="p-2 bg-[#00a884] hover:bg-[#008f72] text-white rounded-xl shadow-2xs transition-transform active:scale-90 flex items-center justify-center shrink-0"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>

                          {/* Buy Button */}
                          <button
                            type="button"
                            onClick={() => {
                              handleAddToCart(prod);
                              setIsCartOpen(true);
                            }}
                            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold shadow-2xs transition-transform active:scale-95 text-center truncate"
                          >
                            Buy with I-Pay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. BOOKS TAB CONTENT (15 Items) */}
              {marketTab === 'books' && (
                <div className="grid grid-cols-2 gap-3.5">
                  {MOCK_BOOKS.map((book) => (
                    <div
                      key={book.id}
                      className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-2.5"
                    >
                      <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 relative">
                        <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 right-1.5 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          📖 E-Book
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">{book.title}</h3>
                        <span className="text-[10px] text-slate-500 font-medium block truncate mt-0.5">By {book.author}</span>
                        <div className="text-xs font-extrabold text-[#2e7d32] mt-1">{book.price}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Purchasing book "${book.title}" with I-Pay!`)}
                        className="w-full py-2 bg-[#00a884] hover:bg-[#008f72] text-white rounded-xl text-xs font-bold shadow-2xs transition-transform active:scale-95"
                      >
                        Read / Buy Book
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Shopping Cart Drawer Sheet Modal */}
            {isCartOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-[#00a884]" />
                      <h3 className="font-bold text-base">Your Shopping Cart</h3>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                        {totalCartCount}
                      </span>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold">Your cart is empty.</p>
                      <p className="text-[11px] text-slate-400">Add products like fans or plates to get started!</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {cartItems.map((item) => (
                          <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                            <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                              <div className="text-xs font-extrabold text-[#2e7d32] mt-0.5">{item.price}</div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.id, -1)}
                                className="p-1 text-slate-600 hover:text-slate-900"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-bold text-xs px-1">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.id, 1)}
                                className="p-1 text-slate-600 hover:text-slate-900"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-200 space-y-3 shrink-0">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>Total Amount:</span>
                          <span className="text-lg font-extrabold text-[#2e7d32]">
                            ₦ {totalCartPrice.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (user.walletBalance < totalCartPrice / 1000) {
                              alert('Insufficient I-Pay wallet balance! Please top up your wallet.');
                              return;
                            }
                            onUpdateUser({ walletBalance: user.walletBalance - (totalCartPrice / 1000) });
                            alert(`Order placed successfully for ₦ ${totalCartPrice.toLocaleString()} with I-Pay!`);
                            setCartItems([]);
                            setIsCartOpen(false);
                          }}
                          className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f72] text-white font-bold text-sm rounded-2xl shadow-lg transition-transform active:scale-95"
                        >
                          Checkout with I-Pay
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 6: AI */}
        {activeTab === 'ai' && (
          <div className="flex-1 flex flex-col bg-white pb-28">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <h1 className="text-lg font-bold text-slate-900">I-Pay AI Assistant</h1>
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4 max-w-lg mx-auto w-full">
              {aiResponses.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="p-3 bg-slate-100 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800">
                    Q: {item.q}
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleAskAi} className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask about payments, monetization or setup..."
                  className="flex-1 h-11 px-4 text-xs sm:text-sm border border-slate-300 rounded-2xl focus:outline-none focus:border-slate-900"
                />
                <button
                  type="submit"
                  className="h-11 px-5 bg-[#2e7d32] text-white rounded-2xl text-xs sm:text-sm font-bold hover:bg-[#256829] flex items-center justify-center shrink-0 shadow-xs"
                >
                  Ask
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Persistent Bottom Bar - Hidden when inside active chat preview, chat status viewer, or media full screen */}
      {!( (activeTab === 'chat' && (isInsideActiveChat || isChatStatusFullScreen)) || (activeTab === 'home' && isMediaFullScreen) ) && (
        <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        user={user}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={onLogout}
        onShowToast={showToast}
      />
    </div>
  );
};

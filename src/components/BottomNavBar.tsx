import React from 'react';
import { Home, MessageSquare, CreditCard, Store, User, Sparkles } from 'lucide-react';
import { DashboardTab } from '../types';

interface BottomNavBarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: DashboardTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Media', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'market', label: 'Market', icon: Store },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'ai', label: 'AI', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between sm:rounded-b-3xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
              isActive 
                ? 'text-[#2e7d32] bg-emerald-50/60 font-bold scale-105' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-6 h-6 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-[1.85]'}`} />
            <span className={`text-xs mt-1 tracking-tight ${isActive ? 'font-bold text-[#2e7d32]' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Plus, 
  LogOut, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Edit,
  MoreVertical,
  UserCog,
  Settings,
  X,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { profileCloudService } from '../services/profileCloudService';
import { UserProfile } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'create'>('users');
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Management Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [newFollowersValue, setNewFollowersValue] = useState('');
  const [manageStatus, setManageStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Create User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const users = await firebaseAuthService.getAllDatabaseUsers();
      setDbUsers(users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const email = newEmail.trim().toLowerCase();
    if (!email || !newPassword) {
      setCreateError('Email and Password are required');
      return;
    }

    setIsCreating(true);
    try {
      const res = await firebaseAuthService.registerAccount({
        email: email,
        password: newPassword,
        username: email.split('@')[0],
      });

      if (res.success) {
        setCreateSuccess(`✓ User ${email} created successfully!`);
        setNewEmail('');
        setNewPassword('');
        loadUsers();
      } else {
        setCreateError(res.error || 'Failed to create user');
      }
    } catch (err: any) {
      setCreateError(err.message || 'An error occurred during user creation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAutoSetup = async () => {
    if (!selectedUser) return;
    setIsManaging(true);
    const success = await firebaseAuthService.autoSetupProfile(selectedUser.email);
    setIsManaging(false);
    if (success) {
      setManageStatus({ type: 'success', message: 'Profile auto-setup complete with default data.' });
      loadUsers();
    } else {
      setManageStatus({ type: 'error', message: 'Failed to auto-setup profile.' });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${selectedUser.email}?`)) return;
    
    setIsManaging(true);
    const success = await firebaseAuthService.deleteUser(selectedUser.email);
    setIsManaging(false);
    if (success) {
      alert('User deleted successfully.');
      setSelectedUser(null);
      loadUsers();
    } else {
      setManageStatus({ type: 'error', message: 'Failed to delete user.' });
    }
  };

  const handleWipeAllCaches = async () => {
    if (!confirm('Are you sure you want to completely WIPE ALL local cached profiles and clear storage?')) return;
    try {
      profileCloudService.wipeAllLocalProfileCache();
      await fetch('/api/auth/wipe-all', { method: 'POST' });
      await loadUsers();
      alert('✓ All local cached profiles and database accounts have been completely wiped.');
    } catch (e: any) {
      alert('Cache wipe complete: ' + e.message);
    }
  };

  const handleUpdateFollowers = async () => {
    if (!selectedUser || !newFollowersValue) return;
    setIsManaging(true);
    const success = await firebaseAuthService.updateFollowers(selectedUser.email, newFollowersValue);
    setIsManaging(false);
    if (success) {
      setManageStatus({ type: 'success', message: `Followers updated to: ${newFollowersValue}` });
      setNewFollowersValue('');
      loadUsers();
    } else {
      setManageStatus({ type: 'error', message: 'Failed to update followers.' });
    }
  };

  const filteredUsers = dbUsers.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-900 relative">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-tight">Admin Portal</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Master Control Panel</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors text-slate-300"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex p-1 bg-slate-200 m-4 rounded-2xl border border-slate-300 shadow-inner">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Database</span>
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'create' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Direct Creation</span>
        </button>
      </div>

      <div className="flex-1 px-4 pb-10">
        {activeTab === 'users' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {/* Search and Refresh */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter users..."
                  className="w-full h-10 pl-10 pr-4 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-sm"
                />
              </div>
              <button 
                onClick={loadUsers}
                title="Refresh user list"
                className="w-10 h-10 bg-white border border-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={handleWipeAllCaches}
                title="Wipe all local cached profiles & database"
                className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total: {filteredUsers.length} Members</span>
              </div>
              
              {isLoading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-400">Fetching Database Records...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-400">No users found matching your search.</p>
                </div>
              ) : (
                filteredUsers.map((u, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedUser(u)}
                    className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 animate-in fade-in hover:border-emerald-500 cursor-pointer active:scale-98 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-inner shrink-0 overflow-hidden">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.name?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">{u.name || 'No Name'}</h4>
                          {u.email === '@bujimicentral' && (
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">{u.source || 'Database User'}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">{u.followers || '0 Followers'}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400">
                      <UserCog className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-6 space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Create New Account</h2>
              <p className="text-[11px] text-slate-500 font-medium px-4">
                Users created here will be forced to pass OTP and Profile Setup when they first log in.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-600 font-bold text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-700 font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{createSuccess}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">User Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Temporary Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-75 flex items-center justify-center gap-3"
              >
                {isCreating ? (
                  <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Execute Creation</span>
                    <Plus className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h5 className="text-[10px] font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 text-emerald-600" />
                <span>What happens next?</span>
              </h5>
              <ul className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <span>The user is immediately added to Firebase Auth.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <span>A Firestore entry is created in Config A 'users' collection.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-6 sm:p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-inner overflow-hidden">
                   {selectedUser.avatarUrl ? (
                     <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <UserCog className="w-8 h-8" />
                   )}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">{selectedUser.name || 'Manage User'}</h3>
                  <p className="text-xs text-slate-500 font-bold">{selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedUser(null); setManageStatus(null); }}
                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {manageStatus && (
              <div className={`p-4 rounded-2xl text-[11px] font-bold text-center flex items-center justify-center gap-2 animate-in zoom-in-95 ${
                manageStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {manageStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{manageStatus.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {/* Auto Setup Profile */}
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Auto Setup Profile</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Generate default profile data for this user.</p>
                  </div>
                  <button 
                    onClick={handleAutoSetup}
                    disabled={isManaging}
                    className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <UserCheck className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Edit Followers */}
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Edit Followers Count</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Update the public follower count displayed.</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <TrendingUp className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type="text"
                      value={newFollowersValue}
                      onChange={(e) => setNewFollowersValue(e.target.value)}
                      placeholder="e.g. 5.2k Followers"
                      className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-emerald-600 shadow-inner"
                    />
                  </div>
                  <button 
                    onClick={handleUpdateFollowers}
                    disabled={isManaging || !newFollowersValue}
                    className="px-5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-5 bg-rose-50 rounded-3xl border border-rose-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-rose-900">Danger Zone</h4>
                    <p className="text-[10px] text-rose-600 font-medium">Permanently remove this user from system.</p>
                  </div>
                  <button 
                    onClick={handleDeleteUser}
                    disabled={isManaging}
                    className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

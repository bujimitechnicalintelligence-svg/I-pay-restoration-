/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthScreen, OtpDestination, UserProfile, PostItem } from './types';
import { AppLayout } from './components/AppLayout';
import { SignUpScreen } from './components/SignUpScreen';
import { OtpVerificationScreen } from './components/OtpVerificationScreen';
import { LoginScreen } from './components/LoginScreen';
import { SetPasswordScreen } from './components/SetPasswordScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileSetupScreen } from './components/ProfileSetupScreen';
import { SocialAuthModal } from './components/SocialAuthModal';
import { TermsModal } from './components/TermsModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { profileCloudService, EMPTY_USER_PROFILE } from './services/profileCloudService';
import { otpService } from './services/otpService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('signup');
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  
  // Registration / Auth flow state
  const [regData, setRegData] = useState<{
    username: string;
    email: string;
    phoneNumber: string;
    destination: OtpDestination;
  }>({
    username: '',
    email: '',
    phoneNumber: '',
    destination: 'email',
  });

  // User profile state - Empty by default (No fake data!)
  const [user, setUser] = useState<UserProfile>(EMPTY_USER_PROFILE);

  // User posts state
  const [posts, setPosts] = useState<PostItem[]>(() => {
    const saved = localStorage.getItem('ipay_user_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Check existing session on startup
  useEffect(() => {
    const initSession = async () => {
      try {
        const savedEmail = 
          localStorage.getItem('ipay_current_user_email') || 
          (localStorage.getItem('ipay_remember_me_active') === 'true' ? localStorage.getItem('ipay_remembered_email') : null);

        if (savedEmail) {
          // Strictly verify if this account exists in our native App Database
          try {
            const checkRes = await fetch('/api/auth/check-account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ identifier: savedEmail }),
            });
            const checkData = await checkRes.json();

            if (checkData?.exists) {
              const remoteProfile = await profileCloudService.getProfile(savedEmail);
              if (remoteProfile && remoteProfile.isProfileCompleted) {
                setUser(remoteProfile);
                localStorage.setItem('ipay_current_user_email', savedEmail);
                setCurrentScreen('dashboard');
                setIsLoadingSession(false);
                return;
              } else if (remoteProfile) {
                setUser(remoteProfile);
                setCurrentScreen('profile-setup');
                setIsLoadingSession(false);
                return;
              }
            }
          } catch (fetchErr) {
            console.warn('[DATABASE ACCOUNT CHECK ERROR]', fetchErr);
          }

          // If account is not in app database, completely wipe all local cached profile & session data
          profileCloudService.wipeAllLocalProfileCache();
          setUser(EMPTY_USER_PROFILE);
          setCurrentScreen('signup');
          setIsLoadingSession(false);
          return;
        } else {
          // No active saved email - purge any orphaned profile caches
          profileCloudService.wipeAllLocalProfileCache();
        }
      } catch (err) {
        console.warn('Session init check notice:', err);
      }
      setIsLoadingSession(false);
    };

    initSession();
  }, []);

  useEffect(() => {
    localStorage.setItem('ipay_user_posts', JSON.stringify(posts));
  }, [posts]);

  // Social Auth Modal state
  const [socialModalProvider, setSocialModalProvider] = useState<'google' | 'apple' | null>(null);
  
  // Social verified info for SetPassword screen
  const [socialAuthData, setSocialAuthData] = useState<{
    email: string;
    name: string;
    username: string;
    provider: 'google' | 'apple';
  }>({
    email: '',
    name: '',
    username: '',
    provider: 'google',
  });

  // Terms and Privacy Modal state
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy' | null>(null);

  // Forgot Password Modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState<boolean>(false);

  // Handlers for the user journey: Sign Up -> OTP -> Profile Setup -> Home
  const handleSignUpNext = (data: {
    username?: string;
    email: string;
    phoneNumber?: string;
    destination: OtpDestination;
  }) => {
    setRegData({
      username: data.username || data.email.split('@')[0],
      email: data.email,
      phoneNumber: data.phoneNumber || '',
      destination: data.destination,
    });
    // Proceed to OTP verification screen (never skipped)
    setCurrentScreen('otp');
  };

  const handleOtpVerifySuccess = async () => {
    const activeEmail = regData.email.trim().toLowerCase();
    localStorage.setItem('ipay_current_user_email', activeEmail);

    // Deep check if user has existing profile in Database B (collections-1a343)
    const existingProfile = await profileCloudService.getProfile(activeEmail);

    if (existingProfile && existingProfile.isProfileCompleted) {
      setUser(existingProfile);
      setCurrentScreen('dashboard'); // Direct to Home!
    } else {
      // Must complete profile setup before doing anything in the app
      setUser({
        ...EMPTY_USER_PROFILE,
        email: activeEmail,
        username: regData.username || activeEmail.split('@')[0],
        fullName: regData.username || activeEmail.split('@')[0],
      });
      setCurrentScreen('profile-setup');
    }
  };

  const handleProfileSetupComplete = (completedProfile: UserProfile) => {
    setUser(completedProfile);
    localStorage.setItem('ipay_current_user_email', completedProfile.email);
    // Take user to Home Dashboard
    setCurrentScreen('dashboard');
  };

  const handleSocialAuthSuccess = (data: { email: string; name: string; username: string }) => {
    if (!socialModalProvider) return;
    const provider = socialModalProvider;
    setSocialModalProvider(null);
    setSocialAuthData({
      ...data,
      provider,
    });
    setUser((prev) => ({
      ...prev,
      email: data.email,
      fullName: data.name,
      username: data.username,
      isEmailVerified: true,
    }));
    setCurrentScreen('set-password');
  };

  const handlePasswordSet = async (password: string) => {
    const activeEmail = socialAuthData.email.trim().toLowerCase();
    localStorage.setItem('ipay_current_user_email', activeEmail);

    const existing = await profileCloudService.getProfile(activeEmail);
    if (existing && existing.isProfileCompleted) {
      setUser(existing);
      setCurrentScreen('dashboard');
    } else {
      setUser({
        ...EMPTY_USER_PROFILE,
        email: activeEmail,
        fullName: socialAuthData.name,
        username: socialAuthData.username,
      });
      setCurrentScreen('profile-setup');
    }
  };

  const handleLoginSuccess = async (identifier: string) => {
    const userEmail = identifier.includes('@') ? identifier.toLowerCase().trim() : `${identifier.toLowerCase().trim()}@gmail.com`;
    setRegData({
      username: identifier.split('@')[0],
      email: userEmail,
      phoneNumber: '',
      destination: 'email',
    });
    // Move to OTP verification screen for Gmail 6-digit OTP
    setCurrentScreen('otp');
  };

  const handleAdminLogin = () => {
    setCurrentScreen('admin');
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      if (next.email) {
        profileCloudService.saveProfile(next.email, next);
      }
      return next;
    });
  };

  const handleAddPost = (post: PostItem) => {
    setPosts((prev) => [post, ...prev]);
    setUser((prev) => {
      const next = {
        ...prev,
        postsCount: (prev.postsCount || 0) + 1,
      };
      if (next.email) {
        profileCloudService.saveProfile(next.email, next);
      }
      return next;
    });
  };

  const handleLogout = () => {
    profileCloudService.wipeAllLocalProfileCache();
    setUser(EMPTY_USER_PROFILE);
    setCurrentScreen('login');
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-slate-400 font-medium">Loading session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#95B374] selection:text-white">
      {/* Main App Viewport */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        <AppLayout>
          {currentScreen === 'signup' && (
            <SignUpScreen
              onNext={handleSignUpNext}
              onNavigateLogin={() => setCurrentScreen('login')}
              onSocialAuth={(provider) => setSocialModalProvider(provider)}
              onOpenTerms={() => setTermsModalType('terms')}
              onOpenPrivacy={() => setTermsModalType('privacy')}
            />
          )}

          {currentScreen === 'otp' && (
            <OtpVerificationScreen
              destination={regData.destination}
              phoneNumber={regData.phoneNumber}
              email={regData.email}
              lockEmailOnly={true}
              onVerifySuccess={handleOtpVerifySuccess}
              onBack={() => setCurrentScreen('login')}
              onSwitchDestination={(newDest) =>
                setRegData((prev) => ({ ...prev, destination: newDest }))
              }
            />
          )}

          {currentScreen === 'profile-setup' && (
            <ProfileSetupScreen
              email={user.email || regData.email}
              initialProfile={user}
              onComplete={handleProfileSetupComplete}
            />
          )}

          {currentScreen === 'login' && (
            <LoginScreen
              onLoginSuccess={handleLoginSuccess}
              onAdminLogin={handleAdminLogin}
              onNavigateSignUp={() => setCurrentScreen('signup')}
              onNavigateForgotPassword={() => setForgotPasswordOpen(true)}
              onSocialAuth={(provider) => setSocialModalProvider(provider)}
            />
          )}

          {currentScreen === 'set-password' && (
            <SetPasswordScreen
              verifiedEmail={socialAuthData.email}
              verifiedName={socialAuthData.name}
              provider={socialAuthData.provider}
              onPasswordSet={handlePasswordSet}
              onBack={() => setCurrentScreen('signup')}
            />
          )}

          {currentScreen === 'admin' && (
            <AdminDashboard onLogout={handleLogout} />
          )}

          {currentScreen === 'dashboard' && (
            <DashboardScreen
              user={user}
              posts={posts}
              onUpdateUser={handleUpdateUser}
              onAddPost={handleAddPost}
              onLogout={handleLogout}
            />
          )}
        </AppLayout>
      </main>

      {/* Social Verification Dialog (Google / Apple) */}
      <SocialAuthModal
        provider={socialModalProvider}
        onClose={() => setSocialModalProvider(null)}
        onSuccess={handleSocialAuthSuccess}
      />

      {/* Terms and Privacy Modal */}
      <TermsModal
        type={termsModalType}
        onClose={() => setTermsModalType(null)}
        onAccept={() => setTermsModalType(null)}
      />

      {/* Forgot Password Flow Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onResetComplete={(resetEmail) => {
          setCurrentScreen('login');
        }}
      />
    </div>
  );
}

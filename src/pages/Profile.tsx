import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import ProfileCard from '../components/ProfileCard';
import ProfileForm from '../components/ProfileForm';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import RequestsPanel from '../components/RequestsPanel';
import type { Profile } from '../types/profile';

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true); // true: login, false: register
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  // DEBUG: Profile and user state
  useEffect(() => {
    console.log('Profile page - User:', user);
    console.log('Profile state:', profile);
    console.log('Loading:', loading, 'Editing:', editing);
  }, [user, profile, loading, editing]);

  console.log('Profile page - User:', user?.email, 'Loading:', loading);

  // Fetch profile when user state changes
  useEffect(() => {
    if (user === undefined) return; // İlk renderda supabase auth yüklenmemiş olabilir
    if (user === null) setLoading(false); // Kullanıcı yoksa loading'i kapat
    else fetchProfile();
  }, [user]);

  // İlk açılışta sadece user state'ini çek
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'User:', session?.user?.email);
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setEmailNotConfirmed(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      // Show warning if email is not confirmed
      if (!user.email_confirmed_at) {
        setEmailNotConfirmed(true);
        setLoading(false);
        return;
      }
      setEmailNotConfirmed(false);
      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        const safeUsername = data.username?.trim() || "User";
        const safeAvatarUrl = data.avatar_url || `https://via.placeholder.com/150/2563eb/ffffff?text=${encodeURIComponent(safeUsername[0].toUpperCase())}`;
        setProfile({ ...data, username: safeUsername, avatar_url: safeAvatarUrl });
        console.log('Profile loaded for:', safeUsername);
        console.log('Fetched profile data:', data);
        console.log('Safe username:', safeUsername);
        console.log('Safe avatar URL:', safeAvatarUrl);
      } else if (!data && !error) {
        setEditing(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = () => {
    setEditing(false);
    fetchProfile();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center relative profile-stadium-bg pb-24">
        <div className="stadium-lights"></div>
        <div className="glass-card p-8 text-center relative z-10">
          <div className="loading-spinner mx-auto mb-4"></div>
          <div className="text-white text-xl font-orbitron">Loading profile...</div>
          <div className="text-blue-200 text-sm mt-2">Please wait while we fetch your data</div>
        </div>
      </div>
    );
  }

  // Show login/register form if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen profile-stadium-bg p-2 sm:p-4 pb-24 relative">
        <div className="stadium-lights"></div>
        <div className="max-w-4xl mx-auto py-3 sm:py-8 relative z-10">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-orbitron font-bold gradient-text mb-4">
              My Profile
            </h1>
            <p className="text-blue-200 max-w-md mx-auto">
              Join the ultimate football organizer community and connect with players worldwide
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            {/* Login/Register Toggle */}
            <div className="glass-card p-2 mb-8 rounded-2xl">
              <div className="flex">
                <button
                  onClick={() => setShowLogin(true)}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    showLogin 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform -translate-y-0.5' 
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowLogin(false)}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    !showLogin 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg transform -translate-y-0.5' 
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>
            
            {/* Form */}
            <div className="transition-all duration-500 ease-in-out">
              {showLogin ? <LoginForm /> : <RegisterForm />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show warning if email is not confirmed
  if (user && emailNotConfirmed) {
    return (
      <div className="min-h-screen profile-stadium-bg p-4 pb-24 relative">
        <div className="stadium-lights"></div>
        <div className="max-w-2xl mx-auto py-16 text-center relative z-10">
          <div className="glass-card p-12">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-orbitron font-bold text-yellow-400 mb-6">
              Email Confirmation Required
            </h2>
            <div className="space-y-4 mb-8">
              <p className="text-white text-lg">
                Please check the confirmation email sent to:
              </p>
              <div className="badge-glass text-blue-300 font-mono text-sm">
                {user.email}
              </div>
              <p className="text-blue-200 text-sm">
                Didn't receive the email? Check your spam folder or try refreshing after confirmation.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="glass-button-primary px-8 py-3 rounded-xl font-semibold transition-smooth"
              >
                I've Confirmed - Refresh
              </button>
              <button 
                onClick={handleLogout}
                className="glass-button px-8 py-3 rounded-xl font-semibold transition-smooth"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile page if user is authenticated
  return (
    <div className="min-h-screen profile-stadium-bg p-2 sm:p-4 pb-24 relative">
      <div className="stadium-lights"></div>
      <div className="max-w-6xl mx-auto py-3 sm:py-8 relative z-10">
        {/* Header */}
        <div className="glass-card p-3 sm:p-6 mb-4 sm:mb-8 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-glow">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-orbitron font-bold gradient-text">
                  My Profile
                </h1>
                <p className="text-blue-200 text-xs sm:text-sm">
                  Welcome back, {user.email}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="glass-button px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-smooth hover:bg-red-500/20 hover:border-red-400/50 text-sm sm:text-base mt-2 sm:mt-0 w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Display Section */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {profile && !editing ? (
              <>
                <div className="glass-card p-4 sm:p-6 rounded-xl card-hover">
                  <ProfileCard
                    username={profile.username}
                    avatarUrl={profile.avatar_url}
                    position={profile.position || ''}
                    stars={profile.stars || 0}
                  />
                </div>
                <button 
                  onClick={() => setEditing(true)}
                  className="w-full glass-button-primary py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-semibold transition-smooth"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </>
            ) : (
              <div className="glass-card p-4 sm:p-8 text-center rounded-xl">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-orbitron font-bold text-white mb-3 sm:mb-4">
                  Create Your Profile
                </h3>
                <p className="text-blue-200 mb-1 sm:mb-2 text-sm sm:text-base">
                  You haven't set up your profile yet.
                </p>
                <p className="text-xs sm:text-sm text-blue-300">
                  Complete the form to join the football community!
                </p>
              </div>
            )}
          </div>

          {/* Profile Form Section */}
          {(editing || !profile) && (
            <div className="xl:col-span-1 glass-card p-4 sm:p-6 rounded-xl">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-orbitron font-bold text-white">
                  Profile Information
                </h2>
              </div>
              <ProfileForm onSaved={handleProfileUpdated} />
              {editing && (
                <button 
                  onClick={() => setEditing(false)}
                  className="w-full mt-4 sm:mt-6 glass-button py-2.5 sm:py-3 rounded-xl font-semibold transition-smooth text-sm sm:text-base"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* Match Requests Section - Only visible when profile is complete */}
          {profile && !editing && (
            <div className="xl:col-span-1">
              <RequestsPanel creatorId={user.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

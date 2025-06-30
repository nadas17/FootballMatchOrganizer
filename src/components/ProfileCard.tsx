import React from 'react';

interface ProfileCardProps {
  username: string;
  avatarUrl?: string;
  position: string;
  stars: number;
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  username, 
  avatarUrl, 
  position, 
  stars, 
  className = "" 
}) => {
  const displayName = username && username.length > 0 ? username : "User";
  const safeInitial = username && username.trim().length > 0
    ? encodeURIComponent(username.trim()[0].toUpperCase())
    : "U"; // Default to 'U' if username is empty or invalid

  return (
    <div className={`glass-card p-4 sm:p-6 flex flex-col items-center text-center space-y-3 sm:space-y-4 ${className}`}>
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${displayName}'s avatar`}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/20 object-cover shadow-lg bg-white/10"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/20 bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl sm:text-4xl font-bold select-none">
              {displayName[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-1 sm:space-y-2">
        <h2 className="font-orbitron text-xl sm:text-2xl font-bold text-white drop-shadow-md truncate max-w-full">{displayName}</h2>
        <p className="text-xs sm:text-sm text-blue-200 capitalize tracking-wide">{position}</p>
      </div>
      
      <div className="flex items-center space-x-2 bg-yellow-400/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">
        <span className="text-yellow-300 text-lg sm:text-xl">★</span>
        <span className="text-white font-bold text-base sm:text-lg">{stars}</span>
        <span className="text-yellow-100 text-xs">stars</span>
      </div>
    </div>
  );
};

export default ProfileCard;
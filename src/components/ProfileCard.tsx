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

  const defaultAvatar = `https://via.placeholder.com/150/2563eb/ffffff?text=${safeInitial}`;

  return (
    <div className={`glass-card p-6 flex flex-col items-center text-center space-y-4 ${className}`}>
      <div className="relative">
        <img
          src={avatarUrl || defaultAvatar}
          alt={`${displayName}'s avatar`}
          className="w-24 h-24 rounded-full border-2 border-white/20 object-cover shadow-lg bg-white/10"
        />
      </div>
      
      <div className="space-y-2">
        <h2 className="font-orbitron text-2xl font-bold text-white drop-shadow-md">{displayName}</h2>
        <p className="text-sm text-blue-200 capitalize tracking-wide">{position}</p>
      </div>
      
      <div className="flex items-center space-x-2 bg-yellow-400/20 px-4 py-2 rounded-full shadow-sm">
        <span className="text-yellow-300 text-xl">★</span>
        <span className="text-white font-bold text-lg">{stars}</span>
        <span className="text-yellow-100 text-xs">stars</span>
      </div>
    </div>
  );
};

export default ProfileCard;
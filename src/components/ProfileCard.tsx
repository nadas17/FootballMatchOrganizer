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
  const defaultAvatar = "https://via.placeholder.com/150/2563eb/ffffff?text=" + username[0];

  return (
    <div className={`glass-card p-6 flex flex-col items-center text-center space-y-4 ${className}`}>
      <div className="relative">
        <img
          src={avatarUrl || defaultAvatar}
          alt={`${username}'s avatar`}
          className="w-24 h-24 rounded-full border-2 border-white/20 object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <h2 className="font-orbitron text-xl font-bold text-white">{username}</h2>
        <p className="text-sm text-blue-200 capitalize">{position}</p>
      </div>
      
      <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full">
        <span className="text-yellow-400 text-lg">★</span>
        <span className="text-white font-bold">{stars}</span>
        <span className="text-yellow-200 text-sm">yıldız</span>
      </div>
    </div>
  );
};

export default ProfileCard;
import React from "react";
import footballAvatar from "@/assets/football-avatar.png";

interface ProfileCardProps {
  username?: string;
  avatarUrl?: string;
  position?: string;
  stars?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  username = "User",
  position = "Player",
  stars = 0,
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
      <div className="relative mb-4">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-blue-400/50 shadow-lg">
          <img
            src={footballAvatar}
            alt="Football Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-xs text-white">●</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{username}</h3>
      <p className="text-blue-200 mb-3">{position}</p>
      
      <div className="flex items-center justify-center space-x-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < stars ? 'text-yellow-400' : 'text-gray-600'
            }`}
          >
            ★
          </span>
        ))}
        <span className="text-blue-200 ml-2">({stars}/5)</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-blue-200">Position:</span>
          <span className="text-white">{position}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-200">Rating:</span>
          <span className="text-white">{stars} stars</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
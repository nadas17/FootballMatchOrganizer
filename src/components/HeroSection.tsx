import React, { memo } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CreateMatchButton from "@/components/CreateMatchButton";

interface HeroSectionProps {
  creatorNickname: string | null;
}

const HeroSection = memo(({ creatorNickname }: HeroSectionProps) => {
  return (
    <div className="text-center mb-8 sm:mb-12 animate-fade-in">
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-4 font-orbitron leading-tight">
        PITCH MASTERS
      </h1>
      <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent font-orbitron leading-tight">
        Elite Football Club
      </h2>
      <p className="text-base sm:text-xl text-white/90 mt-4 sm:mt-6 max-w-2xl mx-auto font-inter drop-shadow-lg px-4">
        Join the premier football community where passion meets excellence. Connect with skilled players, organize competitive matches, and elevate your game.
      </p>
      <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center items-center w-full max-w-sm sm:max-w-md mx-auto px-4 sm:px-0">
        <CreateMatchButton />
        <Link to="/profile" className="w-full sm:w-auto">
          <Button
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-full text-base sm:text-lg shadow-lg transition-all duration-300 hover:shadow-purple-500/25 hover:scale-105 min-h-[44px]"
          >
            My Profile
          </Button>
        </Link>
      </div>
      {creatorNickname && (
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 max-w-xs sm:max-w-md mx-auto">
          <p className="text-blue-400 text-sm">Welcome back, {creatorNickname}! 👋</p>
        </div>
      )}
    </div>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
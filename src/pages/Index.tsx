import React, { useState, useCallback } from 'react';
import JoinMatchForm from "@/components/JoinMatchForm";
import HeroSection from "@/components/HeroSection";
import UpcomingMatchesSection from "@/components/UpcomingMatchesSection";
import SidebarSection from "@/components/SidebarSection";
import { useMatches } from "@/hooks/useMatches";
import { useRequestCounts } from "@/hooks/useRequestCounts";
import { getCreatorInfo } from "@/utils/localStorage";

const Index: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const { creatorId, creatorNickname } = getCreatorInfo();
  
  const { upcomingMatches, nextMatch, loading, refetchMatches } = useMatches();
  const { requestCounts } = useRequestCounts(creatorId);

  const handleJoinSuccess = useCallback(() => {
    setSelectedMatch(null);
    refetchMatches();
  }, [refetchMatches]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/ff1b8d41-7e80-4428-b2cf-e467c86fc867.png')`,
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      >
        <div className="absolute inset-0 bg-black/60 md:backdrop-blur-[1px]"></div>
      </div>
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-24">
        <HeroSection creatorNickname={creatorNickname} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <UpcomingMatchesSection
              upcomingMatches={upcomingMatches}
              nextMatch={nextMatch}
              onJoinClick={setSelectedMatch}
              requestCounts={requestCounts}
              creatorId={creatorId}
            />
            {selectedMatch && (
              <JoinMatchForm
                matchId={selectedMatch}
                onCancel={() => setSelectedMatch(null)}
                onSuccess={handleJoinSuccess}
              />
            )}
          </div>
          <SidebarSection nextMatch={nextMatch} creatorId={creatorId} />
        </div>
      </div>
    </div>
  );
};

export default Index;

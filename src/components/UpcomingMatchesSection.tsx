import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MatchCard from "@/components/MatchCard";
import { MatchData } from "@/types/match";

interface UpcomingMatchesSectionProps {
  upcomingMatches: MatchData[];
  nextMatch: MatchData | undefined;
  onJoinClick: (matchId: string) => void;
  requestCounts: Record<string, number>;
  creatorId: string | null;
}

const UpcomingMatchesSection = memo(({
  upcomingMatches,
  nextMatch,
  onJoinClick,
  requestCounts,
  creatorId
}: UpcomingMatchesSectionProps) => {
  return (
    <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
      <Card className="glass-card border-none shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            Upcoming Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                isNextMatch={nextMatch?.id === match.id}
                onJoinClick={() => onJoinClick(match.id)}
                pendingRequestsCount={requestCounts[match.id] || 0}
                isCreator={match.creator_id === creatorId}
              />
            ))
          ) : (
            <div className="text-center text-white/70 py-8">
              <p>No upcoming matches available.</p>
              <p className="text-sm mt-2">Be the first to create one!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

UpcomingMatchesSection.displayName = 'UpcomingMatchesSection';

export default UpcomingMatchesSection;
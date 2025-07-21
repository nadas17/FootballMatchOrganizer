import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountdownTimer from "@/components/CountdownTimer";
import RequestsPanel from "@/components/RequestsPanel";
import WeatherWidget from "@/components/WeatherWidget";
import { MatchData } from "@/types/match";

interface SidebarSectionProps {
  nextMatch: MatchData | undefined;
  creatorId: string | null;
}

const SidebarSection = memo(({ nextMatch, creatorId }: SidebarSectionProps) => {
  return (
    <div className="space-y-6">
      {nextMatch && (
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CountdownTimer match={nextMatch} />
        </div>
      )}
      {creatorId && (
        <div id="requests-panel" className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          <RequestsPanel creatorId={creatorId} />
        </div>
      )}
      <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <Card className="glass-card border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-orbitron text-white">Playing Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            {nextMatch && nextMatch.location_lat && nextMatch.location_lng ? (
              <WeatherWidget
                lat={nextMatch.location_lat}
                lng={nextMatch.location_lng}
                location={nextMatch.location || undefined}
                className="w-full"
              />
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">🌤️</div>
                <div className="text-2xl font-bold text-white">Weather Info</div>
                <div className="text-white/70 mt-2">No upcoming match with location</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

SidebarSection.displayName = 'SidebarSection';

export default SidebarSection;
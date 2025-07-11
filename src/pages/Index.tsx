import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MatchCard from "@/components/MatchCard";
import CountdownTimer from "@/components/CountdownTimer";
import CreateMatchButton from "@/components/CreateMatchButton";
import JoinMatchForm from "@/components/JoinMatchForm";
import RequestsPanel from "@/components/RequestsPanel";
import WeatherWidget from "@/components/WeatherWidget";
import { supabase } from "@/integrations/supabase/client";
import { MatchData } from "@/types/match";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCreatorInfo } from "@/utils/localStorage";

const Index: React.FC = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [totalRequestCount, setTotalRequestCount] = useState(0);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const { toast } = useToast();

  const { creatorId, creatorNickname, isCreator } = getCreatorInfo();

  useEffect(() => {
    fetchMatches();
    if (creatorId) {
      fetchRequestCounts();
      const channel = supabase
        .channel('requests_count_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_requests'
          },
          () => {
            fetchRequestCounts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [creatorId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (matchesError) throw matchesError;

      const { data: participantsData, error: participantsError } = await supabase
        .from('match_participants')
        .select('*');

      if (participantsError) throw participantsError;

      const matchesWithParticipants: MatchData[] = matchesData?.map(match => ({
        ...match,
        participants: participantsData?.filter(p => p.match_id === match.id) || []
      })) || [];

      const sortedMatches = matchesWithParticipants.sort((a, b) => {
        const now = new Date();
        const getMatchDateTime = (match: MatchData) => {
          if (!match.match_date || !match.match_time) return null;
          const [year, month, day] = match.match_date.split('-').map(Number);
          const [hours, minutes, seconds] = match.match_time.split(':').map(Number);
          return new Date(year, month - 1, day, hours, minutes, seconds);
        };
        const aDateTime = getMatchDateTime(a);
        const bDateTime = getMatchDateTime(b);
        const isAUpcoming = aDateTime ? aDateTime > now : false;
        const isBUpcoming = bDateTime ? bDateTime > now : false;
        if (isAUpcoming && !isBUpcoming) return -1;
        if (!isAUpcoming && isBUpcoming) return 1;
        if (isAUpcoming && isBUpcoming && aDateTime && bDateTime) {
          return aDateTime.getTime() - bDateTime.getTime();
        }
        if (aDateTime && bDateTime) {
          return bDateTime.getTime() - aDateTime.getTime();
        }
        if (aDateTime && !bDateTime) return -1;
        if (!aDateTime && bDateTime) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setMatches(sortedMatches);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestCounts = async () => {
    if (!creatorId) return;
    try {
      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          match_id,
          matches!inner(creator_id)
        `)
        .eq('matches.creator_id', creatorId)
        .eq('status', 'pending');
      if (error) throw error;
      const counts: Record<string, number> = {};
      let total = 0;
      data?.forEach(request => {
        counts[request.match_id] = (counts[request.match_id] || 0) + 1;
        total++;
      });
      setRequestCounts(counts);
      setTotalRequestCount(total);
    } catch {}
  };

  const handleJoinSuccess = () => {
    setSelectedMatch(null);
    fetchMatches();
    if (creatorId) fetchRequestCounts();
  };

  const now = new Date();
  const getMatchDateTime = (match: MatchData) => {
    if (!match.match_date || !match.match_time) return null;
    const isoString = `${match.match_date}T${match.match_time}`;
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) {
      const [year, month, day] = match.match_date.split('-').map(Number);
      const [hours, minutes, seconds] = match.match_time.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    return dateObj;
  };

  const upcomingMatches = matches.filter(m => {
    const matchDateTime = getMatchDateTime(m);
    return matchDateTime ? matchDateTime > now : false;
  });

  const pastMatches = matches.filter(m => {
    const matchDateTime = getMatchDateTime(m);
    return !matchDateTime || matchDateTime <= now;
  });

  const nextMatch = upcomingMatches[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url('/lovable-uploads/ff1b8d41-7e80-4428-b2cf-e467c86fc867.png')`
      }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
      </div>
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-6 sm:py-8 pb-24">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x mb-4 font-orbitron">PITCH MASTERS</h1>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x delay-300 font-orbitron">Elite Football Club</h2>
          <p className="text-xl text-white/90 mt-6 max-w-2xl mx-auto font-inter drop-shadow-lg">
            Join the premier football community where passion meets excellence. Connect with skilled players, organize competitive matches, and elevate your game.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-4 justify-center items-center w-full max-w-md mx-auto">
            <CreateMatchButton />
            <Link to="/profile" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transition-all duration-300 hover:shadow-purple-500/25 hover:scale-105"
              >
                My Profile
              </Button>
            </Link>
          </div>
          {creatorNickname && (
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 max-w-md mx-auto">
              <p className="text-blue-400 text-sm">Welcome back, {creatorNickname}! 👋</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                        onJoinClick={() => setSelectedMatch(match.id)}
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
            {selectedMatch && (
              <JoinMatchForm
                matchId={selectedMatch}
                onCancel={() => setSelectedMatch(null)}
                onSuccess={handleJoinSuccess}
              />
            )}
            {pastMatches.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <Card className="glass-card border-none shadow-2xl">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger className="p-6 hover:no-underline w-full flex justify-between items-center">
                        <h3 className="text-2xl font-orbitron text-white">Match Archive</h3>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 space-y-4">
                        {pastMatches.map(match => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            onJoinClick={() => {}}
                            isArchived={true}
                            isCreator={match.creator_id === creatorId}
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </div>
            )}
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Index;

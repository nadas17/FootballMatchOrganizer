import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MatchCard from "@/components/MatchCard";
import CountdownTimer from "@/components/CountdownTimer";
import CreateMatchButton from "@/components/CreateMatchButton";
import JoinMatchForm from "@/components/JoinMatchForm";
import RequestsPanel from "@/components/RequestsPanel";
import NotificationBanner from "@/components/NotificationBanner";
import WeatherWidget from "@/components/WeatherWidget";
import { supabase } from "@/integrations/supabase/client";
import { MatchData, MatchRequest } from "@/types/match";
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

  // Get creator info from localStorage using utility
  const { creatorId, creatorNickname, isCreator } = getCreatorInfo();

  useEffect(() => {
    console.log('=== INDEX COMPONENT MOUNTED ===');
    console.log('Creator info:', { creatorId, creatorNickname, isCreator });
    fetchMatches();
    if (creatorId) {
      fetchRequestCounts();
      
      // Set up real-time subscription for request counts
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
            console.log('Request count update received');
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
      console.log('=== FETCHING MATCHES ===');
      setLoading(true);

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });
      
      console.log('Matches fetch result:', { matchesData, matchesError });
      
      if (matchesError) throw matchesError;

      // Fetch participants for each match
      const { data: participantsData, error: participantsError } = await supabase
        .from('match_participants')
        .select('*');
      
      console.log('Participants fetch result:', { participantsData, participantsError });
      
      if (participantsError) throw participantsError;

      // Combine matches with their participants
      const matchesWithParticipants: MatchData[] = matchesData?.map(match => ({
        id: match.id,
        title: match.title,
        match_date: match.match_date,
        match_time: match.match_time,
        location: match.location,
        location_lat: match.location_lat,
        location_lng: match.location_lng,
        description: match.description,
        price_per_player: match.price_per_player,
        max_players: match.max_players,
        current_players: match.current_players,
        created_at: match.created_at,
        creator_id: match.creator_id,
        creator_nickname: match.creator_nickname,
        participants: participantsData?.filter(p => p.match_id === match.id) || []
      })) || [];

      console.log('Combined matches with participants:', matchesWithParticipants);

      // Sort matches: upcoming matches first, then past matches
      const sortedMatches = matchesWithParticipants.sort((a, b) => {
        const now = new Date();
        
        const getMatchDateTime = (match: MatchData) => {
          if (!match.match_date || !match.match_time) return null;
          return new Date(`${match.match_date}T${match.match_time}`);
        };
        
        const aDateTime = getMatchDateTime(a);
        const bDateTime = getMatchDateTime(b);
        
        const isAUpcoming = aDateTime ? aDateTime > now : false;
        const isBUpcoming = bDateTime ? bDateTime > now : false;

        // Rule 1: Upcoming matches come before past/undated matches.
        if (isAUpcoming && !isBUpcoming) return -1;
        if (!isAUpcoming && isBUpcoming) return 1;

        // Rule 2: If both are upcoming, sort by date ascending (soonest first).
        if (isAUpcoming && isBUpcoming && aDateTime && bDateTime) {
            return aDateTime.getTime() - bDateTime.getTime();
        }

        // Rule 3: If both are past or undated, sort by date descending (most recent past match first).
        // If one has a date and the other doesn't, the one with the date comes first.
        if (aDateTime && bDateTime) {
            return bDateTime.getTime() - aDateTime.getTime();
        }
        if (aDateTime && !bDateTime) return -1;
        if (!aDateTime && bDateTime) return 1;

        // Rule 4: If neither has a date, sort by creation date descending (newest first).
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log('Final sorted matches:', sortedMatches);
      setMatches(sortedMatches);
    } catch (error) {
      console.error('=== ERROR FETCHING MATCHES ===');
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('=== MATCHES FETCH COMPLETE ===');
    }
  };

  const fetchRequestCounts = async () => {
    if (!creatorId) return;

    try {
      console.log('=== FETCHING REQUEST COUNTS ===');
      console.log('Creator ID for counts:', creatorId);
      
      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          match_id,
          matches!inner(creator_id)
        `)
        .eq('matches.creator_id', creatorId)
        .eq('status', 'pending');

      console.log('Request counts fetch result:', { data, error });

      if (error) throw error;

      const counts: Record<string, number> = {};
      let total = 0;
      data?.forEach(request => {
        counts[request.match_id] = (counts[request.match_id] || 0) + 1;
        total++;
      });

      console.log('Processed request counts:', counts);
      console.log('Total request count:', total);
      setRequestCounts(counts);
      setTotalRequestCount(total);
    } catch (error) {
      console.error('=== ERROR FETCHING REQUEST COUNTS ===');
      console.error('Error details:', error);
    }
  };

  const handleJoinSuccess = () => {
    console.log('=== JOIN SUCCESS CALLBACK ===');
    setSelectedMatch(null);
    // Refresh matches data and request counts
    fetchMatches();
    if (creatorId) {
      fetchRequestCounts();
    }
  };

  const handleNotificationClick = () => {
    setShowRequestsPanel(true);
    // Scroll to requests panel
    setTimeout(() => {
      const requestsPanel = document.getElementById('requests-panel');
      if (requestsPanel) {
        requestsPanel.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const now = new Date();
  const getMatchDateTime = (match: MatchData) => {
    if (!match.match_date || !match.match_time) return null;
    return new Date(`${match.match_date}T${match.match_time}`);
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
      {/* Stadium Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url('/lovable-uploads/ff1b8d41-7e80-4428-b2cf-e467c86fc867.png')`
      }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x mb-4 font-orbitron">FOOTBALL WARRIORS</h1>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x delay-300 font-orbitron">Organization</h2>
          <p className="text-xl text-white/90 mt-6 max-w-2xl mx-auto font-inter drop-shadow-lg">
            Are you ready for the greatest battle on the field? Real warriors meet here. Build your team, defeat your opponents!
          </p>
          
          {/* Floating Action Button */}
          <div className="mt-8">
            <CreateMatchButton />
          </div>

          {/* Creator Welcome Message */}
          {creatorNickname && (
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 max-w-md mx-auto">
              <p className="text-blue-400 text-sm">Welcome back, {creatorNickname}! 👋</p>
            </div>
          )}
        </div>

        {/* Notification Banner for Creators */}
        {isCreator && totalRequestCount > 0 && (
          <NotificationBanner 
            requestCount={totalRequestCount} 
            onClick={handleNotificationClick}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Matches Section */}
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
                        onJoinClick={() => {
                          console.log('Join button clicked for match:', match.id);
                          setSelectedMatch(match.id);
                        }}
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

            {/* Join Request Form */}
            {selectedMatch && (
              <JoinMatchForm 
                matchId={selectedMatch} 
                onCancel={() => {
                  console.log('Join form cancelled');
                  setSelectedMatch(null);
                }}
                onSuccess={handleJoinSuccess}
              />
            )}

            {/* Past Matches Section */}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            {nextMatch && (
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <CountdownTimer match={nextMatch} />
              </div>
            )}

            {/* Requests Panel for Creators */}
            {creatorId && (
              <div id="requests-panel" className="animate-fade-in" style={{ animationDelay: '250ms' }}>
                <RequestsPanel creatorId={creatorId} />
              </div>
            )}

            {/* Weather Widget - Playing Conditions */}
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

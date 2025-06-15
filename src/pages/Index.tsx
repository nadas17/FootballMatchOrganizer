
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, Euro, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import MatchCard from "@/components/MatchCard";
import CountdownTimer from "@/components/CountdownTimer";
import CreateMatchButton from "@/components/CreateMatchButton";
import JoinMatchForm from "@/components/JoinMatchForm";
import { supabase } from "@/integrations/supabase/client";
import { MatchData } from "@/types/match";

const Index = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });
      
      if (matchesError) throw matchesError;

      // Fetch participants for each match
      const { data: participantsData, error: participantsError } = await supabase
        .from('match_participants')
        .select('*');
      
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
        participants: participantsData?.filter(p => p.match_id === match.id) || []
      })) || [];

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

      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMatch = async (matchId: string, playerName: string, team: string) => {
    try {
      // Insert new participant
      const { error } = await supabase
        .from('match_participants')
        .insert({
          match_id: matchId,
          participant_name: playerName,
          team: team
        });
      
      if (error) throw error;

      // Update current_players count
      const match = matches.find(m => m.id === matchId);
      if (match) {
        const { error: updateError } = await supabase
          .from('matches')
          .update({ current_players: match.current_players + 1 })
          .eq('id', matchId);
        
        if (updateError) throw updateError;
      }

      // Refresh matches data
      await fetchMatches();
      toast({
        title: "Successfully joined! ⚽",
        description: `Welcome to the match, ${playerName}!`
      });
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error joining match:', error);
      toast({
        title: "Error",
        description: "Failed to join match",
        variant: "destructive"
      });
    }
  };

  const nextMatch = matches.filter(m => {
    if (!m.match_date || !m.match_time) return false;
    const matchDateTime = new Date(`${m.match_date}T${m.match_time}`);
    return matchDateTime > new Date();
  })[0]; // Take the first one since they're already sorted

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Stadium Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url('/lovable-uploads/ff1b8d41-7e80-4428-b2cf-e467c86fc867.png')`
      }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
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
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Matches Section */}
            <Card className="glass-card border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Live Matches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matches.length > 0 ? (
                  matches.map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      isNextMatch={nextMatch?.id === match.id} 
                      onJoinClick={() => setSelectedMatch(match.id)} 
                    />
                  ))
                ) : (
                  <div className="text-center text-white/70 py-8">
                    <p>No matches available at the moment.</p>
                    <p className="text-sm mt-2">Be the first to create a match!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join Match Form */}
            {selectedMatch && (
              <JoinMatchForm 
                matchId={selectedMatch} 
                onJoin={handleJoinMatch} 
                onCancel={() => setSelectedMatch(null)} 
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            {nextMatch && <CountdownTimer match={nextMatch as any} />}

            {/* Quick Stats */}
            <Card className="glass-card border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-orbitron text-white">Match Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Active Matches</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {matches.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Players</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {matches.reduce((acc, match) => acc + match.current_players, 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Available Spots</span>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {matches.reduce((acc, match) => acc + ((match.max_players || 0) - match.current_players), 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Weather Widget */}
            <Card className="glass-card border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-orbitron text-white">Playing Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-2">⛅</div>
                  <div className="text-2xl font-bold text-white">18°C</div>
                  <div className="text-white/70">Perfect for football!</div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Wind</span>
                      <span className="text-white">12 km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Humidity</span>
                      <span className="text-white">65%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


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

// Mock data - in real app this would come from your Supabase
const mockMatches = [
  {
    id: 1,
    title: "Weekend Champions League",
    match_date: "2024-01-20",
    match_time: "18:00",
    location: "Stadion Narodowy, Warsaw",
    location_lat: 52.2397,
    location_lng: 21.0129,
    description: "Competitive 11v11 match with professional referee",
    price_per_player: 25,
    max_players: 22,
    current_players: 18,
    participants: [
      { id: 1, participant_name: "Marcus Silva", team: "A" },
      { id: 2, participant_name: "Roberto Carlos", team: "A" },
      { id: 3, participant_name: "Diego Martinez", team: "B" },
      { id: 4, participant_name: "Alex Johnson", team: "B" },
    ]
  },
  {
    id: 2,
    title: "Friday Night Football",
    match_date: "2024-01-19",
    match_time: "20:30",
    location: "Orlik Park Skaryszewski",
    location_lat: 52.2297,
    location_lng: 21.0622,
    description: "Casual 7v7 game under floodlights",
    price_per_player: null,
    max_players: 14,
    current_players: 12,
    participants: [
      { id: 5, participant_name: "Cristiano Jr", team: "A" },
      { id: 6, participant_name: "Lionel Park", team: "B" },
    ]
  }
];

const Index = () => {
  const [matches, setMatches] = useState(mockMatches);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const { toast } = useToast();

  const handleJoinMatch = (matchId: number, playerName: string, team: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? {
            ...match,
            current_players: match.current_players + 1,
            participants: [...match.participants, {
              id: Date.now(),
              participant_name: playerName,
              team
            }]
          }
        : match
    ));
    
    toast({
      title: "Successfully joined! ⚽",
      description: `Welcome to the match, ${playerName}!`,
    });
    
    setSelectedMatch(null);
  };

  const nextMatch = matches
    .filter(m => new Date(`${m.match_date}T${m.match_time}`) > new Date())
    .sort((a, b) => new Date(`${a.match_date}T${a.match_time}`).getTime() - new Date(`${b.match_date}T${b.match_time}`).getTime())[0];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Stadium Background Image */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/0fd39a8d-c556-4aef-b409-28418264a43f.png')`
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      </div>

      {/* Stadium Lights Effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-yellow-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-gradient-radial from-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x mb-4 font-orbitron">
            FOOTBALL
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x delay-300 font-orbitron">
            ARENA
          </h2>
          <p className="text-xl text-white/90 mt-6 max-w-2xl mx-auto font-inter drop-shadow-lg">
            Join the ultimate football experience. Connect with players, organize matches, and feel the stadium atmosphere.
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
                {matches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    isNextMatch={nextMatch?.id === match.id}
                    onJoinClick={() => setSelectedMatch(match.id)}
                  />
                ))}
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
            {nextMatch && (
              <CountdownTimer match={nextMatch} />
            )}

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
                    {matches.reduce((acc, match) => acc + (match.max_players - match.current_players), 0)}
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

      {/* Enhanced Football floating animation - brought to foreground */}
      <div className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-bounce shadow-2xl flex items-center justify-center text-3xl z-50 hover:scale-110 transition-transform cursor-pointer">
        ⚽
      </div>
      
      {/* Additional floating footballs for more dynamic effect */}
      <div className="fixed top-20 left-10 w-12 h-12 bg-gradient-to-br from-orange-300 to-red-400 rounded-full animate-pulse shadow-lg flex items-center justify-center text-xl z-40 opacity-70">
        ⚽
      </div>
      <div className="fixed bottom-1/3 left-20 w-8 h-8 bg-gradient-to-br from-orange-200 to-red-300 rounded-full animate-bounce shadow-md flex items-center justify-center text-sm z-30 opacity-50 animation-delay-500">
        ⚽
      </div>
    </div>
  );
};

export default Index;

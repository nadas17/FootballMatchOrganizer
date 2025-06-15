import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Euro, ChevronDown, ChevronUp, Calendar } from "lucide-react";

interface Match {
  id: number;
  title: string;
  match_date: string;
  match_time: string;
  location: string;
  location_lat?: number;
  location_lng?: number;
  description: string;
  price_per_player: number | null;
  max_players: number;
  current_players: number;
  participants: Array<{
    id: number;
    participant_name: string;
    team: string;
  }>;
}

interface MatchCardProps {
  match: Match;
  isNextMatch?: boolean;
  onJoinClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isNextMatch, onJoinClick }) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const isFull = match.current_players >= match.max_players;
  
  const teamA = match.participants.filter(p => p.team === 'A');
  const teamB = match.participants.filter(p => p.team === 'B');

  return (
    <Card className={`glass-card border-none shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
      isNextMatch ? 'ring-2 ring-emerald-400/50 animate-pulse-slow' : ''
    }`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white font-orbitron mb-2">
              {match.title}
              {isNextMatch && (
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
                  NEXT MATCH
                </Badge>
              )}
            </h3>
            <p className="text-white/70 text-sm">{match.description}</p>
          </div>
          
          {isNextMatch && (
            <div className="relative">
              <Button
                onClick={onJoinClick}
                disabled={isFull}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 animate-pulse-ring"
              >
                ⚽
              </Button>
            </div>
          )}
        </div>

        {/* Match Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-white/80">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">{new Date(match.match_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm">{match.match_time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-sm truncate">{match.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <Euro className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">
              {match.price_per_player ? `${match.price_per_player} PLN` : 'Free'}
            </span>
          </div>
        </div>

        {/* Players Counter */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-300"
          >
            <Users className="w-4 h-4 mr-2 text-purple-400" />
            <span className="font-semibold">
              Players: {match.current_players}/{match.max_players}
            </span>
            {showParticipants ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
          
          {!isNextMatch && (
            <Button
              onClick={onJoinClick}
              disabled={isFull}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isFull
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-emerald-500/25 hover:scale-105'
              }`}
            >
              {isFull ? 'Match Full' : 'Join Match'}
            </Button>
          )}
        </div>

        {/* Participants List */}
        {showParticipants && (
          <div className="mt-4 p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  Team A ({teamA.length})
                </h4>
                {teamA.length > 0 ? (
                  <ul className="space-y-1">
                    {teamA.map((player) => (
                      <li key={player.id} className="text-white/80 text-sm bg-emerald-500/10 px-2 py-1 rounded">
                        {player.participant_name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/50 text-sm italic">No players yet</p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  Team B ({teamB.length})
                </h4>
                {teamB.length > 0 ? (
                  <ul className="space-y-1">
                    {teamB.map((player) => (
                      <li key={player.id} className="text-white/80 text-sm bg-blue-500/10 px-2 py-1 rounded">
                        {player.participant_name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/50 text-sm italic">No players yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;

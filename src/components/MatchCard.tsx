
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Calendar, Bell } from "lucide-react";
import { MatchData } from "@/types/match";

interface MatchCardProps {
  match: MatchData;
  isNextMatch?: boolean;
  onJoinClick: () => void;
  isArchived?: boolean;
  pendingRequestsCount?: number;
  isCreator?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  isNextMatch, 
  onJoinClick, 
  isArchived, 
  pendingRequestsCount = 0,
  isCreator = false 
}) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const isFull = match.current_players >= (match.max_players || 0);
  
  const teamA = match.participants.filter(p => p.team === 'A');
  const teamB = match.participants.filter(p => p.team === 'B');

  return (
    <Card className={`glass-card border-none shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
      isNextMatch ? 'ring-2 ring-emerald-400/50 animate-pulse-slow' : ''
    } ${isArchived ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white font-orbitron mb-2">
              {match.title || 'Untitled Match'}
              {isNextMatch && (
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
                  NEXT MATCH
                </Badge>
              )}
              {isCreator && (
                <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  YOUR MATCH
                </Badge>
              )}
            </h3>
            <p className="text-white/70 text-sm">{match.description || 'No description'}</p>
            {match.creator_nickname && (
              <p className="text-white/50 text-xs mt-1">Created by: {match.creator_nickname}</p>
            )}
          </div>
          
          {isNextMatch && !isCreator && (
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

          {pendingRequestsCount > 0 && isCreator && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {pendingRequestsCount} Request{pendingRequestsCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Match Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-white/80">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">
              {match.match_date ? new Date(match.match_date).toLocaleDateString() : 'TBD'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm">{match.match_time || 'TBD'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="w-4 h-4 text-orange-400" />
            {match.location_lat && match.location_lng ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${match.location_lat},${match.location_lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm truncate hover:text-orange-300 transition-colors"
              >
                {match.location || 'View on Map'}
              </a>
            ) : (
              <span className="text-sm truncate">{match.location || 'TBD'}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <div className="text-yellow-400 font-bold text-sm">zł</div>
            <span className="text-sm">
              {match.price_per_player !== null ? match.price_per_player : 'Free'}
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
              Players: {match.current_players}/{match.max_players || 0}
            </span>
            {showParticipants ? (
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </Button>
          
          {!isNextMatch && !isArchived && !isCreator && (
            <Button
              onClick={onJoinClick}
              disabled={isFull}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isFull
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-emerald-500/25 hover:scale-105'
              }`}
            >
              {isFull ? 'Match Full' : 'Request to Join'}
            </Button>
          )}
          {isArchived && (
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
              ARCHIVED
            </Badge>
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

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Calendar, Bell, Map } from "lucide-react";
import { MatchData } from "@/types/match";
import LocationMap from "./LocationMap";
import WeatherWidget from "./WeatherWidget";

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
  const [showMap, setShowMap] = useState(false);
  
  // Calculate actual player count from participants array
  const actualPlayerCount = match.participants.length;
  const isFull = actualPlayerCount >= (match.max_players || 0);
  
  // Group participants by team and position
  const teamAParticipants = match.participants.filter(p => p.team === 'A');
  const teamBParticipants = match.participants.filter(p => p.team === 'B');
  const unassignedParticipants = match.participants.filter(p => !p.team || (p.team !== 'A' && p.team !== 'B'));

  const groupByPosition = (participants: typeof match.participants) => ({
    goalkeeper: participants.filter(p => p.position === 'goalkeeper'),
    defense: participants.filter(p => p.position === 'defense'),
    midfield: participants.filter(p => p.position === 'midfield'),
    attack: participants.filter(p => p.position === 'attack'),
    unassigned: participants.filter(p => !p.position)
  });

  const hasLocation = match.location_lat && match.location_lng;

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'goalkeeper': return '🥅';
      case 'defense': return '🛡️';
      case 'midfield': return '⚡';
      case 'attack': return '⚽';
      default: return '👤';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'goalkeeper': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'defense': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'midfield': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'attack': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-white/70 bg-white/10 border-white/30';
    }
  };

  const renderTeamSection = (teamName: string, participants: typeof match.participants, teamColor: string) => {
    if (participants.length === 0) return null;
    
    const positionGroups = groupByPosition(participants);
    
    return (
      <div className="mb-6">
        <h3 className={`font-bold text-base sm:text-lg mb-3 flex items-center gap-2 ${teamColor}`}>
          {teamName === 'A' ? '🔴' : '🔵'} Team {teamName} ({participants.length})
        </h3>
        <div className="space-y-3">
          {Object.entries(positionGroups).map(([position, players]) => {
            if (players.length === 0) return null;
            
            return (
              <div key={position}>
                <h4 className={`font-semibold mb-2 flex items-center gap-2 ${getPositionColor(position).split(' ')[0]} text-xs sm:text-sm`}>
                  <span>{getPositionIcon(position)}</span>
                  {position.charAt(0).toUpperCase() + position.slice(1)} ({players.length})
                </h4>
                <div className="grid gap-2">
                             {players.map((player) => (
                               <div 
                                 key={player.id} 
                                 className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${getPositionColor(position)} flex items-center justify-between`}
                               >
                                 <span>{player.participant_name}</span>
                                 {player.profiles?.stars && (
                                   <div className="flex items-center gap-1 text-yellow-400">
                                     <span className="text-xs">⭐</span>
                                     <span className="text-xs font-medium">{player.profiles.stars}</span>
                                   </div>
                                 )}
                               </div>
                             ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className={`glass-card border-none shadow-xl transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-2xl ${
      isNextMatch ? 'ring-2 ring-emerald-400/50' : '' // animate-pulse-slow kaldırıldı
    } ${isArchived ? 'opacity-60' : ''}`}>
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-white font-orbitron mb-2 leading-tight">
              {match.title || 'Untitled Match'}
              {isNextMatch && (
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  NEXT MATCH
                </Badge>
              )}
              {isCreator && (
                <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  YOUR MATCH
                </Badge>
              )}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">{match.description || 'No description'}</p>
            {match.creator_nickname && (
              <p className="text-white/50 text-xs mt-1">Created by: {match.creator_nickname}</p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {pendingRequestsCount > 0 && isCreator && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex items-center gap-1 text-xs">
                <Bell className="w-3 h-3" />
                {pendingRequestsCount}
              </Badge>
            )}
            {isNextMatch && !isCreator && !isArchived && (
              <div className="relative">
                <Button
                  onClick={onJoinClick}
                  disabled={isFull}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 text-lg sm:text-xl"
                >
                  ⚽
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Match Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2 text-white/80">
            <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-sm truncate">
              {match.match_date ? new Date(match.match_date).toLocaleDateString() : 'TBD'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm truncate">{match.match_time || 'TBD'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
            {hasLocation ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className="text-sm truncate flex-1">{match.location || 'Location'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="p-1 h-auto text-orange-400 hover:text-orange-300 flex-shrink-0"
                >
                  <Map className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <span className="text-sm truncate">{match.location || 'TBD'}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-white/80">
            <div className="text-yellow-400 font-bold text-sm flex-shrink-0">zł</div>
            <span className="text-sm truncate">
              {match.price_per_player !== null ? match.price_per_player : 'Free'}
            </span>
          </div>
        </div>

        {/* Weather Widget */}
        {hasLocation && (
          <div className="mb-4">
            <WeatherWidget
              lat={match.location_lat}
              lng={match.location_lng}
              location={match.location || undefined}
              className="w-full"
            />
          </div>
        )}

        {/* Google Maps */}
        {showMap && hasLocation && (
          <div className="mb-4">
            <LocationMap
              lat={match.location_lat}
              lng={match.location_lng}
              location={match.location || undefined}
              className="w-full"
            />
          </div>
        )}

        {/* Players Counter and Join Button */}
        <div className="flex flex-col gap-3 mb-4">
          <Button
            variant="ghost"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-300 justify-start"
          >
            <Users className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0" />
            <span className="font-semibold text-white">
              Players: {actualPlayerCount}/{match.max_players || 0}
            </span>
            {showParticipants ? (
              <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </Button>
          
          {/* Join Button - Show for all non-archived matches where user is not the creator */}
          {!isArchived && !isCreator && (
            <Button
              onClick={onJoinClick}
              disabled={isFull}
              className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 w-full text-base ${
                isFull
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-emerald-500/25 hover:scale-105'
              }`}
            >
              {isFull ? 'Match Full' : 'Request to Join'}
            </Button>
          )}
          
          {/* Archived Badge */}
          {isArchived && (
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 w-full justify-center">
              ARCHIVED
            </Badge>
          )}
        </div>

        {/* Participants List */}
        {showParticipants && (
          <div className="mt-4 p-3 sm:p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
            <div className="space-y-4">
              {/* Team A */}
              {renderTeamSection('A', teamAParticipants, 'text-red-400')}
              
              {/* Team B */}
              {renderTeamSection('B', teamBParticipants, 'text-blue-400')}
              
              {/* Unassigned Players */}
              {unassignedParticipants.length > 0 && (
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2 text-white/70">
                    👥 Unassigned ({unassignedParticipants.length})
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(groupByPosition(unassignedParticipants)).map(([position, players]) => {
                      if (players.length === 0) return null;
                      
                      return (
                        <div key={position}>
                          <h4 className={`font-semibold mb-2 flex items-center gap-2 ${getPositionColor(position).split(' ')[0]} text-xs sm:text-sm`}>
                            <span>{getPositionIcon(position)}</span>
                            {position.charAt(0).toUpperCase() + position.slice(1)} ({players.length})
                          </h4>
                          <div className="grid gap-2">
                             {players.map((player) => (
                               <div 
                                 key={player.id} 
                                 className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${getPositionColor(position)} flex items-center justify-between`}
                               >
                                 <span>{player.participant_name}</span>
                                 {player.profiles?.stars && (
                                   <div className="flex items-center gap-1 text-yellow-400">
                                     <span className="text-xs">⭐</span>
                                     <span className="text-xs font-medium">{player.profiles.stars}</span>
                                   </div>
                                 )}
                               </div>
                             ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;

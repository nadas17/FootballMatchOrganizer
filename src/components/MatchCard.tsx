
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
  
  // Group participants by position
  const positionGroups = {
    goalkeeper: match.participants.filter(p => p.position === 'goalkeeper'),
    defense: match.participants.filter(p => p.position === 'defense'),
    midfield: match.participants.filter(p => p.position === 'midfield'),
    attack: match.participants.filter(p => p.position === 'attack'),
    unassigned: match.participants.filter(p => !p.position)
  };

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
          
          {isNextMatch && !isCreator && !isArchived && (
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
            {hasLocation ? (
              <div className="flex items-center gap-1">
                <span className="text-sm truncate">{match.location || 'Location'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="p-1 h-auto text-orange-400 hover:text-orange-300"
                >
                  <Map className="w-3 h-3" />
                </Button>
              </div>
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

        {/* Weather Widget */}
        {hasLocation && (
          <div className="mb-4">
            <WeatherWidget
              lat={match.location_lat}
              lng={match.location_lng}
              location={match.location || undefined}
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
            />
          </div>
        )}

        {/* Players Counter and Join Button */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-300"
          >
            <Users className="w-4 h-4 mr-2 text-purple-400" />
            <span className="font-semibold">
              Players: {actualPlayerCount}/{match.max_players || 0}
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
          
          {/* Join Button - Show for all non-archived matches where user is not the creator */}
          {!isArchived && !isCreator && (
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
          
          {/* Archived Badge */}
          {isArchived && (
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
              ARCHIVED
            </Badge>
          )}
        </div>

        {/* Participants List */}
        {showParticipants && (
          <div className="mt-4 p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
            <div className="space-y-4">
              {Object.entries(positionGroups).map(([position, players]) => {
                if (players.length === 0) return null;
                
                return (
                  <div key={position}>
                    <h4 className={`font-semibold mb-2 flex items-center gap-2 ${getPositionColor(position).split(' ')[0]}`}>
                      <span className="text-lg">{getPositionIcon(position)}</span>
                      {position.charAt(0).toUpperCase() + position.slice(1)} ({players.length})
                    </h4>
                    <div className="grid gap-2">
                      {players.map((player) => (
                        <div 
                          key={player.id} 
                          className={`text-sm px-3 py-2 rounded-lg border ${getPositionColor(position)}`}
                        >
                          {player.participant_name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {positionGroups.unassigned.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white/70 mb-2 flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    No Position ({positionGroups.unassigned.length})
                  </h4>
                  <div className="grid gap-2">
                    {positionGroups.unassigned.map((player) => (
                      <div 
                        key={player.id} 
                        className="text-white/70 text-sm bg-white/10 px-3 py-2 rounded-lg border border-white/30"
                      >
                        {player.participant_name}
                      </div>
                    ))}
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

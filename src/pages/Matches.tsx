import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Calendar, Clock, MapPin, Users, Plus, Trophy, Search, Filter } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Match {
  id: string;
  title: string;
  description: string;
  match_date: string;
  match_time: string;
  location: string;
  location_lat: number;
  location_lng: number;
  max_players: number;
  current_players: number;
  price_per_player: number;
  creator_id: string;
  creator_nickname: string;
  created_at: string;
}

const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  // Form state for creating new match
  const [newMatch, setNewMatch] = useState({
    title: '',
    description: '',
    location: '',
    match_date: '',
    match_time: '',
    max_players: 22,
    price_per_player: 0,
    creator_nickname: ''
  });

  // Fetch matches from Supabase
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true })
        .order('match_time', { ascending: true });

      if (error) {
        console.error('Error fetching matches:', error);
        toast({
          title: "Error",
          description: "Failed to load matches. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error", 
        description: "Failed to load matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new match
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMatch.title || !newMatch.location || !newMatch.match_date || !newMatch.match_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const { data, error } = await supabase
        .from('matches')
        .insert([{
          title: newMatch.title,
          description: newMatch.description,
          location: newMatch.location,
          match_date: newMatch.match_date,
          match_time: newMatch.match_time,
          max_players: newMatch.max_players,
          price_per_player: newMatch.price_per_player,
          creator_nickname: newMatch.creator_nickname || 'Anonymous',
          current_players: 0
        }])
        .select();

      if (error) {
        console.error('Error creating match:', error);
        toast({
          title: "Error",
          description: "Failed to create match. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Reset form
      setNewMatch({
        title: '',
        description: '',
        location: '',
        match_date: '',
        match_time: '',
        max_players: 22,
        price_per_player: 0,
        creator_nickname: ''
      });
      
      setShowCreateForm(false);
      
      toast({
        title: "Success",
        description: "Match created successfully!",
      });

      // Refresh matches list
      fetchMatches();
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Filter matches based on search
  const filteredMatches = matches.filter(match => 
    match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.creator_nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date and time
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'TBD';
    return timeStr.slice(0, 5); // HH:MM format
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen profile-stadium-bg p-2 sm:p-4 pb-24 relative">
      <div className="stadium-lights"></div>
      <div className="max-w-6xl mx-auto py-3 sm:py-8 relative z-10">
        {/* Header */}
        <div className="glass-card p-3 sm:p-6 mb-4 sm:mb-8 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-glow">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-orbitron font-bold gradient-text">
                  Football Matches
                </h1>
                <p className="text-blue-200 text-xs sm:text-sm">
                  Find and join football matches in your area
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="glass-button-primary px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-smooth flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Match
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-4 mb-6 rounded-xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Search matches by title, location, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-blue-300 focus:border-blue-400 transition-colors"
              />
            </div>
            <button className="glass-button px-4 py-3 rounded-lg font-semibold transition-smooth flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Create Match Form */}
          {showCreateForm && (
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-xl">
                <h2 className="text-xl font-orbitron font-bold text-white mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Match
                </h2>
                
                <form onSubmit={handleCreateMatch} className="space-y-4">
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">
                      Match Title *
                    </label>
                    <input
                      type="text"
                      value={newMatch.title}
                      onChange={(e) => setNewMatch({...newMatch, title: e.target.value})}
                      className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-blue-300"
                      placeholder="e.g., Sunday Football"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={newMatch.description}
                      onChange={(e) => setNewMatch({...newMatch, description: e.target.value})}
                      className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-blue-300 h-20 resize-none"
                      placeholder="Match details..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={newMatch.location}
                      onChange={(e) => setNewMatch({...newMatch, location: e.target.value})}
                      className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-blue-300"
                      placeholder="e.g., Central Park"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-blue-200 text-sm font-medium mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={newMatch.match_date}
                        onChange={(e) => setNewMatch({...newMatch, match_date: e.target.value})}
                        className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-blue-200 text-sm font-medium mb-2">
                        Time *
                      </label>
                      <input
                        type="time"
                        value={newMatch.match_time}
                        onChange={(e) => setNewMatch({...newMatch, match_time: e.target.value})}
                        className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-blue-200 text-sm font-medium mb-2">
                        Max Players
                      </label>
                      <select 
                        value={newMatch.max_players}
                        onChange={(e) => setNewMatch({...newMatch, max_players: Number(e.target.value)})}
                        className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white"
                      >
                        <option value={10}>10 players</option>
                        <option value={14}>14 players</option>
                        <option value={18}>18 players</option>
                        <option value={22}>22 players</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-blue-200 text-sm font-medium mb-2">
                        Price per Player
                      </label>
                      <input
                        type="number"
                        value={newMatch.price_per_player}
                        onChange={(e) => setNewMatch({...newMatch, price_per_player: Number(e.target.value)})}
                        className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-2">
                      Your Nickname
                    </label>
                    <input
                      type="text"
                      value={newMatch.creator_nickname}
                      onChange={(e) => setNewMatch({...newMatch, creator_nickname: e.target.value})}
                      className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-blue-300"
                      placeholder="How should others see you?"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={creating}
                    className="w-full glass-button-primary py-3 rounded-lg font-semibold transition-smooth disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Match'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Matches List */}
          <div className={showCreateForm ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-orbitron font-bold text-white">
                  Available Matches ({filteredMatches.length})
                </h2>
                <button 
                  onClick={fetchMatches}
                  className="glass-button px-4 py-2 rounded-lg font-semibold transition-smooth text-sm"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="text-blue-200">Loading matches...</p>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200 mb-2">
                    {searchTerm ? 'No matches found for your search.' : 'No matches available yet.'}
                  </p>
                  <p className="text-blue-300 text-sm">
                    {!showCreateForm && 'Be the first to create a match!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-white font-semibold text-lg mb-1">{match.title}</h3>
                              <p className="text-blue-200 text-sm">Created by {match.creator_nickname}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              match.current_players >= match.max_players 
                                ? 'bg-red-500/20 text-red-300' 
                                : 'bg-green-500/20 text-green-300'
                            }`}>
                              {match.current_players >= match.max_players ? 'Full' : 'Open'}
                            </span>
                          </div>
                          
                          {match.description && (
                            <p className="text-blue-200 text-sm mb-3">{match.description}</p>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-blue-200">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{match.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-200">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(match.match_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-200">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(match.match_time)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-200">
                              <Users className="w-4 h-4" />
                              <span>{match.current_players}/{match.max_players}</span>
                            </div>
                          </div>

                          {match.price_per_player > 0 && (
                            <div className="mt-3">
                              <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">
                                ${match.price_per_player} per player
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button 
                            className="glass-button-primary px-4 py-2 rounded-lg font-semibold transition-smooth text-sm disabled:opacity-50"
                            disabled={match.current_players >= match.max_players}
                          >
                            {match.current_players >= match.max_players ? 'Match Full' : 'Join Match'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchesPage;
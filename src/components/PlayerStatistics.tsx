import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart3, Calendar, Trophy, Target, TrendingUp } from "lucide-react";
import { PlayerStatistics as PlayerStats } from "@/types/social";

interface PlayerStatisticsProps {
  username: string;
  userId?: string | null;
}

export const PlayerStatistics = ({ username, userId }: PlayerStatisticsProps) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrCreateStats();
  }, [username]);

  const fetchOrCreateStats = async () => {
    try {
      // Try to fetch existing stats
      const { data: existingStats, error: fetchError } = await supabase
        .from('player_statistics')
        .select('*')
        .eq('username', username)
        .single();

      if (existingStats) {
        setStats(existingStats);
      } else {
        // Create new stats entry
        await calculateAndCreateStats();
      }
    } catch (error) {
      console.error('Error fetching player statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAndCreateStats = async () => {
    try {
      // Get all matches where user participated
      const { data: participations } = await supabase
        .from('match_participants')
        .select('match_id, position, created_at')
        .eq('participant_name', username);

      // Get all matches user created
      const { data: createdMatches } = await supabase
        .from('matches')
        .select('id, creator_nickname')
        .eq('creator_nickname', username);

      // Get user's stars from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('stars')
        .eq('username', username)
        .single();

      // Calculate stats
      const totalMatches = (participations?.length || 0) + (createdMatches?.length || 0);
      const matchesPlayed = participations?.length || 0;
      const matchesOrganized = createdMatches?.length || 0;
      const totalStarsEarned = profile?.stars || 0;

      // Calculate favorite position
      const positionCounts: Record<string, number> = {};
      participations?.forEach(p => {
        if (p.position) {
          positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
        }
      });
      const favoritePosition = Object.entries(positionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      // Get last match date
      const lastMatchDate = participations && participations.length > 0
        ? participations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null;

      // Create stats entry
      const newStats = {
        user_id: userId,
        username,
        total_matches: totalMatches,
        matches_organized: matchesOrganized,
        matches_played: matchesPlayed,
        total_stars_earned: totalStarsEarned,
        favorite_position: favoritePosition,
        win_rate: 0, // This would require match result tracking
        last_match_date: lastMatchDate,
      };

      const { data: createdStats, error } = await supabase
        .from('player_statistics')
        .insert(newStats)
        .select()
        .single();

      if (!error && createdStats) {
        setStats(createdStats);
      }
    } catch (error) {
      console.error('Error calculating statistics:', error);
    }
  };

  const getPositionDisplay = (position: string | null) => {
    if (!position) return 'Not specified';
    const positionMap: Record<string, string> = {
      'goalkeeper': '🥅 Goalkeeper',
      'defense': '🛡️ Defense',
      'midfield': '⚡ Midfield',
      'attack': '⚽ Attack',
    };
    return positionMap[position] || position;
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Player Statistics</h3>
        </div>
        <p className="text-muted-foreground">Loading statistics...</p>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Player Statistics</h3>
        </div>
        <p className="text-center text-muted-foreground py-8">
          No statistics available yet. Play your first match!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Player Statistics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Matches */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Total Matches</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{stats.total_matches}</p>
        </div>

        {/* Matches Played */}
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Played</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{stats.matches_played}</p>
        </div>

        {/* Matches Organized */}
        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">Organized</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">{stats.matches_organized}</p>
        </div>

        {/* Total Stars */}
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Total Stars</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{stats.total_stars_earned}</p>
        </div>

        {/* Win Rate */}
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{stats.win_rate.toFixed(0)}%</p>
        </div>

        {/* Favorite Position */}
        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Favorite</span>
          </div>
          <p className="text-sm font-semibold text-orange-500">
            {getPositionDisplay(stats.favorite_position)}
          </p>
        </div>
      </div>

      {stats.last_match_date && (
        <div className="mt-4 pt-4 border-t border-muted">
          <p className="text-sm text-muted-foreground">
            Last match: {new Date(stats.last_match_date).toLocaleDateString()}
          </p>
        </div>
      )}
    </Card>
  );
};

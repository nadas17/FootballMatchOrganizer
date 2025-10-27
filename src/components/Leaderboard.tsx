import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Star, TrendingUp } from "lucide-react";
import { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  limit?: number;
  showFullPage?: boolean;
}

export const Leaderboard = ({ limit = 10, showFullPage = false }: LeaderboardProps) => {
  const [topPlayers, setTopPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopPlayers();
  }, [limit]);

  const fetchTopPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('stars', 'is', null)
        .order('stars', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTopPlayers(data || []);
    } catch (error) {
      console.error('Error fetching top players:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-muted-foreground font-semibold">#{index + 1}</span>;
  };

  const getRankBadgeClass = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (index === 2) return 'bg-gradient-to-r from-amber-600 to-amber-800';
    return 'bg-muted';
  };

  const getPositionEmoji = (position: string | null) => {
    if (!position) return '⚽';
    const positionMap: Record<string, string> = {
      'kaleci': '🥅',
      'defans': '🛡️',
      'orta saha': '⚡',
      'forvet': '⚽',
    };
    return positionMap[position] || '⚽';
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Leaderboard</h3>
        </div>
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </Card>
    );
  }

  if (topPlayers.length === 0) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Leaderboard</h3>
        </div>
        <p className="text-center text-muted-foreground py-8">
          No players ranked yet
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("glass-card", showFullPage ? "p-8" : "p-6")}>
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h3 className={cn("font-semibold", showFullPage ? "text-2xl" : "text-lg")}>
          Top Players
        </h3>
        <TrendingUp className="w-5 h-5 text-primary ml-auto" />
      </div>

      <div className="space-y-3">
        {topPlayers.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.02]",
              index < 3 ? getRankBadgeClass(index) + ' text-white shadow-lg' : 'bg-muted/30 hover:bg-muted/50'
            )}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-12 h-12">
              {getRankIcon(index)}
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/30">
              {player.avatar_url ? (
                <img
                  src={player.avatar_url}
                  alt={player.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={cn("text-lg font-bold", !player.avatar_url ? '' : 'hidden')}>
                {player.username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "font-semibold truncate",
                  index < 3 ? "text-white" : "text-foreground"
                )}>
                  {player.username}
                </p>
                {player.position && (
                  <span className="text-sm">
                    {getPositionEmoji(player.position)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className={cn(
                  "w-4 h-4",
                  index < 3 ? "text-yellow-200" : "text-yellow-500"
                )} fill="currentColor" />
                <span className={cn(
                  "text-sm font-semibold",
                  index < 3 ? "text-white" : "text-muted-foreground"
                )}>
                  {player.stars || 0} stars
                </span>
              </div>
            </div>

            {/* Stars Count (Large) */}
            {showFullPage && (
              <div className="text-right">
                <div className={cn(
                  "text-3xl font-bold",
                  index < 3 ? "text-white" : "text-primary"
                )}>
                  {player.stars || 0}
                </div>
                <div className={cn(
                  "text-xs",
                  index < 3 ? "text-white/80" : "text-muted-foreground"
                )}>
                  STARS
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!showFullPage && topPlayers.length >= limit && (
        <div className="mt-4 text-center">
          <a
            href="/leaderboard"
            className="text-sm text-primary hover:underline"
          >
            View Full Leaderboard →
          </a>
        </div>
      )}
    </Card>
  );
};

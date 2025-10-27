import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Award, Users, Star, Medal, Sparkles } from "lucide-react";
import { PlayerAchievement, AchievementType } from "@/types/social";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PlayerAchievementsProps {
  username: string;
  userId?: string | null;
}

interface AchievementDefinition {
  type: AchievementType;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

const achievementDefinitions: AchievementDefinition[] = [
  {
    type: 'first_match',
    name: 'First Steps',
    description: 'Played your first match',
    icon: Star,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    type: 'match_organizer',
    name: 'Organizer',
    description: 'Organized your first match',
    icon: Trophy,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    type: 'team_player',
    name: 'Team Player',
    description: 'Participated in 10 matches',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    type: 'star_player',
    name: 'Star Player',
    description: 'Earned 50 stars',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  {
    type: 'veteran',
    name: 'Veteran',
    description: 'Participated in 50 matches',
    icon: Medal,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    type: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Made 100 comments',
    icon: Sparkles,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
];

export const PlayerAchievements = ({ username, userId }: PlayerAchievementsProps) => {
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    checkAndAwardAchievements();
  }, [username]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('player_achievements')
        .select('*')
        .eq('username', username)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardAchievements = async () => {
    if (!userId) return;

    try {
      // Check for first match
      const { data: participations } = await supabase
        .from('match_participants')
        .select('id')
        .eq('participant_name', username)
        .limit(1);

      if (participations && participations.length > 0) {
        await awardAchievement('first_match');
      }

      // Check for match organizer
      const { data: createdMatches } = await supabase
        .from('matches')
        .select('id')
        .eq('creator_nickname', username)
        .limit(1);

      if (createdMatches && createdMatches.length > 0) {
        await awardAchievement('match_organizer');
      }

      // Check for team player (10 matches)
      const { data: allParticipations } = await supabase
        .from('match_participants')
        .select('id')
        .eq('participant_name', username);

      if (allParticipations && allParticipations.length >= 10) {
        await awardAchievement('team_player');
      }

      // Check for veteran (50 matches)
      if (allParticipations && allParticipations.length >= 50) {
        await awardAchievement('veteran');
      }

      // Check for star player (50 stars)
      const { data: profile } = await supabase
        .from('profiles')
        .select('stars')
        .eq('username', username)
        .single();

      if (profile && profile.stars && profile.stars >= 50) {
        await awardAchievement('star_player');
      }

      // Check for social butterfly (100 comments)
      const { data: comments } = await supabase
        .from('match_comments')
        .select('id')
        .eq('username', username);

      if (comments && comments.length >= 100) {
        await awardAchievement('social_butterfly');
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const awardAchievement = async (achievementType: AchievementType) => {
    // Check if already has this achievement
    const hasAchievement = achievements.some(a => a.achievement_type === achievementType);
    if (hasAchievement) return;

    const definition = achievementDefinitions.find(d => d.type === achievementType);
    if (!definition) return;

    try {
      const { error } = await supabase
        .from('player_achievements')
        .insert({
          user_id: userId,
          username,
          achievement_type: achievementType,
          achievement_name: definition.name,
          achievement_description: definition.description,
        });

      if (!error) {
        // Refresh achievements
        fetchAchievements();
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Achievements</h3>
        </div>
        <p className="text-muted-foreground">Loading achievements...</p>
      </Card>
    );
  }

  const earnedTypes = new Set(achievements.map(a => a.achievement_type));

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Achievements ({achievements.length}/{achievementDefinitions.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievementDefinitions.map((definition) => {
          const earned = achievements.find(a => a.achievement_type === definition.type);
          const isEarned = earnedTypes.has(definition.type);

          return (
            <div
              key={definition.type}
              className={cn(
                "p-4 rounded-lg border transition-all",
                isEarned
                  ? `${definition.bgColor} ${definition.borderColor} hover:scale-[1.02]`
                  : 'bg-muted/20 border-muted opacity-50'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  isEarned ? definition.bgColor : 'bg-muted/30'
                )}>
                  <definition.icon className={cn(
                    "w-5 h-5",
                    isEarned ? definition.color : 'text-muted-foreground'
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-semibold mb-1",
                    isEarned ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {definition.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {definition.description}
                  </p>
                  {earned && (
                    <p className="text-xs text-muted-foreground">
                      Earned {formatDistanceToNow(new Date(earned.earned_at), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                  {!isEarned && (
                    <p className="text-xs text-muted-foreground italic">
                      Not yet earned
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <p className="text-center text-muted-foreground py-4 mt-4 border-t border-muted">
          Keep playing to earn your first achievement!
        </p>
      )}
    </Card>
  );
};

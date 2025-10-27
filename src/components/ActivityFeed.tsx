import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Activity as ActivityIcon, Calendar, MessageSquare, Heart, Star } from "lucide-react";
import { Activity } from "@/types/social";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  limit?: number;
  userId?: string | null;
  matchId?: string | null;
}

export const ActivityFeed = ({ limit = 20, userId = null, matchId = null }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Real-time subscription
    const channel = supabase
      .channel('activities_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit, userId, matchId]);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (matchId) {
        query = query.eq('match_id', matchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'match_created':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'match_joined':
        return <Star className="w-4 h-4 text-green-500" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'reaction_added':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'stars_earned':
        return <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-primary" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'match_created':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'match_joined':
        return 'bg-green-500/10 border-green-500/20';
      case 'comment_added':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'reaction_added':
        return 'bg-red-500/10 border-red-500/20';
      case 'stars_earned':
        return 'bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'bg-muted/30 border-muted';
    }
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <ActivityIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <p className="text-muted-foreground">Loading activities...</p>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <ActivityIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <p className="text-center text-muted-foreground py-8">
          No recent activity
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-6">
        <ActivityIcon className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Recent Activity ({activities.length})
        </h3>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02]",
              getActivityColor(activity.activity_type)
            )}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background/50 flex-shrink-0 mt-1">
              {getActivityIcon(activity.activity_type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </p>

              {/* Metadata preview */}
              {activity.metadata && (
                <div className="mt-2 text-xs text-muted-foreground italic">
                  {activity.metadata.comment_preview && (
                    <span>"{activity.metadata.comment_preview}..."</span>
                  )}
                  {activity.metadata.reaction_type && (
                    <span className="capitalize">
                      {activity.metadata.reaction_type} reaction
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

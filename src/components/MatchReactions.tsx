import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Star, CheckCircle } from "lucide-react";
import { MatchReaction, ReactionType, ReactionCounts } from "@/types/social";
import { cn } from "@/lib/utils";

interface MatchReactionsProps {
  matchId: string;
  matchTitle?: string;
}

export const MatchReactions = ({ matchId, matchTitle }: MatchReactionsProps) => {
  const [reactions, setReactions] = useState<MatchReaction[]>([]);
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [counts, setCounts] = useState<ReactionCounts>({
    like: 0,
    interested: 0,
    going: 0,
    total: 0,
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReactions();
    getCurrentUser();

    // Real-time subscription
    const channel = supabase
      .channel(`match_reactions_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_reactions',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCurrentUsername(profile.username);
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('match_reactions')
        .select('*')
        .eq('match_id', matchId);

      if (error) throw error;

      setReactions(data || []);

      // Calculate counts
      const likesCount = data?.filter((r) => r.reaction_type === 'like').length || 0;
      const interestedCount = data?.filter((r) => r.reaction_type === 'interested').length || 0;
      const goingCount = data?.filter((r) => r.reaction_type === 'going').length || 0;

      setCounts({
        like: likesCount,
        interested: interestedCount,
        going: goingCount,
        total: data?.length || 0,
      });

      // Set user reactions
      if (currentUserId) {
        const userReactionTypes = new Set(
          data
            ?.filter((r) => r.user_id === currentUserId)
            .map((r) => r.reaction_type) || []
        );
        setUserReactions(userReactionTypes);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (!currentUserId || !currentUsername) {
      toast.error('You must be logged in to react');
      return;
    }

    try {
      const hasReacted = userReactions.has(reactionType);

      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('match_reactions')
          .delete()
          .eq('match_id', matchId)
          .eq('user_id', currentUserId)
          .eq('reaction_type', reactionType);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('match_reactions')
          .insert({
            match_id: matchId,
            user_id: currentUserId,
            username: currentUsername,
            reaction_type: reactionType,
          });

        if (error) throw error;

        // Create activity
        await supabase.from('activities').insert({
          activity_type: 'reaction_added',
          user_id: currentUserId,
          username: currentUsername,
          match_id: matchId,
          description: `${currentUsername} reacted to ${matchTitle || 'a match'}`,
          metadata: { reaction_type: reactionType }
        });
      }
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('You already reacted with this');
      } else {
        toast.error('Failed to update reaction');
      }
    }
  };

  const reactionButtons = [
    {
      type: 'like' as ReactionType,
      icon: Heart,
      label: 'Like',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      hoverColor: 'hover:bg-red-500/20',
    },
    {
      type: 'interested' as ReactionType,
      icon: Star,
      label: 'Interested',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      hoverColor: 'hover:bg-yellow-500/20',
    },
    {
      type: 'going' as ReactionType,
      icon: CheckCircle,
      label: 'Going',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      hoverColor: 'hover:bg-green-500/20',
    },
  ];

  if (loading) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {reactionButtons.map(({ type, icon: Icon, label, color, bgColor, hoverColor }) => {
        const isActive = userReactions.has(type);
        const count = counts[type];

        return (
          <Button
            key={type}
            variant="outline"
            size="sm"
            onClick={() => handleReaction(type)}
            disabled={!currentUserId}
            className={cn(
              'gap-2 transition-all',
              isActive && `${bgColor} border-2`,
              !isActive && hoverColor
            )}
          >
            <Icon
              className={cn(
                'w-4 h-4',
                isActive ? color : 'text-muted-foreground'
              )}
              fill={isActive ? 'currentColor' : 'none'}
            />
            <span className={isActive ? 'font-semibold' : ''}>
              {label}
            </span>
            {count > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-xs',
                isActive ? `${bgColor} ${color}` : 'bg-muted text-muted-foreground'
              )}>
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

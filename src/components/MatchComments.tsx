import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MatchComment, MatchCommentInsert } from "@/types/social";
import { sanitizeString } from "@/utils/validation";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Trash2 } from "lucide-react";

interface MatchCommentsProps {
  matchId: string;
  matchTitle?: string;
}

export const MatchComments = ({ matchId, matchTitle }: MatchCommentsProps) => {
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    getCurrentUser();

    // Real-time subscription for new comments
    const channel = supabase
      .channel(`match_comments_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_comments',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          fetchComments();
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

        // Get username from profile
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

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('match_comments')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (newComment.length > 500) {
      toast.error('Comment is too long (max 500 characters)');
      return;
    }

    if (!currentUserId || !currentUsername) {
      toast.error('You must be logged in to comment');
      return;
    }

    setSubmitting(true);

    try {
      const sanitizedComment = sanitizeString(newComment.trim());

      const commentData: MatchCommentInsert = {
        match_id: matchId,
        user_id: currentUserId,
        username: currentUsername,
        comment_text: sanitizedComment,
      };

      const { error: insertError } = await supabase
        .from('match_comments')
        .insert(commentData);

      if (insertError) throw insertError;

      // Create activity
      await supabase.from('activities').insert({
        activity_type: 'comment_added',
        user_id: currentUserId,
        username: currentUsername,
        match_id: matchId,
        description: `${currentUsername} commented on ${matchTitle || 'a match'}`,
        metadata: { comment_preview: sanitizedComment.substring(0, 50) }
      });

      toast.success('Comment added successfully!');
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('match_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId);

      if (error) throw error;
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <p className="text-muted-foreground">Loading comments...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Input */}
      {currentUserId ? (
        <div className="mb-6">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-2 glass-input"
            maxLength={500}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {newComment.length}/500 characters
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Please log in to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {comment.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{comment.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                {comment.user_id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed pl-10">{comment.comment_text}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

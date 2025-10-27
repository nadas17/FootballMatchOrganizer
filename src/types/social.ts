// Social Media Feature Types

export interface MatchComment {
  id: string;
  match_id: string;
  user_id: string | null;
  username: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface MatchCommentInsert {
  match_id: string;
  user_id?: string | null;
  username: string;
  comment_text: string;
}

export type ReactionType = 'like' | 'interested' | 'going';

export interface MatchReaction {
  id: string;
  match_id: string;
  user_id: string;
  username: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface MatchReactionInsert {
  match_id: string;
  user_id: string;
  username: string;
  reaction_type: ReactionType;
}

export type ActivityType =
  | 'match_created'
  | 'match_joined'
  | 'comment_added'
  | 'reaction_added'
  | 'stars_earned';

export interface Activity {
  id: string;
  activity_type: ActivityType;
  user_id: string | null;
  username: string;
  match_id: string | null;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ActivityInsert {
  activity_type: ActivityType;
  user_id?: string | null;
  username: string;
  match_id?: string | null;
  description: string;
  metadata?: Record<string, any> | null;
}

export interface PlayerStatistics {
  id: string;
  user_id: string | null;
  username: string;
  total_matches: number;
  matches_organized: number;
  matches_played: number;
  total_stars_earned: number;
  favorite_position: string | null;
  win_rate: number;
  last_match_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerStatisticsInsert {
  user_id?: string | null;
  username: string;
  total_matches?: number;
  matches_organized?: number;
  matches_played?: number;
  total_stars_earned?: number;
  favorite_position?: string | null;
  win_rate?: number;
  last_match_date?: string | null;
}

export type AchievementType =
  | 'first_match'
  | 'match_organizer'
  | 'team_player'
  | 'star_player'
  | 'veteran'
  | 'social_butterfly';

export interface PlayerAchievement {
  id: string;
  user_id: string | null;
  username: string;
  achievement_type: AchievementType;
  achievement_name: string;
  achievement_description: string | null;
  earned_at: string;
}

export interface PlayerAchievementInsert {
  user_id?: string | null;
  username: string;
  achievement_type: AchievementType;
  achievement_name: string;
  achievement_description?: string | null;
}

export interface ReactionCounts {
  like: number;
  interested: number;
  going: number;
  total: number;
}

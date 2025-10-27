-- Migration: Add Social Media Features
-- Description: Adds tables for comments, reactions, activities, and player statistics

-- 1. Match Comments Table
CREATE TABLE IF NOT EXISTS match_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    comment_text TEXT NOT NULL CHECK (char_length(comment_text) <= 500),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_comment_length CHECK (char_length(comment_text) >= 1)
);

-- 2. Match Reactions Table (likes/interested)
CREATE TABLE IF NOT EXISTS match_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'interested', 'going')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(match_id, user_id, reaction_type)
);

-- 3. Activities Feed Table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL CHECK (activity_type IN ('match_created', 'match_joined', 'comment_added', 'reaction_added', 'stars_earned')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Player Statistics Table
CREATE TABLE IF NOT EXISTS player_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    total_matches INTEGER DEFAULT 0,
    matches_organized INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    total_stars_earned INTEGER DEFAULT 0,
    favorite_position TEXT,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    last_match_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Player Achievements Table
CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('first_match', 'match_organizer', 'team_player', 'star_player', 'veteran', 'social_butterfly')),
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_type)
);

-- Create indexes for better query performance
CREATE INDEX idx_match_comments_match_id ON match_comments(match_id);
CREATE INDEX idx_match_comments_created_at ON match_comments(created_at DESC);
CREATE INDEX idx_match_reactions_match_id ON match_reactions(match_id);
CREATE INDEX idx_match_reactions_user_id ON match_reactions(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_match_id ON activities(match_id);
CREATE INDEX idx_player_statistics_username ON player_statistics(username);
CREATE INDEX idx_player_achievements_user_id ON player_achievements(user_id);

-- Row Level Security (RLS) Policies

-- Match Comments: Anyone can read, authenticated users can create/update own comments
ALTER TABLE match_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match comments"
    ON match_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON match_comments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments"
    ON match_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON match_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Match Reactions: Anyone can read, authenticated users can manage own reactions
ALTER TABLE match_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match reactions"
    ON match_reactions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can add reactions"
    ON match_reactions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own reactions"
    ON match_reactions FOR DELETE
    USING (auth.uid() = user_id);

-- Activities: Anyone can read
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activities"
    ON activities FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create activities"
    ON activities FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Player Statistics: Anyone can read, system can update
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view player statistics"
    ON player_statistics FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage own statistics"
    ON player_statistics FOR ALL
    USING (auth.uid() = user_id);

-- Player Achievements: Anyone can read
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view player achievements"
    ON player_achievements FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can receive achievements"
    ON player_achievements FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_comments_updated_at
    BEFORE UPDATE ON match_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_statistics_updated_at
    BEFORE UPDATE ON player_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

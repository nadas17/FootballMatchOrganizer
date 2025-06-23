
export interface MatchData {
  id: string;
  title: string | null;
  match_date: string | null;
  match_time: string | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  description: string | null;
  price_per_player: number | null;
  max_players: number | null;
  current_players: number;
  created_at: string;
  creator_id: string | null;
  creator_nickname: string | null;
  participants: Array<{
    id: string;
    participant_name: string;
    team: string | null;
    position: string | null;
    match_id: string;
    created_at: string;
  }>;
}

export interface MatchRequest {
  id: string;
  match_id: string;
  participant_name: string;
  status: 'pending' | 'approved' | 'rejected';
  position: string | null;
  team: string | null; // Added team field to the interface
  created_at: string;
}

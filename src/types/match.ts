
export interface Match {
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
  participants: Array<{
    id: string;
    participant_name: string;
    team: string | null;
    match_id: string;
    created_at: string;
  }>;
}

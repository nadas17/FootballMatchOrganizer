
export interface Match {
  id: string;
  title: string;
  match_date: string;
  match_time: string;
  location: string;
  location_lat?: number;
  location_lng?: number;
  description: string;
  price_per_player: number | null;
  max_players: number;
  current_players: number;
  participants: Array<{
    id: string;
    participant_name: string;
    team: string;
  }>;
}

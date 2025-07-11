export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  position: string | null;
  stars: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export type ProfileInsert = {
  id: string;
  username: string;
  avatar_url?: string | null;
  position?: 'kaleci' | 'defans' | 'orta saha' | 'forvet' | null;
  stars?: number;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

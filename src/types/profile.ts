export interface Profile {
  id: string;
  username: string;
  avatar_url?: string | null;
  position?: 'kaleci' | 'defans' | 'orta saha' | 'forvet' | null;
  stars: number;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = {
  id: string;
  username: string;
  avatar_url?: string | null;
  position?: 'kaleci' | 'defans' | 'orta saha' | 'forvet' | null;
  stars?: number;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

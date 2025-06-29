import { supabase } from '../integrations/supabase/client';
import type { Profile, ProfileInsert, ProfileUpdate } from '../types/profile';

export class ProfileService {
  // Kullanıcının profilini getir
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  // Profil oluştur veya güncelle
  static async upsertProfile(profile: ProfileInsert): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      throw error;
    }

    return data;
  }

  // Profil güncelle
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  }

  // Tüm profilleri getir (leaderboard için)
  static async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('stars', { ascending: false });

    if (error) {
      console.error('Error fetching all profiles:', error);
      return [];
    }

    return data || [];
  }

  // Yıldız puanını artır
  static async incrementStars(userId: string): Promise<boolean> {
    try {
      // Önce mevcut yıldız sayısını al
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('stars')
        .eq('id', userId)
        .single();
      
      const currentStars = currentProfile?.stars || 0;
      
      // Yıldız puanını artır
      const { error } = await supabase
        .from('profiles')
        .update({ stars: currentStars + 1 })
        .eq('id', userId);
      
      if (error) {
        console.error('Error incrementing stars:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing stars:', error);
      return false;
    }
  }
}

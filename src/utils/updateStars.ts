import { supabase } from '../integrations/supabase/client';

export const updateStarsForWinningTeam = async (matchId: string, winningTeam: 'A' | 'B') => {
  try {
    // Kazanan takımın oyuncularını al
    const { data: participants, error: participantsError } = await supabase
      .from('match_participants')
      .select('participant_name')
      .eq('match_id', matchId)
      .eq('team', winningTeam);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return { success: false, error: participantsError.message };
    }

    if (participants && participants.length > 0) {
      // Her oyuncunun profil ID'sini bulup yıldız puanını güncelle
      for (const participant of participants) {
        // Participant name'e göre profile bulup ID'sini al
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', participant.participant_name)
          .single();
        
        if (profile) {
          // Önce mevcut yıldız sayısını al
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('stars')
            .eq('id', profile.id)
            .single();
          
          const currentStars = currentProfile?.stars || 0;
          
          // Yıldız puanını artır
          await supabase
            .from('profiles')
            .update({ stars: currentStars + 1 })
            .eq('id', profile.id);
        }
      }

      return { success: true, updatedPlayers: participants.length };
    }

    return { success: true, updatedPlayers: 0 };
  } catch (error) {
    console.error('Error updating stars:', error);
    return { success: false, error: 'Bilinmeyen hata oluştu' };
  }
};

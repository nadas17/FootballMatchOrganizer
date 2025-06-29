import React, { useState } from 'react';
import { Button } from './ui/button';
import { updateStarsForWinningTeam } from '../utils/updateStars';
import { toast } from 'sonner';

interface MatchResultProps {
  matchId: string;
  onResultSaved?: () => void;
}

const MatchResult: React.FC<MatchResultProps> = ({ matchId, onResultSaved }) => {
  const [winningTeam, setWinningTeam] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveResult = async () => {
    if (!winningTeam) {
      toast.error('Lütfen kazanan takımı seçin');
      return;
    }

    setLoading(true);
    
    const result = await updateStarsForWinningTeam(matchId, winningTeam);
    
    if (result.success) {
      toast.success(`Maç sonucu kaydedildi! ${result.updatedPlayers} oyuncunun yıldız puanı güncellendi.`);
      onResultSaved?.();
    } else {
      toast.error('Maç sonucu kaydedilirken hata oluştu: ' + result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-xl font-orbitron font-bold text-white text-center">
        Maç Sonucu
      </h3>
      
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setWinningTeam('A')}
          variant={winningTeam === 'A' ? 'default' : 'outline'}
          className="flex-1"
        >
          Takım A Kazandı
        </Button>
        <Button
          onClick={() => setWinningTeam('B')}
          variant={winningTeam === 'B' ? 'default' : 'outline'}
          className="flex-1"
        >
          Takım B Kazandı
        </Button>
      </div>

      <Button 
        onClick={handleSaveResult} 
        disabled={!winningTeam || loading}
        className="w-full"
      >
        {loading ? 'Kaydediliyor...' : 'Sonucu Kaydet'}
      </Button>
    </div>
  );
};

export default MatchResult;

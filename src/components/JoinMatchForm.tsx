
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Users } from "lucide-react";

interface JoinMatchFormProps {
  matchId: number;
  onJoin: (matchId: number, playerName: string, team: string) => void;
  onCancel: () => void;
}

const JoinMatchForm: React.FC<JoinMatchFormProps> = ({ matchId, onJoin, onCancel }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && selectedTeam) {
      onJoin(matchId, playerName.trim(), selectedTeam);
      setPlayerName('');
      setSelectedTeam('');
    }
  };

  return (
    <Card className="glass-card border-none shadow-2xl animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-orbitron text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Join the Match
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-white font-semibold">
              Your Name
            </Label>
            <Input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="glass-input"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white font-semibold">Choose Your Team</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={selectedTeam === 'A' ? 'default' : 'outline'}
                onClick={() => setSelectedTeam('A')}
                className={`h-16 relative overflow-hidden transition-all duration-300 ${
                  selectedTeam === 'A'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                  <span className="font-bold">Team A</span>
                </div>
                {selectedTeam === 'A' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] animate-shine"></div>
                )}
              </Button>

              <Button
                type="button"
                variant={selectedTeam === 'B' ? 'default' : 'outline'}
                onClick={() => setSelectedTeam('B')}
                className={`h-16 relative overflow-hidden transition-all duration-300 ${
                  selectedTeam === 'B'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                  <span className="font-bold">Team B</span>
                </div>
                {selectedTeam === 'B' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] animate-shine"></div>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!playerName.trim() || !selectedTeam}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Join Match ⚽
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoinMatchForm;

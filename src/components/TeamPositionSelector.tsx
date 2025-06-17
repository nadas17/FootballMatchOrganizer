
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamPositionSelectorProps {
  team: string;
  position: string;
  onTeamChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  required?: boolean;
}

const TeamPositionSelector: React.FC<TeamPositionSelectorProps> = ({
  team,
  position,
  onTeamChange,
  onPositionChange,
  required = false
}) => {
  const positions = [
    { value: 'goalkeeper', label: '🥅 Goalkeeper', color: 'text-yellow-400' },
    { value: 'defense', label: '🛡️ Defense', color: 'text-blue-400' },
    { value: 'midfield', label: '⚡ Midfield', color: 'text-green-400' },
    { value: 'attack', label: '⚽ Attack', color: 'text-red-400' }
  ];

  const teams = [
    { value: 'A', label: '🔴 Team A', color: 'text-red-400' },
    { value: 'B', label: '🔵 Team B', color: 'text-blue-400' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white font-semibold">
          Team Selection {required && <span className="text-red-400">*</span>}
        </Label>
        <Select value={team} onValueChange={onTeamChange} required={required}>
          <SelectTrigger className="glass-input">
            <SelectValue placeholder="Select your team" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 backdrop-blur-sm border-white/20">
            {teams.map((teamOption) => (
              <SelectItem 
                key={teamOption.value} 
                value={teamOption.value}
                className="text-white hover:bg-white/10 focus:bg-white/10"
              >
                <span className={teamOption.color}>{teamOption.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white font-semibold">
          Position {required && <span className="text-red-400">*</span>}
        </Label>
        <Select value={position} onValueChange={onPositionChange} required={required}>
          <SelectTrigger className="glass-input">
            <SelectValue placeholder="Select your position" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 backdrop-blur-sm border-white/20">
            {positions.map((pos) => (
              <SelectItem 
                key={pos.value} 
                value={pos.value}
                className="text-white hover:bg-white/10 focus:bg-white/10"
              >
                <span className={pos.color}>{pos.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TeamPositionSelector;

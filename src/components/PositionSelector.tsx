
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PositionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

const positions = [
  { value: 'goalkeeper', label: '🥅 Goalkeeper', color: 'text-yellow-400' },
  { value: 'defense', label: '🛡️ Defense', color: 'text-blue-400' },
  { value: 'midfield', label: '⚡ Midfield', color: 'text-green-400' },
  { value: 'attack', label: '⚽ Attack', color: 'text-red-400' }
];

const PositionSelector: React.FC<PositionSelectorProps> = ({ 
  value, 
  onChange, 
  label = "Preferred Position",
  required = false 
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-white font-semibold flex items-center gap-2">
        <span className="text-emerald-400">⚽</span>
        {label}
        {required && <span className="text-red-400">*</span>}
      </Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 gap-3">
        {positions.map((position) => (
          <div key={position.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={position.value} 
              id={position.value}
              className="border-white/30 text-emerald-400"
            />
            <Label 
              htmlFor={position.value} 
              className={`cursor-pointer text-sm ${position.color} hover:text-white transition-colors`}
            >
              {position.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PositionSelector;

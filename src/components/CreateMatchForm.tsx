
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, Clock, MapPin, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateMatchFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    match_date: '',
    match_time: '',
    location: '',
    max_players: '',
    price_per_player: '',
    creator_nickname: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.creator_nickname.trim()) {
      toast({
        title: "Error",
        description: "Creator nickname is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const creatorId = crypto.randomUUID();
      
      const matchData = {
        title: formData.title || null,
        description: formData.description || null,
        match_date: formData.match_date || null,
        match_time: formData.match_time || null,
        location: formData.location || null,
        max_players: formData.max_players ? parseInt(formData.max_players) : null,
        price_per_player: formData.price_per_player ? parseFloat(formData.price_per_player) : null,
        creator_id: creatorId,
        creator_nickname: formData.creator_nickname.trim()
      };

      const { error } = await supabase
        .from('matches')
        .insert(matchData);

      if (error) throw error;

      toast({
        title: "Match Created! ⚽",
        description: `Match "${formData.title}" created successfully!`
      });

      // Store creator info in localStorage for managing requests
      localStorage.setItem('football_creator_id', creatorId);
      localStorage.setItem('football_creator_nickname', formData.creator_nickname.trim());

      onSuccess();
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-none shadow-2xl animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-orbitron text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Create New Match
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creator_nickname" className="text-white font-semibold">
                Your Nickname *
              </Label>
              <Input
                id="creator_nickname"
                name="creator_nickname"
                type="text"
                value={formData.creator_nickname}
                onChange={handleInputChange}
                placeholder="Your nickname"
                className="glass-input"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white font-semibold">
                Match Title
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Friday Evening Match"
                className="glass-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Match details..."
              className="glass-input min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="match_date" className="text-white font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="match_date"
                name="match_date"
                type="date"
                value={formData.match_date}
                onChange={handleInputChange}
                className="glass-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="match_time" className="text-white font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </Label>
              <Input
                id="match_time"
                name="match_time"
                type="time"
                value={formData.match_time}
                onChange={handleInputChange}
                className="glass-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-white font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Stadium or field location"
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_players" className="text-white font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Max Players
              </Label>
              <Input
                id="max_players"
                name="max_players"
                type="number"
                min="2"
                max="22"
                value={formData.max_players}
                onChange={handleInputChange}
                placeholder="22"
                className="glass-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price_per_player" className="text-white font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price (zł)
              </Label>
              <Input
                id="price_per_player"
                name="price_per_player"
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_player}
                onChange={handleInputChange}
                placeholder="0"
                className="glass-input"
              />
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
              disabled={loading || !formData.creator_nickname.trim()}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Creating...' : 'Create Match ⚽'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateMatchForm;

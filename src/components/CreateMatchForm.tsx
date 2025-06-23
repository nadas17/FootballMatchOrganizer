import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, Clock, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import { validatePlayerName, validateMatchTitle, validateDescription, validateLocation, validatePrice, validateMaxPlayers, sanitizeString } from "@/utils/validation";

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
    location_lat: null as number | null,
    location_lng: null as number | null,
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

  const handleLocationSelect = (place: { name: string; lat: number; lng: number }) => {
    console.log('Location selected:', place);
    setFormData(prev => ({
      ...prev,
      location: place.name,
      location_lat: place.lat,
      location_lng: place.lng
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    const sanitizedNickname = sanitizeString(formData.creator_nickname);
    const sanitizedTitle = sanitizeString(formData.title);
    const sanitizedDescription = sanitizeString(formData.description);
    const sanitizedLocation = sanitizeString(formData.location);
    
    if (!validatePlayerName(sanitizedNickname)) {
      toast({
        title: "Invalid Nickname",
        description: "Nickname must be 2-50 characters and contain only letters, numbers, spaces, hyphens, and underscores",
        variant: "destructive"
      });
      return;
    }

    if (!validateMatchTitle(sanitizedTitle)) {
      toast({
        title: "Invalid Title",
        description: "Title must be less than 100 characters",
        variant: "destructive"
      });
      return;
    }

    if (!validateDescription(sanitizedDescription)) {
      toast({
        title: "Invalid Description",
        description: "Description must be less than 500 characters",
        variant: "destructive"
      });
      return;
    }

    if (!validateLocation(sanitizedLocation)) {
      toast({
        title: "Invalid Location",
        description: "Location must be less than 200 characters",
        variant: "destructive"
      });
      return;
    }

    if (!validatePrice(formData.price_per_player)) {
      toast({
        title: "Invalid Price",
        description: "Price must be between 0 and 1000 zł",
        variant: "destructive"
      });
      return;
    }

    if (!validateMaxPlayers(formData.max_players)) {
      toast({
        title: "Invalid Max Players",
        description: "Max players must be between 2 and 22",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const creatorId = crypto.randomUUID();
      
      const matchData = {
        title: sanitizedTitle || null,
        description: sanitizedDescription || null,
        match_date: formData.match_date || null,
        match_time: formData.match_time || null,
        location: sanitizedLocation || null,
        location_lat: formData.location_lat,
        location_lng: formData.location_lng,
        max_players: formData.max_players ? parseInt(formData.max_players) : null,
        price_per_player: formData.price_per_player ? parseFloat(formData.price_per_player) : null,
        creator_id: creatorId,
        creator_nickname: sanitizedNickname
      };

      console.log('Submitting match data:', matchData);

      const { error } = await supabase
        .from('matches')
        .insert(matchData);

      if (error) throw error;

      toast({
        title: "Match Created! ⚽",
        description: `Match "${sanitizedTitle}" created successfully!`
      });

      // Store creator info in localStorage for managing requests
      localStorage.setItem('football_creator_id', creatorId);
      localStorage.setItem('football_creator_nickname', sanitizedNickname);

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
                placeholder="Your nickname (2-50 characters)"
                className="glass-input"
                maxLength={50}
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
                maxLength={100}
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
              maxLength={500}
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
            <Label className="text-white font-semibold">
              Location
            </Label>
            <GooglePlacesAutocomplete
              onPlaceSelect={handleLocationSelect}
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              placeholder="Search for stadium or field location"
              className="glass-input"
            />
            {formData.location_lat && formData.location_lng && (
              <p className="text-green-400 text-sm">
                ✓ Location coordinates: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
              </p>
            )}
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

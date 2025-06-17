
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Users, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeamPositionSelector from "./TeamPositionSelector";

interface JoinMatchFormProps {
  matchId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const JoinMatchForm: React.FC<JoinMatchFormProps> = ({ matchId, onCancel, onSuccess }) => {
  const [playerName, setPlayerName] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !position || !team) {
      toast({
        title: "Missing Information",
        description: "Please enter your name, select a team, and choose a position",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('=== JOIN REQUEST START ===');
      console.log('Match ID:', matchId);
      console.log('Player Name:', playerName.trim());
      console.log('Team:', team);
      console.log('Position:', position);
      
      // Check if user already has a pending request for this match
      console.log('Checking for existing requests...');
      const { data: existingRequest, error: checkError } = await supabase
        .from('match_requests')
        .select('id')
        .eq('match_id', matchId)
        .eq('participant_name', playerName.trim())
        .eq('status', 'pending')
        .maybeSingle();

      console.log('Existing request check result:', { existingRequest, checkError });

      if (checkError) {
        console.error('Error checking existing requests:', checkError);
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (existingRequest) {
        console.log('Found existing request, showing message');
        toast({
          title: "Request Already Sent",
          description: "You already have a pending request for this match.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create new request
      console.log('Creating new join request...');
      const requestData = {
        match_id: matchId,
        participant_name: playerName.trim(),
        position: position,
        status: 'pending' as const
      };
      console.log('Request data:', requestData);

      const { data: newRequest, error: insertError } = await supabase
        .from('match_requests')
        .insert(requestData)
        .select()
        .single();

      console.log('Insert result:', { newRequest, insertError });

      if (insertError) {
        console.error('Insert error details:', insertError);
        
        // Handle specific error cases
        if (insertError.code === '23503') {
          throw new Error('Match not found. Please refresh the page and try again.');
        } else if (insertError.code === '23505') {
          throw new Error('You already have a request for this match.');
        } else {
          throw new Error(`Failed to send request: ${insertError.message}`);
        }
      }

      console.log('Request successfully created:', newRequest);
      console.log('=== JOIN REQUEST SUCCESS ===');

      toast({
        title: "Request Sent! ⚽",
        description: `Your request to join Team ${team} as ${position} has been sent. The match creator will review it soon.`
      });

      onSuccess();
    } catch (error: any) {
      console.error('=== JOIN REQUEST ERROR ===');
      console.error('Error details:', error);
      
      const errorMessage = error?.message || 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
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
          <Users className="w-5 h-5 text-emerald-400" />
          Request to Join Match
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
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Your request will be sent to the match creator for approval</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

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

          <TeamPositionSelector
            team={team}
            position={position}
            onTeamChange={setTeam}
            onPositionChange={setPosition}
            required
          />

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
              disabled={!playerName.trim() || !position || !team || loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Sending...' : 'Send Request ⚽'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoinMatchForm;

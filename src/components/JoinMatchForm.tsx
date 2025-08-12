
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Users, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeamPositionSelector from "./TeamPositionSelector";
import { validatePlayerName, sanitizeString } from "@/utils/validation";

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
    
    console.log('=== JOIN REQUEST FORM SUBMISSION START ===');
    console.log('Form data:', { matchId, playerName, team, position });
    
    // Enhanced validation
    const sanitizedName = sanitizeString(playerName);
    console.log('Sanitized name:', sanitizedName);
    
    if (!validatePlayerName(sanitizedName)) {
      console.error('Validation failed: Invalid player name');
      toast({
        title: "Invalid Name",
        description: "Name must be 2-50 characters and contain only letters, numbers, spaces, hyphens, and underscores",
        variant: "destructive"
      });
      return;
    }

    if (!position || !team) {
      console.error('Validation failed: Missing team or position');
      toast({
        title: "Missing Information",
        description: "Please select a team and choose a position",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('=== STARTING DATABASE OPERATIONS ===');
      
      // Check if user already has a pending request for this match
      console.log('Step 1: Checking for existing requests...');
      const { data: existingRequest, error: checkError } = await supabase
        .from('match_requests')
        .select('id')
        .eq('match_id', matchId)
        .eq('participant_name', sanitizedName)
        .eq('status', 'pending')
        .maybeSingle();

      console.log('Existing request check:', { existingRequest, checkError });

      if (checkError) {
        console.error('Database error during existing request check:', checkError);
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (existingRequest) {
        console.log('Found existing request, aborting');
        toast({
          title: "Request Already Sent",
          description: "You already have a pending request for this match.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create new request with team selection
      console.log('Step 2: Creating new join request...');
      const requestData = {
        match_id: matchId,
        participant_name: sanitizedName,
        position: position,
        team: team,
        status: 'pending' as const
      };
      console.log('Request data to insert:', requestData);

      const { data: newRequest, error: insertError } = await supabase
        .from('match_requests')
        .insert(requestData)
        .select()
        .single();

      console.log('Insert operation result:', { newRequest, insertError });

      if (insertError) {
        console.error('Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Handle specific error cases
        if (insertError.code === '23503') {
          throw new Error('Match not found. Please refresh the page and try again.');
        } else if (insertError.code === '23505') {
          throw new Error('You already have a request for this match.');
        } else {
          throw new Error(`Failed to send request: ${insertError.message}`);
        }
      }

      if (!newRequest) {
        console.error('No data returned from insert operation');
        throw new Error('Failed to create request - no data returned');
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
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Full error object:', error);
      
      const errorMessage = error?.message || 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('=== JOIN REQUEST FORM SUBMISSION END ===');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="glass-card border-none shadow-2xl animate-fade-in w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg sm:text-xl font-orbitron text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">Request to Join Match</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-2 text-blue-400 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">Your request will be sent to the match creator for approval</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-white font-semibold text-sm">
                Your Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name (2-50 characters)"
                className="glass-input text-sm"
                maxLength={50}
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

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white text-sm order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!playerName.trim() || !position || !team || loading}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm order-1 sm:order-2"
              >
                {loading ? 'Sending...' : 'Send Request ⚽'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinMatchForm;

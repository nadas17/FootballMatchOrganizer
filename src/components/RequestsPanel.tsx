
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MatchRequest } from "@/types/match";
import { getCreatorInfo } from "@/utils/localStorage";

interface RequestsPanelProps {
  creatorId: string;
}

const RequestsPanel: React.FC<RequestsPanelProps> = ({ creatorId }) => {
  const [requests, setRequests] = useState<(MatchRequest & { match_title: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('match_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_requests'
        },
        (payload) => {
          console.log('RequestsPanel: Real-time update received:', payload);
          fetchRequests();
        }
      )
      .subscribe((status) => {
        console.log('RequestsPanel: Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [creatorId]);

  const fetchRequests = async () => {
    console.log('=== FETCHING REQUESTS ===');
    console.log('Creator ID:', creatorId);
    
    try {
      // Try filtering by creator_id first; if no results, fallback to creator_nickname
      const { creatorNickname } = getCreatorInfo();
      let data: any[] | null = null;
      let error: any = null;

      if (creatorId) {
        const res = await supabase
          .from('match_requests')
          .select(`
            id,
            match_id,
            participant_name,
            status,
            position,
            team,
            created_at,
            matches!inner(title, creator_id, creator_nickname)
          `)
          .eq('matches.creator_id', creatorId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        data = res.data as any[] | null;
        error = res.error;
      }

      if (!error && (!data || data.length === 0) && creatorNickname) {
        console.log('No requests found by creator_id, falling back to creator_nickname:', creatorNickname);
        const resByNick = await supabase
          .from('match_requests')
          .select(`
            id,
            match_id,
            participant_name,
            status,
            position,
            team,
            created_at,
            matches!inner(title, creator_id, creator_nickname)
          `)
          .eq('matches.creator_nickname', creatorNickname)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        data = resByNick.data as any[] | null;
        error = resByNick.error;
      }

      console.log('Requests query result:', { data, error });

      if (error) {
        console.error('Error fetching requests:', error);
        throw error;
      }

      const requestsWithMatchTitle = data?.map(request => ({
        id: request.id,
        match_id: request.match_id,
        participant_name: request.participant_name,
        status: request.status as 'pending' | 'approved' | 'rejected',
        created_at: request.created_at,
        position: request.position,
        team: request.team,
        match_title: request.matches?.title || 'Untitled Match'
      })) || [];

      console.log('Processed requests:', requestsWithMatchTitle);
      setRequests(requestsWithMatchTitle);
    } catch (error) {
      console.error('RequestsPanel fetchRequests error:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
  };

  const getPositionBadge = (position: string | null) => {
    if (!position) return null;
    
    const positionConfig = {
      goalkeeper: { icon: '🥅', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      defense: { icon: '🛡️', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      midfield: { icon: '⚡', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      attack: { icon: '⚽', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };

    const config = positionConfig[position as keyof typeof positionConfig];
    if (!config) return null;

    return (
      <Badge className={`${config.color} text-xs`}>
        {config.icon} {position.charAt(0).toUpperCase() + position.slice(1)}
      </Badge>
    );
  };

  const getTeamBadge = (team: string | null) => {
    if (!team) return null;
    
    const teamConfig = {
      'A': { icon: '🔴', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      'B': { icon: '🔵', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    };

    const config = teamConfig[team as keyof typeof teamConfig];
    if (!config) return null;

    return (
      <Badge className={`${config.color} text-xs`}>
        {config.icon} Team {team}
      </Badge>
    );
  };

  const handleRequest = async (requestId: string, action: 'approved' | 'rejected', matchId: string, participantName: string, position: string | null, team: string | null) => {
    console.log('=== HANDLING REQUEST ===');
    console.log('Request details:', { requestId, action, matchId, participantName, position, team });
    
    try {
      // Update request status first
      console.log('Step 1: Updating request status...');
      const { error: updateError } = await supabase
        .from('match_requests')
        .update({ status: action })
        .eq('id', requestId);

      console.log('Request status update result:', { updateError });

      if (updateError) {
        console.error('Failed to update request status:', updateError);
        throw new Error(`Failed to update request status: ${updateError.message}`);
      }

      if (action === 'approved') {
        console.log('Step 2: Adding participant to match...');
        
        // Check if participant already exists
        const { data: existingParticipant, error: checkError } = await supabase
          .from('match_participants')
          .select('id')
          .eq('match_id', matchId)
          .eq('participant_name', participantName)
          .single();

        console.log('Existing participant check:', { existingParticipant, checkError });

        if (!existingParticipant) {
          // Add participant to match with selected team and position
          const participantData = {
            match_id: matchId,
            participant_name: participantName,
            position: position,
            team: team
          };
          
          console.log('Adding participant with data:', participantData);
          
          const { error: insertError } = await supabase
            .from('match_participants')
            .insert(participantData);

          console.log('Participant insert result:', { insertError });

          if (insertError) {
            console.error('Failed to add participant:', insertError);
            throw new Error(`Failed to add participant: ${insertError.message}`);
          }

          // Get current participant count and update current_players
          console.log('Step 3: Updating participant count...');
          const { data: participants, error: countError } = await supabase
            .from('match_participants')
            .select('id')
            .eq('match_id', matchId);

          console.log('Participant count query:', { participants, countError });

          if (!countError && participants) {
            const actualCount = participants.length;
            console.log('Updating match with participant count:', actualCount);

            const { error: matchUpdateError } = await supabase
              .from('matches')
              .update({ current_players: actualCount })
              .eq('id', matchId);

            console.log('Match update result:', { matchUpdateError });
          }
        } else {
          console.log('Participant already exists, skipping insert');
        }
      }

      console.log('=== REQUEST HANDLED SUCCESSFULLY ===');

      toast({
        title: action === 'approved' ? "Request Approved! ⚽" : "Request Rejected",
        description: `${participantName}'s request has been ${action}.`
      });

      // Refresh requests
      fetchRequests();
    } catch (error: any) {
      console.error('=== REQUEST HANDLING ERROR ===');
      console.error('Error details:', error);
      
      toast({
        title: "Error",
        description: error?.message || "Failed to process request",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-none shadow-2xl">
        <CardContent className="p-6">
          <div className="text-white/70 text-center">Loading requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-none shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-orbitron text-white flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span className="hidden sm:inline">Join Requests</span>
            <span className="sm:hidden">Requests</span>
            {requests.length > 0 && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse text-xs">
                {requests.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {requests.length === 0 ? (
          <div className="text-white/70 text-center py-6 sm:py-8">
            <Users className="w-8 h-8 sm:w-12 sm:h-12 text-white/30 mx-auto mb-3 sm:mb-4" />
            <p className="font-semibold text-sm sm:text-base">No pending requests</p>
            <p className="text-xs mt-1 sm:mt-2 text-white/50">New join requests will appear here</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="truncate">{request.participant_name}</span>
                  </h4>
                  <p className="text-white/70 text-xs sm:text-sm truncate">{request.match_title}</p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                    {getPositionBadge(request.position)}
                    {getTeamBadge(request.team)}
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1 text-xs">
                      <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                      Pending
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-white/60 text-xs mb-3 sm:mb-4">
                {new Date(request.created_at).toLocaleDateString('en-GB')} at {new Date(request.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRequest(request.id, 'approved', request.match_id, request.participant_name, request.position, request.team)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs sm:text-sm py-2"
                  size="sm"
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Approve</span>
                  <span className="sm:hidden">✓</span>
                </Button>
                <Button
                  onClick={() => handleRequest(request.id, 'rejected', request.match_id, request.participant_name, request.position, request.team)}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm py-2"
                  size="sm"
                >
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Reject</span>
                  <span className="sm:hidden">✗</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsPanel;

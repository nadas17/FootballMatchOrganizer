
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MatchRequest } from "@/types/match";

interface RequestsPanelProps {
  creatorId: string;
}

const RequestsPanel: React.FC<RequestsPanelProps> = ({ creatorId }) => {
  const [requests, setRequests] = useState<(MatchRequest & { match_title: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('RequestsPanel mounted with creatorId:', creatorId);
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
          console.log('Real-time update received:', payload);
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [creatorId]);

  const fetchRequests = async () => {
    try {
      console.log('Fetching requests for creator:', creatorId);
      
      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          *,
          matches!inner(title, creator_id)
        `)
        .eq('matches.creator_id', creatorId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('Raw requests data:', data);
      console.log('Requests fetch error:', error);

      if (error) throw error;

      const requestsWithMatchTitle = data?.map(request => ({
        id: request.id,
        match_id: request.match_id,
        participant_name: request.participant_name,
        status: request.status as 'pending' | 'approved' | 'rejected',
        created_at: request.created_at,
        position: request.position,
        match_title: request.matches?.title || 'Untitled Match'
      })) || [];

      console.log('Processed requests:', requestsWithMatchTitle);
      setRequests(requestsWithMatchTitle);
    } catch (error) {
      console.error('Error fetching requests:', error);
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

  const handleRequest = async (requestId: string, action: 'approved' | 'rejected', matchId: string, participantName: string, position: string | null, team?: string) => {
    try {
      console.log('Handling request:', { requestId, action, matchId, participantName, position, team });
      
      // Update request status
      const { error: updateError } = await supabase
        .from('match_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (action === 'approved') {
        // Add participant to match with team assignment
        const { error: insertError } = await supabase
          .from('match_participants')
          .insert({
            match_id: matchId,
            participant_name: participantName,
            position: position,
            team: team || null
          });

        if (insertError) throw insertError;

        // Get current participant count and update current_players
        const { data: participants } = await supabase
          .from('match_participants')
          .select('id')
          .eq('match_id', matchId);

        const actualCount = participants?.length || 0;

        const { error: countError } = await supabase
          .from('matches')
          .update({ current_players: actualCount })
          .eq('id', matchId);

        if (countError) throw countError;
      }

      toast({
        title: action === 'approved' ? "Request Approved! ⚽" : "Request Rejected",
        description: `${participantName}'s request has been ${action}.`
      });

      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error handling request:', error);
      toast({
        title: "Error",
        description: "Failed to process request",
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-orbitron text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Join Requests
            {requests.length > 0 && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
                {requests.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-white/70 text-center py-8">
            <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="font-semibold">No pending requests</p>
            <p className="text-xs mt-2 text-white/50">New join requests will appear here</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    {request.participant_name}
                  </h4>
                  <p className="text-white/70 text-sm">{request.match_title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getPositionBadge(request.position)}
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-white/60 text-xs mb-4">
                Requested {new Date(request.created_at).toLocaleDateString('en-GB')} at {new Date(request.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRequest(request.id, 'approved', request.match_id, request.participant_name, request.position)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleRequest(request.id, 'rejected', request.match_id, request.participant_name, request.position)}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  size="sm"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
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

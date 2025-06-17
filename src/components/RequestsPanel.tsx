
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MatchRequest } from "@/types/match";

interface RequestsPanelProps {
  creatorId: string;
}

const RequestsPanel: React.FC<RequestsPanelProps> = ({ creatorId }) => {
  const [requests, setRequests] = useState<(MatchRequest & { match_title: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('RequestsPanel mounted with creatorId:', creatorId);
    fetchRequests();
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
        match_title: request.matches?.title || 'Untitled Match'
      })) || [];

      console.log('Processed requests:', requestsWithMatchTitle);
      setRequests(requestsWithMatchTitle);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'approved' | 'rejected', matchId: string, participantName: string) => {
    try {
      console.log('Handling request:', { requestId, action, matchId, participantName });
      
      // Update request status
      const { error: updateError } = await supabase
        .from('match_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (action === 'approved') {
        // Add participant to match
        const { error: insertError } = await supabase
          .from('match_participants')
          .insert({
            match_id: matchId,
            participant_name: participantName,
            team: null // Will be assigned later
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
        <CardTitle className="text-xl font-orbitron text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Join Requests
          {requests.length > 0 && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {requests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-white/70 text-center py-4">
            <p>No pending requests at the moment.</p>
            <p className="text-xs mt-2 text-white/50">Creator ID: {creatorId}</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white">{request.participant_name}</h4>
                  <p className="text-white/70 text-sm">{request.match_title}</p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </Badge>
              </div>
              
              <div className="text-white/60 text-xs mb-4">
                Requested {new Date(request.created_at).toLocaleDateString('en-GB')} at {new Date(request.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRequest(request.id, 'approved', request.match_id, request.participant_name)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleRequest(request.id, 'rejected', request.match_id, request.participant_name)}
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

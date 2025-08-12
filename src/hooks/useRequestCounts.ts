
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useRequestCounts = (creatorId: string | null) => {
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [totalRequestCount, setTotalRequestCount] = useState(0);

  const fetchRequestCounts = useCallback(async () => {
    if (!creatorId) {
      console.log('useRequestCounts: No creator ID provided');
      return;
    }
    
    console.log('=== FETCHING REQUEST COUNTS ===');
    console.log('Creator ID:', creatorId);
    
    try {
      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          match_id,
          matches!inner(creator_id)
        `)
        .eq('matches.creator_id', creatorId)
        .eq('status', 'pending');
      
      console.log('Request counts query result:', { data, error });
      
      if (error) {
        console.error('Error fetching request counts:', error);
        throw error;
      }
      
      const counts: Record<string, number> = {};
      let total = 0;
      data?.forEach(request => {
        counts[request.match_id] = (counts[request.match_id] || 0) + 1;
        total++;
      });
      
      console.log('Processed counts:', { counts, total });
      
      setRequestCounts(counts);
      setTotalRequestCount(total);
    } catch (error) {
      console.error('useRequestCounts error:', error);
    }
  }, [creatorId]);

  useEffect(() => {
    if (creatorId) {
      console.log('useRequestCounts: Setting up for creator:', creatorId);
      fetchRequestCounts();
      
      const channel = supabase
        .channel('requests_count_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_requests'
          },
          (payload) => {
            console.log('Real-time update received:', payload);
            fetchRequestCounts();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        console.log('Cleaning up subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [creatorId, fetchRequestCounts]);

  return {
    requestCounts,
    totalRequestCount,
    refetchRequestCounts: fetchRequestCounts
  };
};

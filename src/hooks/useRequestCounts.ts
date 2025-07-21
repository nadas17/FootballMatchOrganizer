import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useRequestCounts = (creatorId: string | null) => {
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [totalRequestCount, setTotalRequestCount] = useState(0);

  const fetchRequestCounts = useCallback(async () => {
    if (!creatorId) return;
    try {
      const { data, error } = await supabase
        .from('match_requests')
        .select(`
          match_id,
          matches!inner(creator_id)
        `)
        .eq('matches.creator_id', creatorId)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      let total = 0;
      data?.forEach(request => {
        counts[request.match_id] = (counts[request.match_id] || 0) + 1;
        total++;
      });
      
      setRequestCounts(counts);
      setTotalRequestCount(total);
    } catch {}
  }, [creatorId]);

  useEffect(() => {
    if (creatorId) {
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
          () => {
            fetchRequestCounts();
          }
        )
        .subscribe();

      return () => {
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

import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getCreatorInfo } from "@/utils/localStorage";

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
      // Try filtering by creator_id first; if no results, fallback to creator_nickname
      const { creatorNickname } = getCreatorInfo();
      let data: any[] | null = null;
      let error: any = null;

      if (creatorId) {
        const res = await supabase
          .from('match_requests')
          .select(`
            match_id,
            matches!inner(creator_id, creator_nickname)
          `)
          .eq('matches.creator_id', creatorId)
          .eq('status', 'pending');
        data = res.data as any[] | null;
        error = res.error;
      }

      if (!error && (!data || data.length === 0) && creatorNickname) {
        console.log('useRequestCounts: No counts by creator_id, fallback to creator_nickname:', creatorNickname);
        const resByNick = await supabase
          .from('match_requests')
          .select(`
            match_id,
            matches!inner(creator_id, creator_nickname)
          `)
          .eq('matches.creator_nickname', creatorNickname)
          .eq('status', 'pending');
        data = resByNick.data as any[] | null;
        error = resByNick.error;
      }
      
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

import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MatchData } from "@/types/match";
import { useToast } from "@/hooks/use-toast";

export const useMatches = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (matchesError) throw matchesError;

      const { data: participantsData, error: participantsError } = await supabase
        .from('match_participants')
        .select('*');

      if (participantsError) throw participantsError;

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('username, stars');

      const matchesWithParticipants: MatchData[] = matchesData?.map(match => ({
        ...match,
        participants: participantsData?.filter(p => p.match_id === match.id).map(participant => ({
          ...participant,
          profiles: profilesData?.find(profile => profile.username === participant.participant_name) || null
        })) || []
      })) || [];

      setMatches(matchesWithParticipants);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const sortedMatches = useMemo(() => {
    const now = new Date();
    const getMatchDateTime = (match: MatchData) => {
      if (!match.match_date || !match.match_time) return null;
      const [year, month, day] = match.match_date.split('-').map(Number);
      const [hours, minutes, seconds] = match.match_time.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    return matches.sort((a, b) => {
      const aDateTime = getMatchDateTime(a);
      const bDateTime = getMatchDateTime(b);
      const isAUpcoming = aDateTime ? aDateTime > now : false;
      const isBUpcoming = bDateTime ? bDateTime > now : false;
      
      if (isAUpcoming && !isBUpcoming) return -1;
      if (!isAUpcoming && isBUpcoming) return 1;
      if (isAUpcoming && isBUpcoming && aDateTime && bDateTime) {
        return aDateTime.getTime() - bDateTime.getTime();
      }
      if (aDateTime && bDateTime) {
        return bDateTime.getTime() - aDateTime.getTime();
      }
      if (aDateTime && !bDateTime) return -1;
      if (!aDateTime && bDateTime) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [matches]);

  const upcomingMatches = useMemo(() => {
    const now = new Date();
    const getMatchDateTime = (match: MatchData) => {
      if (!match.match_date || !match.match_time) return null;
      const isoString = `${match.match_date}T${match.match_time}`;
      const dateObj = new Date(isoString);
      if (isNaN(dateObj.getTime())) {
        const [year, month, day] = match.match_date.split('-').map(Number);
        const [hours, minutes, seconds] = match.match_time.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }
      return dateObj;
    };

    return sortedMatches.filter(m => {
      const matchDateTime = getMatchDateTime(m);
      return matchDateTime ? matchDateTime > now : false;
    });
  }, [sortedMatches]);

  const nextMatch = upcomingMatches[0];

  return {
    matches: sortedMatches,
    upcomingMatches,
    nextMatch,
    loading,
    refetchMatches: fetchMatches
  };
};
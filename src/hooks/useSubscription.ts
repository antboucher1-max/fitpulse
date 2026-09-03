import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useSubscription(userId?: string) {
  const [tier, setTier] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchTier = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setTier(data.subscription_tier || 'free');
      }
      setLoading(false);
    };

    fetchTier();
  }, [userId]);

  const isPro = tier === 'pro';

  return { tier, isPro, loading };
}

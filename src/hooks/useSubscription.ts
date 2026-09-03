import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useSubscription(userId?: string) {
  const [tier, setTier] = useState<'free' | 'pro'>('free');
  const [trialExpiresAt, setTrialExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSubscriptionData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, trial_expires_at')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setTier(data.subscription_tier || 'free');
        setTrialExpiresAt(data.trial_expires_at);
      }
      setLoading(false);
    };

    fetchSubscriptionData();
  }, [userId]);

  // Vérifie si le pass découverte de 24h est encore actif
  const isTrialActive = trialExpiresAt ? new Date().getTime() < new Date(trialExpiresAt).getTime() : false;
  
  // L'utilisateur est Pro s'il a le tier pro OU si son essai 24h est en cours
  const isPro = tier === 'pro' || isTrialActive;

  return { tier, isPro, isTrialActive, loading, setTier, setTrialExpiresAt };
}

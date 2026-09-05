import { ReactNode, useState } from 'react';
import { Lock, Sparkles, Gift, ShieldAlert } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../supabaseClient';

interface PaywallGateProps {
  userId?: string;
  featureName: string;
  currentUserProfile?: any;
  children: ReactNode;
}

export default function PaywallGate({ userId, featureName, currentUserProfile, children }: PaywallGateProps) {
  const { isPro, loading } = useSubscription(userId);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activating, setActivating] = useState(false);

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">Vérification des accès...</div>;
  }

  // Lecture sécurisée du profil ou fallback direct
  const trialActivatedAt = currentUserProfile?.trial_activated_at;
  const trialUsed = currentUserProfile?.trial_used || false;

  const now = Date.now();
  const trialExpiryTime = trialActivatedAt ? new Date(trialActivatedAt).getTime() + (24 * 60 * 60 * 1000) : 0;
  const isTrialActive = trialActivatedAt ? now < trialExpiryTime : false;

  // Si l'utilisateur est Pro ou si son essai 24h unique est en cours
  if (isPro || isTrialActive) {
    return <>{children}</>;
  }

  const handleSubscribePro = async () => {
    if (!userId) {
      alert("Identifiant utilisateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    setIsRedirecting(true);
    try {
      const response = await fetch('https://obtahwmcoqrcauscpksv.supabase.co/functions/v1/bright-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de l'initialisation du paiement : " + (data.error || "Inconnue"));
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Erreur Stripe :", error);
      alert("Impossible de joindre le service de paiement.");
      setIsRedirecting(false);
    }
  };

  const handleActivate24hTrial = async () => {
    if (!userId) {
      alert("Erreur : Utilisateur non connectés.");
      return;
    }

    setActivating(true);
    const nowIso = new Date().toISOString();

    // Mise à jour directe de la table profiles dans Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ 
        trial_activated_at: nowIso,
        trial_used: true 
      })
      .eq('id', userId);

    setActivating(false);

    if (!error) {
      alert("🎉 Pass Pro 24h unique activé ! Profite de toutes les fonctionnalités avancées.");
      window.location.reload();
    } else {
      alert("Erreur lors de l'activation du pass : " + error.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-orange-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden my-4">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/30">
        <Lock className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-black text-white">Fonctionnalité Pro : {featureName}</h3>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
          Passe à <strong className="text-orange-400">FitPulse Pro</strong> pour débloquer cette intelligence avancée et propulser ton entraînement.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSubscribePro}
        disabled={isRedirecting}
        className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" /> {isRedirecting ? 'Redirection vers Stripe...' : "S'abonner à FitPulse Pro (1,00 €/mois)"}
      </button>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-neutral-800"></div>
        <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-neutral-500">ou</span>
        <div className="flex-grow border-t border-neutral-800"></div>
      </div>

      {!trialUsed ? (
        <button
          type="button"
          onClick={handleActivate24hTrial}
          disabled={activating}
          className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-orange-400 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-orange-500/20"
        >
          <Gift className="w-4 h-4" /> {activating ? 'Activation en cours...' : 'Activer mon Pass Pro découverte 24h gratuit'}
        </button>
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl text-xs text-neutral-400 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-400" /> Pass découverte 24h déjà utilisé par le passé.
        </div>
      )}
    </div>
  );
}

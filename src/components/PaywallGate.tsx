import { ReactNode, useState } from 'react';
import { Lock, Sparkles, Gift } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../supabaseClient';

interface PaywallGateProps {
  userId?: string;
  featureName: string;
  children: ReactNode;
}

export default function PaywallGate({ userId, featureName, children }: PaywallGateProps) {
  const { isPro, loading } = useSubscription(userId);
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">Vérification des accès...</div>;
  }

  // Si l'utilisateur est Pro ou a un essai actif, on affiche la fonctionnalité
  if (isPro) {
    return <>{children}</>;
  }

  // Fonction pour déclencher le tunnel de paiement Stripe via l'Edge Function Supabase
  const handleSubscribePro = async () => {
    if (!userId) {
      alert("Identifiant utilisateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    setIsRedirecting(true);
    try {
      const response = await fetch('https://obtahwmcoqrcauscpksv.supabase.co/functions/v1/bright-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirection vers Stripe Checkout
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

  // Fonction pour activer le Pass Découverte 24h dans Supabase
  const handleActivate24hTrial = async () => {
    if (!userId) return;
    
    const expirationDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({ trial_expires_at: expirationDate })
      .eq('id', userId);

    if (!error) {
      alert("🎉 Pass Pro 24h activé ! Profite de toutes les fonctionnalités avancées.");
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

      {/* Bouton d'abonnement payant (Stripe Checkout dynamique) */}
      <button
        type="button"
        onClick={handleSubscribePro}
        disabled={isRedirecting}
        className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" /> {isRedirecting ? 'Redirection vers Stripe...' : "S'abonner à FitPulse Pro (1,00 €/mois)"}
      </button>

      {/* Séparateur visuel */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-neutral-800"></div>
        <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-neutral-500">ou</span>
        <div className="flex-grow border-t border-neutral-800"></div>
      </div>

      {/* Bouton du Pass Découverte 24h */}
      <button
        type="button"
        onClick={handleActivate24hTrial}
        className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-orange-400 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-orange-500/20"
      >
        <Gift className="w-4 h-4" /> Activer mon Pass Pro découverte 24h gratuit
      </button>
    </div>
  );
}

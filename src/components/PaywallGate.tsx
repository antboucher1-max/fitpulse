import { ReactNode } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface PaywallGateProps {
  userId?: string;
  featureName: string;
  children: ReactNode;
}

export default function PaywallGate({ userId, featureName, children }: PaywallGateProps) {
  const { isPro, loading } = useSubscription(userId);

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">Vérification des accès...</div>;
  }

  // Si l'utilisateur est Pro, on affiche la fonctionnalité normalement
  if (isPro) {
    return <>{children}</>;
  }

  // Sinon, on affiche le mur de payement (Paywall) élégant
  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-orange-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden my-4">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/30">
        <Lock className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-black text-white">Fonctionnalité Pro : {featureName}</h3>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
          Passe à <strong className="text-orange-400">ApexWod Pro</strong> pour débloquer cette intelligence avancée et propulser ton entraînement.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          alert("Redirection vers le tunnel de paiement Stripe (Simulation)");
        }}
        className="py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
      >
        <Sparkles className="w-4 h-4" /> Débloquer ApexWod Pro (9.99 €/mois)
      </button>
    </div>
  );
}

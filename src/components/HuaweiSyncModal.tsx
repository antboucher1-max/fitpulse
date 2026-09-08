import { useState } from 'react';
import { Watch, CheckCircle2, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { setWearableConnected } from '../utils/wearableConnections';

interface HuaweiSyncModalProps {
  currentUserId?: string;
  onClose: () => void;
  onSynced: () => void;
}

export default function HuaweiSyncModal({ currentUserId, onClose, onSynced }: HuaweiSyncModalProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncedSuccess, setSyncedSuccess] = useState(false);

  const handleSimulateHuaweiSync = async () => {
    if (!currentUserId) return;
    setSyncing(true);

    // Simulation d'une synchronisation Cloud Huawei Health (Récupération de la dernière course)
    setTimeout(async () => {
      const { error } = await supabase.from('posts').insert([{
        user_id: currentUserId,
        username: 'Athlète Apex',
        avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
        club_name: 'Tournai (Quais de l’Escaut & Parc)',
        session_type: 'Footing / VMA (Huawei Watch)',
        caption: '⚡ Session synchronisée depuis Huawei Health : 10.2 km en 48:30 (FC Moy : 154 bpm).',
        exercises: [],
        likes_count: 0,
        liked_by: [],
        comments_count: 0,
        comments: [],
        is_private: false
      }]);

      setSyncing(false);
      if (!error) {
        setSyncedSuccess(true);
        // Aligne Huawei sur le même statut partagé que Garmin/Strava (voir
        // utils/wearableConnections.ts), pour que les 3 intégrations
        // répondent de façon cohérente à "suis-je connecté ?".
        setWearableConnected('huawei', true);
        setTimeout(() => {
          onSynced();
          onClose();
        }, 1500);
      } else {
        alert("Erreur lors de la synchronisation : " + error.message);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Huawei Health Connect</h3>
              <p className="text-[10px] text-neutral-400">Passerelle montre & bracelet connectés</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-neutral-400 hover:text-white rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs text-neutral-300">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> Appareil détecté à proximité
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Connexion sécurisée au cloud Huawei Health pour importer automatiquement tes entraînements, ta fréquence cardiaque et tes pas quotidiens.
          </p>
        </div>

        {!syncedSuccess ? (
          <button
            type="button"
            onClick={handleSimulateHuaweiSync}
            disabled={syncing}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Synchronisation en cours...
              </>
            ) : (
              <>
                🔄 Synchroniser mes dernières perfs Huawei
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" /> Synchronisé avec succès ! 🚀
          </div>
        )}

      </div>
    </div>
  );
}

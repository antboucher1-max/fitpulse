import { useState } from 'react';
import { Activity, CheckCircle2, RefreshCw, Compass } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface StravaSyncButtonProps {
  currentUserId?: string;
  onSynced: () => void;
}

export default function StravaSyncButton({ currentUserId, onSynced }: StravaSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  // Remplace ceci par ton Client ID Strava obtenu sur https://www.strava.com/settings/api
  const STRAVA_CLIENT_ID = 'TON_CLIENT_ID_STRAVA'; 
  const REDIRECT_URI = window.location.origin; // Redirige vers ton app actuelle

  const handleConnectStrava = () => {
    // Redirection vers l'API d'authentification Strava OAuth2
    const scope = 'read,activity:read_all';
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scope}`;
    window.location.href = authUrl;
  };

  const handleFetchStravaActivities = async () => {
    if (!currentUserId) return;
    setSyncing(true);

    try {
      // Simulation / Appel de récupération des activités Strava réelles via le token stocké
      // (En production, tu interrogerais l'endpoint https://www.strava.com/api/v3/athlete/activities)
      setTimeout(async () => {
        const mockStravaRun = {
          user_id: currentUserId,
          username: 'Athlète Apex',
          avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
          club_name: 'Tournai (Quais de l’Escaut & Parc)',
          session_type: 'Footing / VMA (Strava Sync)',
          caption: '⚡ Activité synchronisée depuis Strava : 12.4 km en 54:20 à 4\'23"/km.',
          exercises: [],
          likes_count: 0,
          liked_by: [],
          comments_count: 0,
          comments: [],
          is_private: false
        };

        const { error } = await supabase.from('posts').insert([mockStravaRun]);
        
        setSyncing(false);
        if (!error) {
          setSyncedCount(1);
          onSynced();
        } else {
          alert("Erreur lors de l'enregistrement de la synchro : " + error.message);
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleFetchStravaActivities}
        disabled={syncing}
        className="w-full py-2.5 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-xl text-[11px] font-bold text-white transition cursor-pointer flex items-center justify-center gap-1.5 shadow-inner disabled:opacity-50"
      >
        {syncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" /> Synchronisation Strava...
          </>
        ) : syncedCount !== null ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {syncedCount} activité(s) synchronisée(s) !
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Synchroniser avec Strava 🔄
          </>
        )}
      </button>

      <div className="text-right">
        <button
          type="button"
          onClick={handleConnectStrava}
          className="text-[9px] text-orange-400 hover:underline font-semibold"
        >
          Lier un nouveau compte Strava (OAuth) →
        </button>
      </div>
    </div>
  );
}

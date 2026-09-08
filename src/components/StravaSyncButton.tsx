import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, RefreshCw, Compass } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { setWearableConnected } from '../utils/wearableConnections';

interface StravaSyncButtonProps {
  currentUserId?: string;
  onSynced: () => void;
}

export default function StravaSyncButton({ currentUserId, onSynced }: StravaSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  // ⚡ TES PARAMÈTRES STRAVA API (Obtenus sur https://www.strava.com/settings/api)
  const STRAVA_CLIENT_ID = 'TON_CLIENT_ID'; // Remplace par ton Client ID Strava
  const STRAVA_CLIENT_SECRET = 'TON_CLIENT_SECRET'; // Remplace par ton Client Secret
  const REDIRECT_URI = window.location.origin + window.location.pathname;

  // 1. Écoute du retour d'authentification Strava (Code OAuth dans l'URL)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    if (authCode && currentUserId) {
      exchangeTokenAndFetchActivities(authCode);
    }
  }, [currentUserId]);

  const handleConnectStrava = () => {
    const scope = 'read,activity:read_all';
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scope}`;
    window.location.href = authUrl;
  };

  // 2. Échange du code d'autorisation contre un Token Strava & Récupération des activités réelles
  const exchangeTokenAndFetchActivities = async (code: string) => {
    setSyncing(true);
    try {
      // Échange du code contre les tokens auprès de l'API Strava
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) throw new Error("Échec de l'authentification Strava.");

      const accessToken = tokenData.access_token;

      // Récupération des dernières activités réelles de l'athlète sur Strava
      const activitiesResponse = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=5', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const activities = await activitiesResponse.json();

      if (Array.isArray(activities) && activities.length > 0) {
        let importedCount = 0;

        for (const act of activities) {
          // Formatage et insertion de la course/séance dans Supabase (posts)
          const distanceKm = (act.distance / 1000).toFixed(2);
          const movingMinutes = Math.round(act.moving_time / 60);
          const paceMinPerKm = (act.moving_time / 60) / (act.distance / 1000);
          const paceStr = `${Math.floor(paceMinPerKm)}'${Math.round((paceMinPerKm % 1) * 60).toString().padStart(2, '0')}"/km`;

          const sessionTitle = act.type === 'Run' ? 'Footing / Course (Strava Sync)' : `Séance ${act.type} (Strava)`;

          const { error } = await supabase.from('posts').insert([{
            user_id: currentUserId,
            username: act.athlete?.firstname || 'Athlète Apex',
            avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
            club_name: 'Tournai (Quais de l’Escaut & Parc)',
            session_type: sessionTitle,
            caption: `⚡ [STRAVA] ${act.name} : ${distanceKm} km en ${movingMinutes} min (Allure : ${paceStr}).`,
            exercises: [],
            likes_count: 0,
            liked_by: [],
            comments_count: 0,
            comments: [],
            is_private: false
          }]);

          if (!error) importedCount++;
        }

        setSyncedCount(importedCount);
        // Marque la connexion comme réussie dans le statut partagé, pour que
        // ProfileTab.tsx (qui affiche aussi un statut Strava, séparément)
        // reflète cette connexion au lieu de dire "non connecté".
        setWearableConnected('strava', true);
        onSynced();
      }

      // Nettoyage de l'URL pour retirer le code OAuth
      window.history.replaceState({}, document.title, window.location.pathname);
      setSyncing(false);

    } catch (err: any) {
      console.error("Erreur Strava Sync :", err);
      alert("Erreur lors de la synchronisation Strava : " + (err.message || 'Problème réseau'));
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleConnectStrava}
        disabled={syncing}
        className="w-full py-2.5 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-xl text-[11px] font-bold text-white transition cursor-pointer flex items-center justify-center gap-1.5 shadow-inner disabled:opacity-50"
      >
        {syncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" /> Connexion & Synchro Strava...
          </>
        ) : syncedCount !== null ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {syncedCount} activité(s) synchronisée(s) !
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Connecter & Synchroniser Strava 🔄
          </>
        )}
      </button>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Activity, MapPin, Timer, Flame, Trophy, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface FeedHistoryProps {
  currentUserId?: string;
}

export default function FeedHistoryTab({ currentUserId }: FeedHistoryProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [readinessHistory, setReadinessHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchUserData = async () => {
      setLoading(true);
      
      // Récupération des posts / courses publiées
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      // Récupération de l'historique de fatigue / readiness
      const { data: readinessData } = await supabase
        .from('readiness_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .order('date', { ascending: false })
        .limit(5);

      if (postsData) setActivities(postsData);
      if (readinessData) setReadinessHistory(readinessData);
      
      setLoading(false);
    };

    fetchUserData();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-xs text-neutral-400">
        Chargement de l'historique cloud...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/35 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4" /> Historique & Performances Cloud
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Journal d'entraînement</h2>
        </div>
      </div>

      {/* Derniers check-ins de récupération */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Historique de Récupération (Readiness)
        </h3>
        
        {readinessHistory.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4 bg-neutral-950 rounded-2xl border border-neutral-800">
            Aucun check-in enregistré pour le moment.
          </p>
        ) : (
          <div className="space-y-2.5">
            {readinessHistory.map((item, idx) => (
              <div key={idx} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="text-white font-bold">{item.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-neutral-400">Charge : <strong className="text-orange-400">{item.training_load}</strong></span>
                  <span className="text-neutral-400">Récup : <strong className="text-emerald-400">{item.readiness_score}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flux des séances publiées */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" /> Activités & Séances Partagées
        </h3>

        {activities.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-8 bg-neutral-950 rounded-2xl border border-neutral-800">
            Aucune activité enregistrée. Termine et publie une course depuis le mode Running pour la voir apparaître ici !
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{new Date(act.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-orange-400 font-bold">Séance Hybride</span>
                </div>
                <p className="text-xs font-black text-white">{act.caption}</p>
                {act.km && (
                  <div className="flex items-center gap-3 pt-1 text-xs text-neutral-300">
                    <span className="flex items-center gap-1 font-bold text-emerald-400">
                      <MapPin className="w-3.5 h-3.5" /> {act.km} km
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Search, UserPlus, Check, User, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

// CORRECTION DE SCHÉMA : la version d'origine de ce composant cherchait sur
// les colonnes `full_name` et `location`. Le reste de l'app (voir
// OnboardingWizard.tsx, qui écrit vraiment dans la table `profiles`) utilise
// `username` et `home_club`. Ce fichier est corrigé pour utiliser les mêmes
// noms de colonnes que le reste du projet — sinon la recherche n'aurait
// jamais rien trouvé, silencieusement.

interface Profile {
  id: string;
  username: string;
  home_club?: string;
  avatar_url?: string;
}

export default function BuddySearch({ currentUserId }: { currentUserId: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, home_club, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId) // Ne pas se chercher soi-même
        .limit(10);

      if (error) throw error;
      setResults((data as Profile[]) || []);
    } catch (error: any) {
      console.error('Erreur lors de la recherche :', error.message);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (buddyId: string) => {
    // Vérifie d'abord qu'aucune demande n'existe déjà dans un sens ou l'autre,
    // pour éviter les doublons silencieux dans friend_requests.
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${buddyId}),and(sender_id.eq.${buddyId},receiver_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (existing) {
      setSentRequests((prev) => new Set(prev).add(buddyId));
      return;
    }

    // UI Optimiste : on marque comme envoyé tout de suite
    setSentRequests((prev) => new Set(prev).add(buddyId));

    try {
      const { error } = await supabase.from('friend_requests').insert({
        sender_id: currentUserId,
        receiver_id: buddyId,
        status: 'pending',
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de la demande :", error.message);
      // En cas d'erreur, on retire le statut "envoyé"
      setSentRequests((prev) => {
        const next = new Set(prev);
        next.delete(buddyId);
        return next;
      });
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl max-w-md w-full">
      <div className="mb-6">
        <h2 className="text-lg font-black text-white uppercase tracking-tight mb-1">
          Trouver des Buddies
        </h2>
        <p className="text-xs text-neutral-400">Recherche d'autres athlètes FitPulse pour partager tes séances.</p>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-neutral-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par pseudo..."
          className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition placeholder:text-neutral-600"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      <div className="space-y-3">
        {searchQuery.length >= 2 && results.length === 0 && !isSearching && (
          <div className="text-center py-6 text-neutral-500 text-sm">
            Aucun athlète trouvé pour "{searchQuery}".
          </div>
        )}

        {results.map((profile) => {
          const isSent = sentRequests.has(profile.id);

          return (
            <div 
              key={profile.id} 
              className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-2xl transition hover:border-neutral-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-neutral-800 to-neutral-700 rounded-full flex items-center justify-center text-neutral-400 shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{profile.username}</span>
                  {profile.home_club && (
                    <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {profile.home_club}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleSendRequest(profile.id)}
                disabled={isSent}
                className={`shrink-0 p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isSent 
                    ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20 cursor-pointer'
                }`}
              >
                {isSent ? (
                  <>
                    <Check className="w-4 h-4" /> Demandé
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Ajouter
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

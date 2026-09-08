import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { RealUser } from '../types';
import BuddiesChat from './BuddiesChat';

interface BuddiesChatContainerProps {
  currentUserId: string;
}

// BuddiesChat.tsx affiche une seule conversation à la fois (buddyId/buddyName
// reçus en props) — ce conteneur ajoute la liste des amis et la sélection,
// qui manquaient pour que BuddiesChat soit utilisable en pratique.
export default function BuddiesChatContainer({ currentUserId }: BuddiesChatContainerProps) {
  const [buddies, setBuddies] = useState<RealUser[]>([]);
  const [selectedBuddy, setSelectedBuddy] = useState<RealUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBuddies = useCallback(async () => {
    setLoading(true);
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    if (error) {
      console.warn('Erreur chargement des amis :', error.message);
      setLoading(false);
      return;
    }
    if (!requests || requests.length === 0) {
      setBuddies([]);
      setLoading(false);
      return;
    }

    const buddyIds = requests.map((r: any) => (r.sender_id === currentUserId ? r.receiver_id : r.sender_id));
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', buddyIds);

    if (profilesError) {
      console.warn('Erreur chargement des profils amis :', profilesError.message);
    } else if (profiles) {
      setBuddies(profiles as RealUser[]);
    }
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchBuddies();
  }, [fetchBuddies]);

  if (selectedBuddy) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setSelectedBuddy(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </button>
        <BuddiesChat
          currentUserId={currentUserId}
          buddyId={selectedBuddy.id}
          buddyName={selectedBuddy.username}
        />
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <h3 className="text-sm font-black text-white flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-orange-500" /> Messagerie
      </h3>

      {loading ? (
        <p className="text-xs text-neutral-500 text-center py-6">Chargement...</p>
      ) : buddies.length === 0 ? (
        <p className="text-xs text-neutral-500 text-center py-6">
          Aucun ami pour le moment. Ajoute des buddies pour pouvoir discuter avec eux ici.
        </p>
      ) : (
        <div className="space-y-2">
          {buddies.map((buddy) => (
            <button
              key={buddy.id}
              onClick={() => setSelectedBuddy(buddy)}
              className="w-full p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-2xl flex items-center gap-3 transition cursor-pointer text-left"
            >
              <img
                src={buddy.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-neutral-800"
              />
              <span className="text-sm font-bold text-white">{buddy.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

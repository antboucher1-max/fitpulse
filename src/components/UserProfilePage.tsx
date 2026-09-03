import { ArrowLeft, MapPin, Trophy, Flame } from 'lucide-react';
import { RealUser, Post, TransformationPhoto, FriendRequest } from '../types';
import { supabase } from '../supabaseClient'; // Ajuste l'import selon ton projet

interface UserProfilePageProps {
  profileUser: RealUser;
  currentUserId?: string;
  friendRequests: FriendRequest[];
  posts: Post[];
  transformations: TransformationPhoto[];
  onBack: () => void;
  onOpenChat: (user: RealUser) => void;
  onRefreshRequests: () => void;
}

export default function UserProfilePage({
  profileUser,
  currentUserId,
  friendRequests,
  posts,
  transformations,
  onBack,
  onOpenChat,
  onRefreshRequests
}: UserProfilePageProps) {
  const isSelf = currentUserId === profileUser.id;
  const userPosts = posts.filter(p => p.user_id === profileUser.id);
  const userTransformations = transformations.filter(t => t.user_id === profileUser.id);

  const friendship = friendRequests.find(
    req => (req.sender_id === currentUserId && req.receiver_id === profileUser.id) ||
           (req.sender_id === profileUser.id && req.receiver_id === currentUserId)
  );

  const isAlreadyFriends = friendship?.status === 'accepted';
  const isPendingSent = friendship?.status === 'pending' && friendship.sender_id === currentUserId;
  const isPendingReceived = friendship?.status === 'pending' && friendship.receiver_id === currentUserId;

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      {/* 📸 BANNIÈRE / PHOTO DE COUVERTURE & RETOUR */}
      <div className="relative h-44 bg-gradient-to-r from-orange-600 via-neutral-800 to-cyan-600 rounded-b-3xl overflow-hidden shadow-lg">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-black/60 hover:bg-black text-white rounded-full z-20 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        {profileUser.cover_url && (
          <img src={profileUser.cover_url} alt="Couverture" className="w-full h-full object-cover opacity-80" />
        )}
      </div>

      <div className="px-4 -mt-16 space-y-4 relative z-10">
        {/* INFOS PRINCIPALES DE LA PERSONNE */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="relative -mt-12">
            <img 
              src={profileUser.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150'} 
              alt={profileUser.username} 
              className="w-24 h-24 rounded-full object-cover border-4 border-neutral-900 shadow-2xl bg-neutral-800" 
            />
          </div>

          <div className="space-y-1 w-full">
            <h2 className="text-xl font-black text-white">{profileUser.username}</h2>
            <p className="text-xs text-orange-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5" /> {profileUser.home_club || 'Spot non renseigné'}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2 text-xs text-neutral-300">
              <span>Objectif : <strong className="text-white">{profileUser.goal || 'Muscu & Cardio'}</strong></span>
              <span>•</span>
              <span className="text-cyan-400 font-black">{(profileUser as any).points || 0} pts ⚡</span>
            </div>
          </div>

          {/* BOUTONS D'ACTION (Ajouter en ami / Message) */}
          {!isSelf && (
            <div className="flex gap-2 w-full pt-2">
              {!friendship ? (
                <button 
                  onClick={async () => {
                    if (!currentUserId) return;
                    await supabase.from('friend_requests').insert([{ sender_id: currentUserId, receiver_id: profileUser.id, status: 'pending' }]);
                    onRefreshRequests();
                  }} 
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer"
                >
                  Ajouter en ami 🤝
                </button>
              ) : isAlreadyFriends ? (
                <button 
                  onClick={async () => {
                    await supabase.from('friend_requests').delete().eq('id', friendship.id);
                    onRefreshRequests();
                  }} 
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 font-bold rounded-xl text-xs border border-neutral-700 transition cursor-pointer"
                >
                  Retirer des amis ✓
                </button>
              ) : isPendingSent ? (
                <button disabled className="flex-1 py-2.5 bg-neutral-800 text-neutral-400 font-bold rounded-xl text-xs cursor-not-allowed">
                  Demande envoyée ⏳
                </button>
              ) : isPendingReceived ? (
                <button 
                  onClick={async () => {
                    await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', friendship.id);
                    onRefreshRequests();
                  }} 
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs shadow-lg transition cursor-pointer"
                >
                  Accepter la demande ✅
                </button>
              ) : null}

              <button 
                onClick={() => onOpenChat(profileUser)} 
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs border border-neutral-700 transition cursor-pointer"
              >
                Message 💬
              </button>
            </div>
          )}
        </div>

        {/* 📸 SECTION PHOTOS AVANT / APRÈS (ÉVOLUTIONS) */}
        {userTransformations.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> Transformations Avant / Après ({userTransformations.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {userTransformations.map(trans => (
                <div key={trans.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-1 h-28">
                    {trans.before_url && <img src={trans.before_url} alt="Avant" className="w-full h-full object-cover rounded-lg" />}
                    {trans.after_url && <img src={trans.after_url} alt="Après" className="w-full h-full object-cover rounded-lg" />}
                  </div>
                  <div className="text-[10px] text-neutral-400 flex justify-between font-bold px-1">
                    <span>{trans.weight} kg</span>
                    <span>{trans.date}</span>
                  </div>
                  <p className="text-[11px] text-neutral-200 px-1 truncate">{trans.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📝 FIL DES PUBLICATIONS DE LA PERSONNE */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 ml-1">
            Publications de {profileUser.username} ({userPosts.length})
          </h3>

          {userPosts.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-neutral-500 text-xs">
              Aucune publication pour le moment.
            </div>
          ) : (
            userPosts.map(post => (
              <div key={post.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-bold text-orange-400">{post.session_type}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">{post.caption}</p>
                {post.image_url && (
                  <div className="rounded-2xl overflow-hidden h-48 border border-neutral-800">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

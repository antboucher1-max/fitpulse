import React, { useState } from 'react';
import { Users, UserPlus, Check, Clock, MapPin, Search, ShieldCheck, UserMinus } from 'lucide-react';
import { RealUser, FriendRequest } from '../types';

interface BuddyTabProps {
  currentUserId?: string;
  registeredUsers: RealUser[];
  friendRequests: FriendRequest[];
  onSendFriendRequest: (receiverId: string) => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onRemoveFriend?: (requestId: string) => void;
  onSelectBuddyProfile: (user: RealUser) => void;
}

const getAgeCategory = (birthDateString?: string) => {
  if (!birthDateString) return 'Non renseigné';
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) return 'Moins de 18 ans';
  if (age <= 25) return '18-25 ans';
  if (age <= 35) return '25-35 ans';
  if (age <= 45) return '35-45 ans';
  if (age <= 55) return '45-55 ans';
  return '55 ans et +';
};

export default function BuddyTab({
  currentUserId,
  registeredUsers,
  friendRequests,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRemoveFriend,
  onSelectBuddyProfile
}: BuddyTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'buddies' | 'search'>('buddies');

  const myRequests = friendRequests.filter(
    req => req.sender_id === currentUserId || req.receiver_id === currentUserId
  );

  const acceptedFriendRequests = myRequests.filter(req => req.status === 'accepted');
  const acceptedFriendIds = acceptedFriendRequests.map(req => (req.sender_id === currentUserId ? req.receiver_id : req.sender_id));

  const pendingReceivedRequests = myRequests.filter(
    req => req.receiver_id === currentUserId && req.status === 'pending'
  );

  const myBuddies = registeredUsers.filter(u => acceptedFriendIds.includes(u.id));
  
  const searchResults = registeredUsers.filter(u => {
    if (u.id === currentUserId) return false;
    if (acceptedFriendIds.includes(u.id)) return false;
    return u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (u.home_club && u.home_club.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" /> Espace Buddies
          </h2>
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveSubTab('buddies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'buddies' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              Mes Amis ({myBuddies.length})
            </button>
            <button
              onClick={() => setActiveSubTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === 'search' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              Découvrir
            </button>
          </div>
        </div>

        {activeSubTab === 'search' && (
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Rechercher par pseudo ou club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:border-orange-500"
            />
          </div>
        )}
      </div>

      {pendingReceivedRequests.length > 0 && (
        <div className="bg-neutral-900 border border-orange-500/30 rounded-3xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Demandes d'amis en attente ({pendingReceivedRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingReceivedRequests.map(req => {
              const sender = registeredUsers.find(u => u.id === req.sender_id);
              if (!sender) return null;
              const ageCategory = getAgeCategory(sender.birth_date);

              return (
                <div key={req.id} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectBuddyProfile(sender)}>
                    <img src={sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-800" />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        {sender.username} {sender.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />}
                      </h4>
                      <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" /> {sender.home_club || 'Club partenaire'} • <span className="text-orange-400 font-semibold">{ageCategory}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onAcceptFriendRequest(req.id)}
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Accepter
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {activeSubTab === 'buddies' ? (
          myBuddies.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
              Tu n'as pas encore de buddies dans ta liste. Va dans l'onglet <span className="text-orange-400 font-bold">Découvrir</span> pour ajouter des partenaires ! 🤝
            </div>
          ) : (
            myBuddies.map(buddy => {
              const ageCategory = getAgeCategory(buddy.birth_date);
              const req = acceptedFriendRequests.find(
                r => (r.sender_id === currentUserId && r.receiver_id === buddy.id) ||
                     (r.sender_id === buddy.id && r.receiver_id === currentUserId)
              );

              return (
                <div 
                  key={buddy.id} 
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 rounded-3xl flex items-center justify-between shadow-lg transition"
                >
                  <div className="flex items-center gap-3.5 cursor-pointer flex-1" onClick={() => onSelectBuddyProfile(buddy)}>
                    <img src={buddy.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {buddy.username} {buddy.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500" />}
                      </h3>
                      <p className="text-xs text-orange-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {buddy.home_club || 'Club partenaire'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Tranche d'âge : <span className="text-neutral-200 font-bold">{ageCategory}</span> • Objectif : {buddy.goal || 'Musculation'}
                      </p>
                    </div>
                  </div>

                  {req && onRemoveFriend && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Retirer ${buddy.username} de tes amis ?`)) {
                          onRemoveFriend(req.id);
                        }
                      }}
                      className="p-2.5 bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 text-red-400 rounded-2xl transition"
                      title="Retirer des amis"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )
        ) : (
          searchResults.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
              Aucun athlète trouvé pour cette recherche.
            </div>
          ) : (
            searchResults.map(user => {
              const ageCategory = getAgeCategory(user.birth_date);
              const existingReq = myRequests.find(
                r => (r.sender_id === currentUserId && r.receiver_id === user.id) ||
                     (r.sender_id === user.id && r.receiver_id === currentUserId)
              );

              return (
                <div 
                  key={user.id} 
                  className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3.5 cursor-pointer flex-1" onClick={() => onSelectBuddyProfile(user)}>
                    <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {user.username} {user.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500" />}
                      </h3>
                      <p className="text-xs text-orange-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {user.home_club || 'Club partenaire'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Tranche d'âge : <span className="text-neutral-200 font-bold">{ageCategory}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    {!existingReq ? (
                      <button
                        onClick={() => onSendFriendRequest(user.id)}
                        className="px-3.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                      >
                        <UserPlus className="w-4 h-4" /> Ajouter
                      </button>
                    ) : existingReq.status === 'pending' ? (
                      <span className="text-xs text-neutral-400 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
                        ⏳ En attente
                      </span>
                    ) : (
                      <span className="text-xs text-green-400 bg-green-950/40 px-3 py-2 rounded-xl border border-green-900/50">
                        Amis 🤝
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}

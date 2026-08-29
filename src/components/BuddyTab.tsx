import React from 'react';
import { Users, UserPlus, Check, ShieldCheck, MapPin, Search } from 'lucide-react';
import { RealUser, FriendRequest } from '../types';

interface BuddyTabProps {
  currentUserId?: string;
  registeredUsers: RealUser[];
  friendRequests: FriendRequest[];
  onSendFriendRequest: (receiverId: string) => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onSelectBuddyProfile: (user: RealUser) => void;
}

export default function BuddyTab({
  currentUserId,
  registeredUsers,
  friendRequests,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onSelectBuddyProfile
}: BuddyTabProps) {
  const otherUsers = registeredUsers.filter(u => u.id !== currentUserId && u.id !== 'system-bot');

  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
        <h2 className="text-base font-black tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" /> Trouve tes Buddies
        </h2>
        <p className="text-xs text-neutral-400">Connecte-toi avec d'autres athlètes de ton club ou partage tes séances.</p>

        <div className="space-y-3 pt-2">
          {otherUsers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">Aucun autre athlète inscrit pour le moment.</div>
          ) : (
            otherUsers.map((u) => {
              const existingReq = friendRequests.find(
                req => (req.sender_id === currentUserId && req.receiver_id === u.id) || (req.sender_id === u.id && req.receiver_id === currentUserId)
              );

              return (
                <div key={u.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onSelectBuddyProfile(u)}>
                    <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {u.username} {u.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                      </h3>
                      <p className="text-xs text-orange-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {u.home_club || 'Club principal'}</p>
                    </div>
                  </div>
                  <div>
                    {!existingReq ? (
                      <button onClick={() => onSendFriendRequest(u.id)} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                        <UserPlus className="w-3.5 h-3.5" /> Ajouter
                      </button>
                    ) : existingReq.status === 'accepted' ? (
                      <span className="px-3 py-2 bg-green-950/40 text-green-400 border border-green-500/30 font-bold rounded-xl text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Buddy ✓
                      </span>
                    ) : existingReq.sender_id === currentUserId ? (
                      <span className="px-3 py-2 bg-neutral-900 text-neutral-400 font-bold rounded-xl text-xs">Demande envoyée</span>
                    ) : (
                      <button onClick={() => onAcceptFriendRequest(existingReq.id)} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs">
                        Accepter
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

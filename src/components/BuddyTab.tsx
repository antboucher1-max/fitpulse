import React, { useState } from 'react';
import { Users, UserPlus, Check, ShieldCheck, MapPin, Search, Filter } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('ALL');
  const [selectedExerciseFilter, setSelectedExerciseFilter] = useState<string>('ALL');

  const otherUsers = registeredUsers.filter(u => u.id !== currentUserId && u.id !== 'system-bot');

  const filteredUsers = otherUsers.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.home_club && u.home_club.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = selectedGender === 'ALL' || u.gender === selectedGender;

    let matchesAge = true;
    const age = u.age || 25;
    if (selectedAgeRange === '18-25') matchesAge = age >= 18 && age <= 25;
    else if (selectedAgeRange === '26-35') matchesAge = age >= 26 && age <= 35;
    else if (selectedAgeRange === '36-45') matchesAge = age >= 36 && age <= 45;
    else if (selectedAgeRange === '46+') matchesAge = age >= 46;

    return matchesSearch && matchesGender && matchesAge;
  });

  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" /> Trouver tes Buddies
          </h2>
          <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-2.5 py-1 rounded-xl border border-orange-500/20">
            {filteredUsers.length} athlète{filteredUsers.length > 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs text-neutral-400">Filtre par critères pour trouver ton partenaire d'entraînement idéal.</p>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-orange-500" />
          <input 
            type="text" 
            placeholder="Rechercher par pseudo ou club..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-orange-500" 
          />
        </div>

        {/* Filtres par genre */}
        <div className="flex gap-2">
          <button onClick={() => setSelectedGender('ALL')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${selectedGender === 'ALL' ? 'bg-orange-500 text-white border-orange-400' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}>Tous</button>
          <button onClick={() => setSelectedGender('M')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${selectedGender === 'M' ? 'bg-orange-500 text-white border-orange-400' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}>Hommes 🚹</button>
          <button onClick={() => setSelectedGender('F')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${selectedGender === 'F' ? 'bg-orange-500 text-white border-orange-400' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}>Femmes 🚺</button>
        </div>

        {/* Filtres par tranche d'âge */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'ALL', label: 'Tous âges' },
            { id: '18-25', label: '18-25 ans' },
            { id: '26-35', label: '26-35 ans' },
            { id: '36-45', label: '36-45 ans' },
            { id: '46+', label: '46+ ans' }
          ].map((range) => (
            <button 
              key={range.id} 
              onClick={() => setSelectedAgeRange(range.id)} 
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition border ${selectedAgeRange === range.id ? 'bg-neutral-800 text-orange-400 border-orange-500/40' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Liste des utilisateurs filtrés */}
        <div className="space-y-3 pt-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">Aucun athlète ne correspond à tes filtres.</div>
          ) : (
            filteredUsers.map((u) => {
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
                      <p className="text-xs text-orange-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {u.home_club || 'Club principal'} {u.age ? `• ${u.age} ans` : ''}
                      </p>
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

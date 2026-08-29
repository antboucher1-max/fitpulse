import React, { useState } from 'react';
import { Users, UserPlus, Check, ShieldCheck, MapPin, Search, BellRing, Sparkles, Star, Filter } from 'lucide-react';
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
  
  // États pour le mode Match & Filtres
  const [isMatchMode, setIsMatchMode] = useState(false);
  const [onlyWomen, setOnlyWomen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('ALL');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('ALL');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('ALL');

  const otherUsers = registeredUsers.filter(u => u.id !== currentUserId && u.id !== 'system-bot');

  const filteredUsers = otherUsers.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.home_club && u.home_club.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtre "Entre femmes uniquement"
    const matchesGender = !onlyWomen || u.gender === 'F';

    // Filtre tranche d'âge
    let matchesAge = true;
    const age = u.age || 25;
    if (selectedAgeRange === '18-25') matchesAge = age >= 18 && age <= 25;
    else if (selectedAgeRange === '26-35') matchesAge = age >= 26 && age <= 35;
    else if (selectedAgeRange === '36-45') matchesAge = age >= 36 && age <= 45;
    else if (selectedAgeRange === '46+') matchesAge = age >= 46;

    // Filtre par créneau horaire préféré (si renseigné sur le profil)
    const matchesTime = selectedTimeSlot === 'ALL' || (u.preferred_time && u.preferred_time.includes(selectedTimeSlot));

    // Filtre par type d'entraînement / objectif
    const matchesWorkout = selectedWorkoutType === 'ALL' || (u.goal && u.goal.toLowerCase().includes(selectedWorkoutType.toLowerCase()));

    return matchesSearch && matchesGender && matchesAge && matchesTime && matchesWorkout;
  });

  const pendingRequestsForMe = friendRequests.filter(req => req.receiver_id === currentUserId && req.status === 'pending');

  return (
    <div className="space-y-4">
      {/* Demandes de Buddies reçues */}
      {pendingRequestsForMe.length > 0 && (
        <div className="bg-gradient-to-r from-orange-950/60 to-neutral-900 border border-orange-500/40 rounded-3xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-orange-400">
            <BellRing className="w-5 h-5 animate-bounce" />
            <h3 className="text-xs font-black uppercase tracking-wider">Demandes de Buddies reçues ({pendingRequestsForMe.length})</h3>
          </div>
          <div className="space-y-2">
            {pendingRequestsForMe.map(req => {
              const sender = registeredUsers.find(u => u.id === req.sender_id);
              if (!sender) return null;
              return (
                <div key={req.id} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-800" />
                    <div>
                      <span className="font-bold text-sm text-white block">{sender.username}</span>
                      <span className="text-[10px] text-orange-400">Veut s'entraîner avec toi ! 🏋️‍♂️</span>
                    </div>
                  </div>
                  <button onClick={() => onAcceptFriendRequest(req.id)} className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-md transition">
                    Accepter
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recherche et Bouton Match magique */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" /> Trouver tes Buddies
          </h2>
          
          {/* Bouton Match avec une étoile orange style Gemini */}
          <button 
            onClick={() => setIsMatchMode(!isMatchMode)} 
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition border shadow-lg ${isMatchMode ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/20' : 'bg-neutral-950 text-orange-400 border-orange-500/40 hover:bg-neutral-800'}`}
          >
            <Star className="w-4 h-4 fill-orange-400 text-orange-400 animate-pulse" /> Match {isMatchMode ? 'Actif' : ''}
          </button>
        </div>

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

        {/* Panneau des filtres intelligents "Match" */}
        {isMatchMode && (
          <div className="bg-neutral-950 p-4 rounded-2xl border border-orange-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Critères de Match Avancés
            </div>

            {/* Toggle Entre femmes uniquement */}
            <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <span className="text-xs font-semibold text-neutral-200">🚺 Entre femmes uniquement</span>
              <button 
                onClick={() => setOnlyWomen(!onlyWomen)} 
                className={`relative w-11 h-6 rounded-full transition-colors ${onlyWomen ? 'bg-orange-500' : 'bg-neutral-800'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${onlyWomen ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Tranche d'âge */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Tranche d'âge :</label>
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'Tous' },
                  { id: '18-25', label: '18-25' },
                  { id: '26-35', label: '26-35' },
                  { id: '36-45', label: '36-45' },
                  { id: '46+', label: '46+' }
                ].map((range) => (
                  <button 
                    key={range.id} 
                    onClick={() => setSelectedAgeRange(range.id)} 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition border ${selectedAgeRange === range.id ? 'bg-orange-600 text-white border-orange-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type d'entraînement / Objectif (Cardio/HIIT, Muscu, etc.) */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Type d'entraînement / Objectif :</label>
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'Tous' },
                  { id: 'Cardio', label: '⚡ Cardio / HIIT' },
                  { id: 'Musculation', label: '🏋️‍♂️ Musculation' },
                  { id: 'Prise de masse', label: '💪 Prise de masse' },
                  { id: 'Perte de poids', label: '🔥 Perte de poids' }
                ].map((w) => (
                  <button 
                    key={w.id} 
                    onClick={() => setSelectedWorkoutType(w.id)} 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition border ${selectedWorkoutType === w.id ? 'bg-orange-600 text-white border-orange-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-neutral-400 font-semibold">Résultats ({filteredUsers.length})</span>
        </div>

        {/* Liste des profils correspondants */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">Aucun profil ne correspond à tes critères de match.</div>
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
                        <MapPin className="w-3 h-3" /> {u.home_club || 'Club'} {u.age ? `• ${u.age} ans` : ''} {u.gender ? `• ${u.gender === 'F' ? 'Femme 🚺' : 'Homme 🚹'}` : ''}
                      </p>
                    </div>
                  </div>
                  <div>
                    {!existingReq ? (
                      <button onClick={() => onSendFriendRequest(u.id)} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md">
                        <UserPlus className="w-3.5 h-3.5" /> Ajouter
                      </button>
                    ) : existingReq.status === 'accepted' ? (
                      <span className="px-3 py-2 bg-green-950/40 text-green-400 border border-green-500/30 font-bold rounded-xl text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Buddy ✓
                      </span>
                    ) : existingReq.sender_id === currentUserId ? (
                      <span className="px-3 py-2 bg-neutral-900 text-neutral-400 font-bold rounded-xl text-xs">Demande envoyée</span>
                    ) : (
                      <button onClick={() => onAcceptFriendRequest(existingReq.id)} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-md">
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

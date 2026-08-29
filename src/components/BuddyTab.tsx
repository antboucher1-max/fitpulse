import React, { useState } from 'react';
import { Users, UserPlus, Check, ShieldCheck, MapPin, Search, BellRing, Star, Filter, Clock } from 'lucide-react';
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
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('ALL');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('ALL');
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

    // Filtre tranche horaire
    const matchesTime = selectedTimeSlot === 'ALL' || (u.preferred_time && u.preferred_time.includes(selectedTimeSlot));

    // Filtre type d'entraînement
    const matchesWorkout = selectedWorkoutType === 'ALL' || (u.goal && u.goal.toLowerCase().includes(selectedWorkoutType.toLowerCase()));

    return matchesSearch && matchesGender && matchesAge && matchesTime && matchesWorkout;
  });

  const pendingRequestsForMe = friendRequests.filter(req => req.receiver_id === currentUserId && req.status === 'pending');

  return (
    <div className="space-y-5 pb-8">
      {/* Demandes de Buddies reçues */}
      {pendingRequestsForMe.length > 0 && (
        <div className="bg-gradient-to-r from-orange-950/70 to-neutral-900 border border-orange-500/50 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-orange-400">
            <BellRing className="w-6 h-6 animate-bounce" />
            <h3 className="text-sm font-black uppercase tracking-wider">Demandes reçues ({pendingRequestsForMe.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingRequestsForMe.map(req => {
              const sender = registeredUsers.find(u => u.id === req.sender_id);
              if (!sender) return null;
              return (
                <div key={req.id} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <img src={sender.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                    <div>
                      <span className="font-bold text-base text-white block">{sender.username}</span>
                      <span className="text-xs text-orange-400 font-medium">Veut s'entraîner avec toi ! 🏋️‍♂️</span>
                    </div>
                  </div>
                  <button onClick={() => onAcceptFriendRequest(req.id)} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm shadow-md transition">
                    Accepter
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recherche et Bouton Match magique */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2.5 text-white">
            <Users className="w-6 h-6 text-orange-500" /> Trouver tes Buddies
          </h2>
          
          {/* Bouton Match avec étoile orange */}
          <button 
            onClick={() => setIsMatchMode(!isMatchMode)} 
            className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 transition border shadow-lg ${isMatchMode ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/30' : 'bg-neutral-950 text-orange-400 border-orange-500/40 hover:bg-neutral-800'}`}
          >
            <Star className="w-5 h-5 fill-orange-400 text-orange-400 animate-pulse" /> Match {isMatchMode ? 'Actif' : ''}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-4 w-5 h-5 text-orange-500" />
          <input 
            type="text" 
            placeholder="Rechercher par pseudo ou club..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-orange-500" 
          />
        </div>

        {/* Panneau des filtres intelligents "Match" */}
        {isMatchMode && (
          <div className="bg-neutral-950 p-5 rounded-2xl border border-orange-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-sm font-black text-orange-400 uppercase tracking-wider">
              <Filter className="w-4 h-4" /> Critères de Match Avancés
            </div>

            {/* Toggle Entre femmes uniquement */}
            <div className="flex items-center justify-between bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
              <span className="text-sm font-bold text-neutral-200">🚺 Entre femmes uniquement</span>
              <button 
                onClick={() => setOnlyWomen(!onlyWomen)} 
                className={`relative w-12 h-7 rounded-full transition-colors ${onlyWomen ? 'bg-orange-500' : 'bg-neutral-800'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${onlyWomen ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Tranche d'âge */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Tranche d'âge :</label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'Tous' },
                  { id: '18-25', label: '18-25 ans' },
                  { id: '26-35', label: '26-35 ans' },
                  { id: '36-45', label: '36-45 ans' },
                  { id: '46+', label: '46+ ans' }
                ].map((range) => (
                  <button 
                    key={range.id} 
                    onClick={() => setSelectedAgeRange(range.id)} 
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedAgeRange === range.id ? 'bg-orange-600 text-white border-orange-500' : 'bg-neutral-900 text-neutral-300 border-neutral-800'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tranche horaire (Nouveau) */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> Tranche horaire d'entraînement :
              </label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'Tous horaires' },
                  { id: 'Matin', label: '🌅 Matin (6h-9h)' },
                  { id: 'Midi', label: '☀️ Midi (12h-14h)' },
                  { id: 'Soir', label: '🌆 Soir (17h-20h)' },
                  { id: 'Nocturne', label: '🌙 Nocturne (20h+)' }
                ].map((slot) => (
                  <button 
                    key={slot.id} 
                    onClick={() => setSelectedTimeSlot(slot.id)} 
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedTimeSlot === slot.id ? 'bg-orange-600 text-white border-orange-500' : 'bg-neutral-900 text-neutral-300 border-neutral-800'}`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type d'entraînement / Objectif */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Type d'entraînement :</label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedWorkoutType === w.id ? 'bg-orange-600 text-white border-orange-500' : 'bg-neutral-900 text-neutral-300 border-neutral-800'}`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-neutral-300 font-bold">Athlètes correspondants ({filteredUsers.length})</span>
        </div>

        {/* Liste des profils */}
        <div className="space-y-3.5">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 text-sm">Aucun profil ne correspond à tes critères de match.</div>
          ) : (
            filteredUsers.map((u) => {
              const existingReq = friendRequests.find(
                req => (req.sender_id === currentUserId && req.receiver_id === u.id) || (req.sender_id === u.id && req.receiver_id === currentUserId)
              );

              return (
                <div key={u.id} className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-800 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => onSelectBuddyProfile(u)}>
                    <img src={u.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-neutral-800" />
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                        {u.username} {u.is_verified && <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/20" />}
                      </h3>
                      <p className="text-xs text-orange-400 font-semibold flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {u.home_club || 'Club'} {u.age ? `• ${u.age} ans` : ''} {u.gender ? `• ${u.gender === 'F' ? 'Femme 🚺' : 'Homme 🚹'}` : ''}
                      </p>
                      {u.preferred_time && (
                        <p className="text-[11px] text-neutral-400 mt-0.5">🕒 {u.preferred_time}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {!existingReq ? (
                      <button onClick={() => onSendFriendRequest(u.id)} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md">
                        <UserPlus className="w-4 h-4" /> Ajouter
                      </button>
                    ) : existingReq.status === 'accepted' ? (
                      /* Remplacement de Buddy ✓ par Ami(e) ✓ */
                      <span className="px-4 py-2 bg-neutral-900 text-green-400 border border-green-500/30 font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-inner">
                        <Check className="w-4 h-4" /> Ami(e) ✓
                      </span>
                    ) : existingReq.sender_id === currentUserId ? (
                      <span className="px-3.5 py-2 bg-neutral-900 text-neutral-400 font-bold rounded-xl text-xs">Demande envoyée</span>
                    ) : (
                      <button onClick={() => onAcceptFriendRequest(existingReq.id)} className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-md">
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

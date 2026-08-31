import { useState, useMemo } from 'react';
import { Users, UserPlus, Check, Clock, MapPin, Search, ShieldCheck, UserMinus, Sparkles, Filter, SlidersHorizontal, X, Trophy, Flame, Crown, ChevronRight, Target, Star, BrainCircuit } from 'lucide-react';
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

const GOAL_OPTIONS = ['Musculation', 'Perte de poids', 'CrossFit', 'Powerlifting', 'Yoga/Mobilité'];
const TIME_SLOTS = ['Matin', 'Midi', 'Soir', 'Week-end'];

const calculateAge = (birthDateString?: string): number | null => {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getAgeCategory = (birthDateString?: string) => {
  const age = calculateAge(birthDateString);
  if (age === null) return 'Non renseigné';
  if (age < 18) return 'Moins de 18 ans';
  if (age <= 25) return '18-25 ans';
  if (age <= 35) return '25-35 ans';
  if (age <= 45) return '35-45 ans';
  if (age <= 55) return '45-55 ans';
  return '55 ans et +';
};

const calculateMatchScore = (
  currentUser: RealUser,
  targetUser: RealUser,
  matchCriteria: any
): { score: number; details: string[] } => {
  let score = 0;
  const details: string[] = [];
  let possiblePoints = 0;

  if (matchCriteria.onlyWomen && (!targetUser.gender || targetUser.gender.toLowerCase() !== 'femme')) {
    return { score: -1, details: ['Genre incompatible'] };
  }
  possiblePoints += 20;

  possiblePoints += 40;
  if (currentUser.goal && targetUser.goal && currentUser.goal === targetUser.goal) {
    score += 40;
    details.push(`Même objectif : ${currentUser.goal}`);
  } else if (currentUser.goal && targetUser.goal) {
    score += 10;
  }

  possiblePoints += 30;
  const ageC = calculateAge(currentUser.birth_date);
  const ageT = calculateAge(targetUser.birth_date);

  if (ageC && ageT) {
    const diff = Math.abs(ageC - ageT);
    if (diff <= 5) {
      score += 30;
      details.push('Tranche d\'âge similaire');
    } else if (diff <= 10) {
      score += 15;
    }
  } else {
    score += 15;
  }

  possiblePoints += 30;
  if (matchCriteria.timeSlot && matchCriteria.timeSlot !== 'Tous') {
     if (targetUser.preferred_time === matchCriteria.timeSlot) {
         score += 30;
         details.push(`Dispo ${matchCriteria.timeSlot} commune`);
     }
  } else if (currentUser.preferred_time && targetUser.preferred_time && currentUser.preferred_time === targetUser.preferred_time) {
       score += 30;
       details.push(`Dispo ${currentUser.preferred_time} commune`);
  }

  const finalScore = Math.round((score / possiblePoints) * 100);
  return { score: Math.max(0, finalScore), details };
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
  const [activeSubTab, setActiveSubTab] = useState<'buddies' | 'search'>('search');
  
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [matchCriteria, setMatchCriteria] = useState({
    onlyWomen: false,
    ageRange: 'Tous',
    timeSlot: 'Tous',
    goal: 'Musculation'
  });

  const currentUser = registeredUsers.find(u => u.id === currentUserId);

  const acceptedFriendRequests = useMemo(() => {
    return friendRequests.filter(req => (req.sender_id === currentUserId || req.receiver_id === currentUserId) && req.status === 'accepted');
  }, [friendRequests, currentUserId]);

  const acceptedFriendIds = useMemo(() => {
    return acceptedFriendRequests.map(req => (req.sender_id === currentUserId ? req.receiver_id : req.sender_id));
  }, [acceptedFriendRequests, currentUserId]);

  const myBuddies = registeredUsers.filter(u => acceptedFriendIds.includes(u.id));

  const availableUsers = registeredUsers.filter(u => 
    u.id !== currentUserId && !acceptedFriendIds.includes(u.id)
  );

  const searchAndMatchResults = useMemo(() => {
    if (!currentUser) return [];

    let results = availableUsers.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.home_club && u.home_club.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isMatchActive) {
      return results
        .map(u => ({
          ...u,
          matchData: calculateMatchScore(currentUser, u, matchCriteria)
        }))
        .filter(item => item.matchData.score !== -1)
        .sort((a, b) => b.matchData.score - a.matchData.score);
    }

    return results.map(u => ({ ...u, matchData: null }));
  }, [availableUsers, searchTerm, isMatchActive, matchCriteria, currentUser]);

  const pendingReceivedRequests = friendRequests.filter(
    req => req.receiver_id === currentUserId && req.status === 'pending'
  );

  const MatchConfigModal = () => (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-scaleUp">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> Assistant Matchmaking 🌟
          </h3>
          <button onClick={() => setShowMatchModal(false)} className="p-1 text-neutral-400 hover:text-white rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-neutral-300">Définis tes critères pour trouver les partenaires les plus compatibles avec ta routine.</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-orange-500"/> Objectif principal</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map(goal => (
                <button 
                  key={goal}
                  onClick={() => setMatchCriteria(prev => ({ ...prev, goal }))}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${matchCriteria.goal === goal ? 'bg-orange-600 text-white border-orange-500' : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500'}`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-500"/> Créneau horaire</label>
            <select 
              value={matchCriteria.timeSlot}
              onChange={(e) => setMatchCriteria(prev => ({ ...prev, timeSlot: e.target.value }))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500"
            >
              <option value="Tous">Tous les créneaux</option>
              {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500"/> Tranche d'âge</label>
            <select 
              value={matchCriteria.ageRange}
              onChange={(e) => setMatchCriteria(prev => ({ ...prev, ageRange: e.target.value }))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500"
            >
              <option value="Tous">Peu importe</option>
              <option value="18-25 ans">18-25 ans</option>
              <option value="25-35 ans">25-35 ans</option>
              <option value="35-45 ans">35-45 ans</option>
              <option value="45 ans et +">45 ans et +</option>
            </select>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl flex items-center justify-between border border-neutral-700">
            <div>
              <h4 className="text-sm font-bold text-white">Entre femmes uniquement</h4>
              <p className="text-xs text-neutral-400">Recherche restreinte aux profils féminins.</p>
            </div>
            <button 
              onClick={() => setMatchCriteria(prev => ({ ...prev, onlyWomen: !prev.onlyWomen }))}
              className={`w-12 h-6 rounded-full p-1 transition ${matchCriteria.onlyWomen ? 'bg-orange-600' : 'bg-neutral-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${matchCriteria.onlyWomen ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {isMatchActive && (
             <button 
                onClick={() => {
                    setIsMatchActive(false);
                    setShowMatchModal(false);
                }}
                className="flex-1 px-6 py-4 bg-neutral-800 text-neutral-300 font-extrabold rounded-2xl text-sm transition hover:bg-neutral-700"
             >
                Désactiver
             </button>
          )}
          <button 
            onClick={() => {
              setIsMatchActive(true);
              setShowMatchModal(false);
            }}
            className="flex-1 px-6 py-4 bg-orange-600 text-white font-extrabold rounded-2xl text-sm shadow-xl transition hover:bg-orange-500 active:scale-95"
          >
            {isMatchActive ? 'Mettre à jour le Match' : 'Activer le Match 🌟'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-12">
      {showMatchModal && <MatchConfigModal />}

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
              Découvrir 🎯
            </button>
          </div>
        </div>

        {activeSubTab === 'search' && (
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Rechercher par pseudo ou club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:border-orange-500"
                />
              </div>
              <button 
                onClick={() => setShowMatchModal(true)}
                className={`px-4 py-3 rounded-2xl border flex items-center gap-1.5 text-xs font-bold transition ${isMatchActive ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'}`}
              >
                <Star className={`w-4 h-4 ${isMatchActive ? 'fill-amber-400 text-amber-400' : ''}`} /> Match {isMatchActive && '• Actif'}
              </button>
            </div>
            
            <p className="text-[11px] text-orange-400 font-semibold flex items-center gap-1 px-1">
              <Sparkles className="w-3.5 h-3.5" /> Clique sur l'étoile Match pour configurer tes critères de compatibilité.
            </p>
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

                  {onRemoveFriend && (
                    <button
                      onClick={() => {
                        const r = friendRequests.find(fr => (fr.sender_id === currentUserId && fr.receiver_id === buddy.id) || (fr.sender_id === buddy.id && fr.receiver_id === currentUserId));
                        if (r && window.confirm(`Retirer ${buddy.username} de tes amis ?`)) {
                          onRemoveFriend(r.id);
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
          searchAndMatchResults.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
              Aucun athlète trouvé pour ces critères.
            </div>
          ) : (
            searchAndMatchResults.map(user => {
              const ageCategory = getAgeCategory(user.birth_date);
              const existingReq = friendRequests.find(
                r => (r.sender_id === currentUserId && r.receiver_id === user.id) ||
                     (r.sender_id === user.id && r.receiver_id === currentUserId)
              );

              return (
                <div 
                  key={user.id} 
                  className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-center gap-3.5 cursor-pointer flex-1" onClick={() => onSelectBuddyProfile(user)}>
                    <div className="relative">
                      <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                      {user.matchData && user.matchData.score !== -1 && (
                        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-neutral-950 font-black text-[9px] px-1.5 py-0.5 rounded-full border border-neutral-950 shadow">
                          {user.matchData.score}% 🌟
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {user.username} {user.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500" />}
                      </h3>
                      <p className="text-xs text-orange-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {user.home_club || 'Club partenaire'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                        <span>Tranche d'âge : <strong className="text-neutral-200">{ageCategory}</strong></span>
                        <span>•</span>
                        <span className="text-orange-400 font-medium">🎯 {user.goal || 'Musculation'}</span>
                      </p>
                      {user.matchData && user.matchData.details.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.matchData.details.map((detail, idx) => (
                            <span key={idx} className="text-[9px] bg-neutral-950 text-cyan-400 px-2 py-0.5 rounded-md border border-neutral-800">
                              ✓ {detail}
                            </span>
                          ))}
                        </div>
                      )}
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

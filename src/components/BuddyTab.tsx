import { useState } from 'react';
import { Users, UserPlus, Check, Clock, MapPin, Search, ShieldCheck, UserMinus, Sparkles, Filter, SlidersHorizontal, X, Trophy, Flame, Crown, ChevronRight } from 'lucide-react';
import { RealUser, FriendRequest, Post } from '../types';

interface BuddyTabProps {
  currentUserId?: string;
  registeredUsers: RealUser[];
  friendRequests: FriendRequest[];
  posts?: Post[];
  onSendFriendRequest: (receiverId: string) => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onRemoveFriend?: (requestId: string) => void;
  onSelectBuddyProfile: (user: RealUser) => void;
}

const CLUBS_LIST = [
  'Club Tournai (Bastion)', 
  'Club Tournai (les jeunesses)', 
  'Club Antoing', 
  'Club Péruwelz',
  'Club Leuze', 
  'Club Ath', 
  'Club Mouscron', 
  'Club Ronse', 
  'Club St-Ghislain', 
  'Club Mons', 
  'Club Jurbise'
];

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

const calculateMatchScore = (currentUser: RealUser | undefined, targetUser: RealUser, filters: { onlyWomen: boolean; ageCategory: string; timeSlot: string; club: string }) => {
  if (!currentUser) return 50;

  if (filters.onlyWomen && targetUser.gender && targetUser.gender.toLowerCase() !== 'femme' && targetUser.gender.toLowerCase() !== 'female') {
    return -1;
  }

  let score = 40;

  const targetClub = targetUser.home_club || '';
  if (filters.club && filters.club !== 'Tous') {
    if (targetClub === filters.club) score += 25;
  } else if (currentUser.home_club && targetClub && currentUser.home_club === targetClub) {
    score += 20;
  }

  const targetAgeCat = getAgeCategory(targetUser.birth_date);
  if (filters.ageCategory && filters.ageCategory !== 'Tous') {
    if (targetAgeCat === filters.ageCategory) score += 20;
  } else {
    const currentAgeCat = getAgeCategory(currentUser.birth_date);
    if (currentAgeCat === targetAgeCat) score += 15;
  }

  const targetTime = targetUser.preferred_time || '';
  if (filters.timeSlot && filters.timeSlot !== 'Tous') {
    if (targetTime.toLowerCase().includes(filters.timeSlot.toLowerCase())) score += 15;
  } else if (currentUser.preferred_time && targetTime && currentUser.preferred_time.toLowerCase() === targetTime.toLowerCase()) {
    score += 15;
  }

  return Math.min(score, 99);
};

export default function BuddyTab({
  currentUserId,
  registeredUsers,
  friendRequests,
  posts = [],
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRemoveFriend,
  onSelectBuddyProfile
}: BuddyTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'buddies' | 'search'>('buddies');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedClubDetail, setSelectedClubDetail] = useState<string | null>(null);

  const [filterOnlyWomen, setFilterOnlyWomen] = useState(false);
  const [filterAgeCategory, setFilterAgeCategory] = useState('Tous');
  const [filterTimeSlot, setFilterTimeSlot] = useState('Tous');
  const [filterClub, setFilterClub] = useState('Tous');

  const currentUser = registeredUsers.find(u => u.id === currentUserId);
  const myRequests = friendRequests.filter(
    req => req.sender_id === currentUserId || req.receiver_id === currentUserId
  );

  const acceptedFriendRequests = myRequests.filter(req => req.status === 'accepted');
  const acceptedFriendIds = acceptedFriendRequests.map(req => (req.sender_id === currentUserId ? req.receiver_id : req.sender_id));

  const pendingReceivedRequests = myRequests.filter(
    req => req.receiver_id === currentUserId && req.status === 'pending'
  );

  const myBuddies = registeredUsers.filter(u => acceptedFriendIds.includes(u.id));
  
  const searchResults = registeredUsers
    .filter(u => {
      if (u.id === currentUserId) return false;
      if (acceptedFriendIds.includes(u.id)) return false;
      
      const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (u.home_club && u.home_club.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (u.goal && u.goal.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .map(u => ({
      ...u,
      matchScore: calculateMatchScore(currentUser, u, {
        onlyWomen: filterOnlyWomen,
        ageCategory: filterAgeCategory,
        timeSlot: filterTimeSlot,
        club: filterClub
      })
    }))
    .filter(u => u.matchScore !== -1)
    .sort((a, b) => b.matchScore - a.matchScore);

  const resetFilters = () => {
    setFilterOnlyWomen(false);
    setFilterAgeCategory('Tous');
    setFilterTimeSlot('Tous');
    setFilterClub('Tous');
  };

  const hasActiveFilters = filterOnlyWomen || filterAgeCategory !== 'Tous' || filterTimeSlot !== 'Tous' || filterClub !== 'Tous';

  const currentMonthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const currentMonthNumber = new Date().getMonth();
  const currentYearNumber = new Date().getFullYear();

  const clubStats = CLUBS_LIST.map(clubName => {
    const clubPosts = posts.filter(p => {
      if (p.club_name !== clubName) return false;
      if (!p.created_at) return true;
      const postDate = new Date(p.created_at);
      return postDate.getMonth() === currentMonthNumber && postDate.getFullYear() === currentYearNumber;
    });

    let totalPoints = 0;
    const contributorsMap = new Map<string, { username: string; avatar: string; points: number; sessions: number }>();

    clubPosts.forEach(post => {
      const isLive = post.exercises && post.exercises.length > 0;
      const sessionPoints = isLive ? 15 : 10;
      totalPoints += sessionPoints;

      if (post.user_id) {
        const authorProfile = registeredUsers.find(u => u.id === post.user_id);
        const existing = contributorsMap.get(post.user_id);
        if (existing) {
          existing.points += sessionPoints;
          existing.sessions += 1;
        } else {
          contributorsMap.set(post.user_id, {
            username: post.username || authorProfile?.username || 'Athlète',
            avatar: post.avatar_url || authorProfile?.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
            points: sessionPoints,
            sessions: 1
          });
        }
      }
    });

    const topContributors = Array.from(contributorsMap.values()).sort((a, b) => b.points - a.points);

    return {
      name: clubName,
      points: totalPoints,
      sessionsCount: clubPosts.length,
      topContributors
    };
  });

  clubStats.sort((a, b) => b.points - a.points);
  const leadingClub = clubStats[0];

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/40 border border-neutral-800 rounded-3xl p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-orange-500" /> Ligue des Clubs 🏆
            </h3>
            <p className="text-[10px] text-orange-400 font-semibold capitalize mt-0.5">
              Saison : {capitalizedMonth}
            </p>
          </div>
          <span className="text-[10px] text-amber-400 font-black bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
            <Crown className="w-3 h-3" /> Roi : {leadingClub?.name.replace('Club ', '')}
          </span>
        </div>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {clubStats.map((club, index) => {
            let rankBadge = 'bg-neutral-950 text-neutral-400 border border-neutral-800';
            if (index === 0) rankBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black';
            if (index === 1) rankBadge = 'bg-neutral-300/20 text-neutral-200 border border-neutral-300/40 font-bold';
            if (index === 2) rankBadge = 'bg-amber-700/20 text-amber-600 border border-amber-700/40 font-bold';

            const isLeader = index === 0;

            return (
              <div 
                key={club.name} 
                onClick={() => setSelectedClubDetail(club.name)}
                className={`px-3 py-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition transform hover:scale-[1.01] ${isLeader ? 'bg-neutral-900 border-amber-500/50 shadow-md' : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700'}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${rankBadge}`}>
                    {index === 0 ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : index + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500" /> {club.name}
                    </span>
                    <span className="text-[9px] text-neutral-400 block">
                      {club.sessionsCount} séance{club.sessionsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl">
                    {club.points} pts
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedClubDetail && (() => {
        const clubData = clubStats.find(c => c.name === selectedClubDetail);
        if (!clubData) return null;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-scaleUp">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <button 
                onClick={() => setSelectedClubDetail(null)} 
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 font-black">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{clubData.name}</h3>
                  <p className="text-xs text-orange-400 font-semibold">
                    Total : {clubData.points} points ({clubData.sessionsCount} séances)
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" /> Top Contributeurs du mois :
                </h4>

                {clubData.topContributors.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs bg-neutral-950 rounded-2xl border border-neutral-800">
                    Aucun athlète n'a encore enregistré de points pour ce club ce mois-ci. Sois le premier ! 🚀
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {clubData.topContributors.map((contrib, i) => (
                      <div key={i} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={contrib.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                          <div>
                            <span className="text-xs font-bold text-white block">{contrib.username}</span>
                            <span className="text-[10px] text-neutral-400">{contrib.sessions} séance{contrib.sessions > 1 ? 's' : ''} validée{contrib.sessions > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl">
                          +{contrib.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedClubDetail(null)}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-xs transition shadow-lg mt-2"
              >
                Fermer
              </button>
            </div>
          </div>
        );
      })()}

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
          <div className="space-y-3">
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
                onClick={() => setShowFiltersModal(true)}
                className={`px-4 py-3 rounded-2xl border flex items-center gap-1.5 text-xs font-bold transition ${hasActiveFilters ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'}`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filtres {hasActiveFilters && '• Actifs'}
              </button>
            </div>

            {/* Sélecteur direct de tranche d'âge */}
            <div>
              <select 
                value={filterAgeCategory} 
                onChange={(e) => setFilterAgeCategory(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Tous">Filtrer par tranche d'âge (Tous)</option>
                <option value="18-25 ans">18-25 ans</option>
                <option value="25-35 ans">25-35 ans</option>
                <option value="35-45 ans">35-45 ans</option>
                <option value="45-55 ans">45-55 ans</option>
                <option value="55 ans et +">55 ans et +</option>
              </select>
            </div>
            
            <p className="text-[11px] text-orange-400 font-semibold flex items-center gap-1 px-1">
              <Sparkles className="w-3.5 h-3.5" /> Système de match intelligent activé selon vos critères.
            </p>
          </div>
        )}
      </div>

      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-500" /> Critères de Match & Filtres
              </h3>
              <button onClick={() => setShowFiltersModal(false)} className="p-1.5 text-neutral-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Entre femmes uniquement</h4>
                  <p className="text-[10px] text-neutral-400">Restreindre la recherche aux profils féminins</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={filterOnlyWomen} 
                  onChange={(e) => setFilterOnlyWomen(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 cursor-pointer rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Tranche d'âge :</label>
                <select 
                  value={filterAgeCategory} 
                  onChange={(e) => setFilterAgeCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="Tous">Tous les âges</option>
                  <option value="18-25 ans">18-25 ans</option>
                  <option value="25-35 ans">25-35 ans</option>
                  <option value="35-45 ans">35-45 ans</option>
                  <option value="45-55 ans">45-55 ans</option>
                  <option value="55 ans et +">55 ans et +</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Disponibilité / Horaire :</label>
                <select 
                  value={filterTimeSlot} 
                  onChange={(e) => setFilterTimeSlot(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="Tous">Tous les horaires</option>
                  <option value="Matin">Matin</option>
                  <option value="Midi">Midi</option>
                  <option value="Soir">Soir</option>
                  <option value="Week-end">Week-end</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Club partenaire :</label>
                <select 
                  value={filterClub} 
                  onChange={(e) => setFilterClub(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="Tous">Tous les clubs</option>
                  <option value="Club Tournai (Bastion)">Club Tournai (Bastion)</option>
                  <option value="Club Tournai (les jeunesses)">Club Tournai (les jeunesses)</option>
                  <option value="Club Antoing">Club Antoing</option>
                  <option value="Club Péruwelz">Club Péruwelz</option>
                  <option value="Club Leuze">Club Leuze</option>
                  <option value="Club Ath">Club Ath</option>
                  <option value="Club Mouscron">Club Mouscron</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={resetFilters} 
                className="flex-1 py-3 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition"
              >
                Réinitialiser
              </button>
              <button 
                onClick={() => setShowFiltersModal(false)} 
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
              >
                Appliquer les filtres 🎯
              </button>
            </div>
          </div>
        </div>
      )}

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
              Aucun athlète trouvé pour ces critères de match.
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
                  className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-center gap-3.5 cursor-pointer flex-1" onClick={() => onSelectBuddyProfile(user)}>
                    <div className="relative">
                      <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-800" />
                      <span className="absolute -bottom-1 -right-1 bg-orange-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full border border-neutral-950">
                        {user.matchScore}%
                      </span>
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

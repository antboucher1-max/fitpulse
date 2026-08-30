import React, { useState } from 'react';
import { Users, UserPlus, Check, Clock, MapPin, Search, ShieldCheck, UserMinus, Sparkles, Filter, SlidersHorizontal, X, Trophy, Flame } from 'lucide-react';
import { RealUser, FriendRequest, Post } from '../types';

interface BuddyTabProps {
  currentUserId?: string;
  registeredUsers: RealUser[];
  friendRequests: FriendRequest[];
  posts?: Post[]; // Ajouté pour alimenter le classement des clubs
  onSendFriendRequest: (receiverId: string) => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onRemoveFriend?: (requestId: string) => void;
  onSelectBuddyProfile: (user: RealUser) => void;
}

const CLUBS_FOR_LEADERBOARD = [
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

  // Calcul du Classement des Clubs basé sur les publications
  const clubStats = CLUBS_FOR_LEADERBOARD.map(clubName => {
    const count = posts.filter(p => p.club_name === clubName).length;
    return { name: clubName, count };
  });
  clubStats.sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-4 pb-12">
      {/* CLASSEMENT DES CLUBS INTÉGRÉ EN HAUT */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-orange-500" /> Classement des Clubs 🏆
          </h3>
          <span className="text-[10px] text-orange-400 font-semibold bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
            Activité
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {clubStats.map((club, index) => {
            let rankBadge = 'bg-neutral-950 text-neutral-400 border border-neutral-800';
            if (index === 0) rankBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black';
            if (index === 1) rankBadge = 'bg-neutral-300/20 text-neutral-200 border border-neutral-300/30 font-bold';
            if (index === 2) rankBadge = 'bg-amber-700/20 text-amber-600 border border-amber-700/30 font-bold';

            return (
              <div 
                key={club.name} 
                className="bg-neutral-950 px-3 py-2 rounded-2xl border border-neutral-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${rankBadge}`}>
                    {index + 1}
                  </div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-500" /> {club.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-black text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-xl">
                  <Flame className="w-3 h-3 fill-orange-500" /> {club.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                  onChange={(e) => setSearchTerm(e.

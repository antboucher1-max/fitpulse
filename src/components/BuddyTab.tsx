import { useState, useMemo } from 'react';
import { Users, UserPlus, Check, Clock, MapPin, Search, ShieldCheck, UserMinus, Sparkles, Filter, SlidersHorizontal, X, Trophy, Flame, Crown, ChevronRight, Target, Star, BrainCircuit } from 'lucide-react';
import { RealUser, FriendRequest } from '../types';

// Types étendus pour inclure les données nécessaires au calcul de match
interface BuddyTabProps {
  currentUserId?: string;
  registeredUsers: RealUser[];
  friendRequests: FriendRequest[];
  onSendFriendRequest: (receiverId: string) => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onRemoveFriend?: (requestId: string) => void;
  onSelectBuddyProfile: (user: RealUser) => void;
}

// Données fictives pour les objectifs si non présents dans RealUser
// Dans une vraie app, ces données viennent de votre DB
const GOAL_OPTIONS = ['Musculation', 'Perte de poids', 'CrossFit', 'Powerlifting', 'Yoga/Mobilité'];
const TIME_SLOTS = ['Matin', 'Midi', 'Soir', 'Week-end'];

// --- Fonction utilitaire de calcul d'âge ---
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

// --- Fonction utilitaire de calcul du score de compatibilité (Le cœur du système) ---
const calculateMatchScore = (
  currentUser: RealUser,
  targetUser: RealUser,
  matchCriteria: any // Les critères sélectionnés via l'étoile
): { score: number; details: string[] } => {
  let score = 0;
  const details: string[] = [];
  let possiblePoints = 0;

  // 1. Filtre Strict : Genre (Exclusion)
  if (matchCriteria.onlyWomen && (!targetUser.gender || targetUser.gender.toLowerCase() !== 'femme')) {
    return { score: -1, details: ['Genre incompatible'] }; // Score négatif = exclu de la liste
  }
  possiblePoints += 20; // Points potentiels pour les autres critères

  // 2. Objectif (Pondération forte : 40% du score)
  possiblePoints += 40;
  if (currentUser.goal && targetUser.goal && currentUser.goal === targetUser.goal) {
    score += 40;
    details.push(`Même objectif : ${currentUser.goal}`);
  } else if (currentUser.goal && targetUser.goal) {
    // Compatibilité partielle si objectifs différents mais complémentaires (ex: Force et Cardio)
    // Pour simplifier ici, on met juste 10 points pour l'effort
    score += 10;
  }

  // 3. Tranche d'âge (Pondération moyenne : 30% du score)
  possiblePoints += 30;
  const ageC = calculateAge(currentUser.birth_date);
  const ageT = calculateAge(targetUser.birth_date);

  if (ageC && ageT) {
    const diff = Math.abs(ageC - ageT);
    if (diff <= 5) {
      score += 30; // Tranche d'âge très proche (+/- 5 ans)
      details.push('Tranche d\'âge similaire');
    } else if (diff <= 10) {
      score += 15; // Assez proche (+/- 10 ans)
    }
  } else {
      score += 15; // Par défaut si âge non dispo, on ne pénalise pas totalement
  }

  // 4. Créneau Horaire (Pondération moyenne : 30% du score)
  possiblePoints += 30;
  // On suppose ici que preferred_time est une string simple. Adaptez si c'est un tableau.
  if (matchCriteria.timeSlot && matchCriteria.timeSlot !== 'Tous') {
     if (targetUser.preferred_time === matchCriteria.timeSlot) {
         score += 30;
         details.push(`Dispo ${matchCriteria.timeSlot} commune`);
     }
  } else if (currentUser.preferred_time && targetUser.preferred_time && currentUser.preferred_time === targetUser.preferred_time) {
       score += 30; // Si pas de filtre actif, on match sur la préférence de base
       details.push(`Dispo ${currentUser.preferred_time} commune`);
  }

  // Calcul final sur 100
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
  
  // États pour le modal de Match
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isMatchActive, setIsMatchActive] = useState(false); // Active le mode "Recherche Intelligente"
  const [matchCriteria, setMatchCriteria] = useState({
    onlyWomen: false,
    ageRange: 'Tous', // ex: "25-30 ans"
    timeSlot: 'Tous',
    goal: 'Musculation' // Critère par défaut
  });

  const currentUser = registeredUsers.find(u => u.id === currentUserId);

  // --- Logique de filtrage et de calcul ---
  
  // 1. Récupérer les IDs des amis acceptés
  const acceptedFriendIds = useMemo(() => {
    return friendRequests
      .filter(req => (req.sender_id === currentUserId || req.receiver_id === currentUserId) && req.status === 'accepted')
      .map(req => (req.sender_id === currentUserId ? req.receiver_id : req.sender_id));
  }, [friendRequests, currentUserId]);

  // 2. Utilisateurs dans l'onglet "Mes Amis"
  const myBuddies = registeredUsers.filter(u => acceptedFriendIds.includes(u.id));

  // 3. Utilisateurs dans l'onglet "Découvrir" (exclus les amis et soi-même)
  const availableUsers = registeredUsers.filter(u => 
    u.id !== currentUserId && !acceptedFriendIds.includes(u.id)
  );

  // 4. Pipeline de Recherche et Match
  const searchAndMatchResults = useMemo(() => {
    if (!currentUser) return [];

    // Appliquer d'abord la recherche textuelle
    let results = availableUsers.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.home_club && u.home_club.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Si le mode Match (étoile) est activé, on calcule les scores et trie
    if (isMatchActive) {
      return results
        .map(u => ({
          ...u,
          matchData: calculateMatchScore(currentUser, u, matchCriteria)
        }))
        // Exclure ceux qui ne correspondent pas au filtre strict (genre)
        .filter(item => item.matchData.score !== -1)
        // Trier par score décroissant
        .sort((a, b) => b.matchData.score - a.matchData.score);
    }

    // Sinon, retourner les résultats de recherche simples (sans score affiché)
    return results.map(u => ({ ...u, matchData: null }));

  }, [availableUsers, searchTerm, isMatchActive, matchCriteria, currentUser]);

  const pendingReceivedRequests = friendRequests.filter(
    req => req.receiver_id === currentUserId && req.status === 'pending'
  );

  // --- Composant Modal des Critères de Match ---
  const MatchConfigModal = () => (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-scaleUp">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> Assistant Matchmaking
          </h3>
          <button onClick={() => setShowMatchModal(false)} className="p-1 text-neutral-400 hover:text-white rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-neutral-300">Définis tes critères pour trouver les partenaires les plus compatibles avec ta routine.</p>

        <div className="space-y-5">
          {/* Objectif */}
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

          {/* Créneau Horaire */}
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

          {/* Tranche d'âge */}
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

          {/* Genre Strict */}
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
                    resetFilters(); // Optionnel: réinitialiser les critères si on désactive
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
            {isMatchActive ? 'Mettre à jour le Match' : 'Activer le Match'}
          </button>
        </div>
      </div>
    </div>
  );

  const resetFilters = () => {
     setMatchCriteria({
        onlyWomen: false,
        ageRange: 'Tous',
        timeSlot: 'Tous',
        goal: 'Musculation'
     });
  }

  // --- Rendu des cartes utilisateur (Amis ou Recherche) ---
  const UserCard = ({ user, type }: { user: any, type: 'buddy' | 'search' }) => {
    const age = calculateAge(user.birth_date);
    const existingReq = friendRequests.find(
      r => (r.sender_id === currentUserId && r.receiver_id === user.id) ||
           (r.sender_id === user.id && r.receiver_id === currentUserId)
    );

    return (
      <div key={user.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => onSelectBuddyProfile(user)}>
          <div className="relative">
            <img src={user.avatar_url} alt={user.username} className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-700" />
            {type === 'search' && user.matchData && user.matchData.score !== -1 && (
              <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-neutral-950 font-black text-[10px] ${
                user.matchData.score >= 80 ? 'bg-green-500 text-white' :
                user.matchData.score >= 60 ? 'bg-

import React from 'react';
import { Trophy, Flame, MapPin } from 'lucide-react';
import { Post } from '../types';

interface ClubLeaderboardProps {
  posts: Post[];
}

const CLUBS_FOR_LEADERBOARD = [
  'Club Tournai (Bastion)', 
  'Club Tournai (les jeunesses)',import React, { useState } from 'react';
import { Trophy, Flame, MapPin, Zap, Crown, ChevronRight, User, X, Sparkles } from 'lucide-react';
import { Post, RealUser } from '../types';

interface ClubLeaderboardProps {
  posts: Post[];
  registeredUsers: RealUser[];
  calculateStreak: (userId: string) => number;
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

export default function ClubLeaderboard({ posts, registeredUsers, calculateStreak }: ClubLeaderboardProps) {
  const [selectedClubDetail, setSelectedClubDetail] = useState<string | null>(null);

  // Mois en cours (ex: "Août 2026")
  const currentMonthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  // Calcul des points par club pour le mois en cours
  const currentMonthNumber = new Date().getMonth();
  const currentYearNumber = new Date().getFullYear();

  const clubStats = CLUBS_LIST.map(clubName => {
    // Filtrer les posts du club pour le mois en cours
    const clubPosts = posts.filter(p => {
      if (p.club_name !== clubName) return false;
      if (!p.created_at) return true; // Si pas de date, on prend par défaut
      const postDate = new Date(p.created_at);
      return postDate.getMonth() === currentMonthNumber && postDate.getFullYear() === currentYearNumber;
    });

    // Calcul des points pondérés
    let totalPoints = 0;
    const contributorsMap = new Map<string, { username: string; avatar: string; points: number; sessions: number }>();

    clubPosts.forEach(post => {
      // 15 pts pour un live tracker ou une séance détaillée, 10 pts pour un post classique
      const isLive = post.exercises && post.exercises.length > 0;
      const sessionPoints = isLive ? 15 : 10;
      totalPoints += sessionPoints;

      // Suivi des contributeurs du club
      if (post.user_id) {
        const userStreak = calculateStreak(post.user_id);
        const streakBonus = userStreak * 2; // Bonus de 2 pts par jour de streak
        const userTotalSessionPts = sessionPoints + streakBonus;

        const existing = contributorsMap.get(post.user_id);
        if (existing) {
          existing.points += userTotalSessionPts;
          existing.sessions += 1;
        } else {
          const authorProfile = registeredUsers.find(u => u.id === post.user_id);
          contributorsMap.set(post.user_id, {
            username: post.username || authorProfile?.username || 'Athlète',
            avatar: post.avatar_url || authorProfile?.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
            points: userTotalSessionPts,
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

  // Trier du plus de points au moins de points
  clubStats.sort((a, b) => b.points - a.points);
  const leadingClub = clubStats[0];

  return (
    <div className="space-y-4">
      {/* En-tête Classement style Ligue */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/40 border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" /> Ligue des Clubs 🏆
            </h3>
            <p className="text-[11px] text-orange-400 font-semibold capitalize mt-0.5">
              Saison : {capitalizedMonth}
            </p>
          </div>
          <span className="text-[10px] text-amber-400 font-black bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 shadow-sm">
            <Crown className="w-3.5 h-3.5" /> Roi : {leadingClub?.name.replace('Club ', '')}
          </span>
        </div>

        <p className="text-xs text-neutral-300">
          Gagne des points pour ton club : <strong className="text-white">10 pts</strong> par publication, <strong className="text-white">15 pts</strong> par séance Live, et des bonus de régularité (Streak) ! 🔥
        </p>

        {/* Liste du classement */}
        <div className="space-y-2.5 pt-1">
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
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition transform hover:scale-[1.01] ${isLeader ? 'bg-neutral-900 border-amber-500/50 shadow-lg shadow-amber-500/5' : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${rankBadge}`}>
                    {index === 0 ? <Crown className="w-4 h-4 text-amber-400" /> : index + 1}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" /> {club.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      {club.sessionsCount} entraînement{club.sessionsCount > 1 ? 's' : ''} ce mois-ci
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-orange-400 block">
                      {club.points} pts
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALE DE DÉTAIL D'UN CLUB (Top Athlètes) */}
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
    </div>
  );
}
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

export default function ClubLeaderboard({ posts }: ClubLeaderboardProps) {
  // Calculer le nombre de séances par club en se basant sur les posts publiés
  const clubStats = CLUBS_FOR_LEADERBOARD.map(clubName => {
    const count = posts.filter(p => p.club_name === clubName).length;
    return { name: clubName, count };
  });

  // Trier du plus actif au moins actif
  clubStats.sort((a, b) => b.count - a.count);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-500" /> Classement des Clubs 🏆
        </h3>
        <span className="text-xs text-orange-400 font-semibold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
          Activité du mois
        </span>
      </div>

      <p className="text-xs text-neutral-400">
        Quel club s'entraîne le plus ? Partage tes séances pour faire grimper ton club sur le podium ! 💪
      </p>

      <div className="space-y-2.5 pt-1">
        {clubStats.map((club, index) => {
          let rankBadge = 'bg-neutral-950 text-neutral-400 border border-neutral-800';
          if (index === 0) rankBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black';
          if (index === 1) rankBadge = 'bg-neutral-300/20 text-neutral-200 border border-neutral-300/30 font-bold';
          if (index === 2) rankBadge = 'bg-amber-700/20 text-amber-600 border border-amber-700/30 font-bold';

          return (
            <div 
              key={club.name} 
              className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800/80 flex items-center justify-between transition hover:border-neutral-700"
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${rankBadge}`}>
                  {index + 1}
                </div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> {club.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl">
                <Flame className="w-3.5 h-3.5 fill-orange-500" /> {club.count} séances
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

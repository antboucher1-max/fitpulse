import React from 'react';
import { Trophy, Flame, MapPin } from 'lucide-react';
import { Post } from '../types';

interface ClubLeaderboardProps {
  posts: Post[];
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

import { useState } from 'react';
import { Trophy, MapPin, Flame } from 'lucide-react';
import { RealUser } from '../types';

interface LeaderboardTabProps {
  registeredUsers: RealUser[];
}

export default function LeaderboardTab({ registeredUsers }: LeaderboardTabProps) {
  const [leaderboardView, setLeaderboardView] = useState<'clubs' | 'athletes'>('clubs');

  // Calcul dynamique des points des clubs en additionnant les points réels de leurs membres
  const clubsScoreMap: Record<string, number> = {};
  registeredUsers.forEach(u => {
    const club = u.home_club || 'Club Tournai (Bastion)';
    const userPoints = (u as any).points || 0;
    clubsScoreMap[club] = (clubsScoreMap[club] || 0) + userPoints;
  });

  const sortedClubs = Object.entries(clubsScoreMap).sort((a, b) => b[1] - a[1]);
  
  // Tri des athlètes du plus grand nombre de points au plus faible
  const sortedAthletes = [...registeredUsers].sort((a, b) => ((b as any).points || 0) - ((a as any).points || 0));

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Header de la Ligue */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 shadow-xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 mx-auto">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-black text-white">La Ligue des Salles</h2>
          <p className="text-xs text-neutral-400">Classement officiel inter-clubs & individuel en direct</p>
        </div>

        {/* Boutons de bascule */}
        <div className="flex gap-2 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 mt-2">
          <button 
            onClick={() => setLeaderboardView('clubs')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${leaderboardView === 'clubs' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
          >
            🏛️ Classement des Clubs
          </button>
          <button 
            onClick={() => setLeaderboardView('athletes')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${leaderboardView === 'athletes' ? 'bg-orange-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
          >
            ⚡ Top Athlètes
          </button>
        </div>
      </div>

      {/* Contenu CLUBS */}
      {leaderboardView === 'clubs' && (
        <div className="space-y-2.5">
          {sortedClubs.map(([clubName, score], index) => (
            <div key={clubName} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : index === 1 ? 'bg-neutral-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-xs text-white">{clubName}</h4>
                  <p className="text-[10px] text-neutral-400">Compétition inter-salles</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-orange-400">{score} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenu ATHLÈTES */}
      {leaderboardView === 'athletes' && (
        <div className="space-y-2.5">
          {sortedAthletes.map((athlete, index) => (
            <div key={athlete.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : index === 1 ? 'bg-neutral-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                  {index + 1}
                </span>
                <img src={athlete.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-orange-500/40" />
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                    {athlete.username} 
                    <span className="text-[10px] bg-neutral-800 text-orange-400 px-2 py-0.5 rounded-lg font-semibold">{athlete.age ? `${athlete.age} ans` : 'Athlète'}</span>
                  </h4>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-orange-500" /> {athlete.home_club || 'Club partenaire'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-orange-400">{(athlete as any).points || 0} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Trophy } from 'lucide-react';
import { MILESTONE_BADGES } from '../types/badges';

interface BadgesSectionProps {
  userPosts: any[];
  userProfile: any;
}

export default function BadgesSection({ userPosts, userProfile }: BadgesSectionProps) {
  const userSpecificPosts = userPosts.filter(p => p.user_id === userProfile?.id);
  const unlockedCount = MILESTONE_BADGES.filter(badge => badge.checkCondition(userSpecificPosts, userProfile)).length;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-500" /> Trophées & Jalons
        </h3>
        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
          {unlockedCount} / {MILESTONE_BADGES.length} débloqués
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {MILESTONE_BADGES.map((badge) => {
          const isUnlocked = badge.checkCondition(userSpecificPosts, userProfile);

          return (
            <div 
              key={badge.id} 
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition ${
                isUnlocked 
                  ? 'bg-neutral-950 border-orange-500/40 shadow-lg shadow-orange-500/5' 
                  : 'bg-neutral-950/40 border-neutral-800/60 opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <h4 className="font-bold text-xs text-white truncate w-full">{badge.title}</h4>
              <p className="text-[10px] text-neutral-400 leading-tight line-clamp-2">{badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

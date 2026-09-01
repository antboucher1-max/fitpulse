export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'running' | 'muscu' | 'crossfit' | 'global';
  checkCondition: (userPosts: any[], userProfile: any) => boolean;
}

export const MILESTONE_BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'Premier Pas 🚀',
    description: 'Enregistrer sa toute première séance sur FitPulse.',
    icon: '🎯',
    category: 'global',
    checkCondition: (posts) => posts.length >= 1
  },
  {
    id: 'iron_addict',
    title: 'Iron Addict 💪',
    description: 'Valider 10 séances de musculation.',
    icon: '🏋️‍♂️',
    category: 'muscu',
    checkCondition: (posts) => posts.filter(p => p.session_type?.includes('Musculation') || p.session_type?.includes('Pectoraux') || p.session_type?.includes('Dos') || p.session_type?.includes('Jambes')).length >= 10
  },
  {
    id: 'box_warrior',
    title: 'Box Warrior ⚡',
    description: 'Enregistrer 5 scores BoxWars / WOD.',
    icon: '🔥',
    category: 'crossfit',
    checkCondition: (posts) => posts.filter(p => p.session_type?.includes('BoxWars')).length >= 5
  },
  {
    id: 'road_runner',
    title: 'Routard 🏃‍♂️',
    description: 'Publier 5 séances de course à pied.',
    icon: '👟',
    category: 'running',
    checkCondition: (posts) => posts.filter(p => p.session_type?.includes('Running')).length >= 5
  },
  {
    id: 'league_fighter',
    title: 'Légende de la Ligue 🏆',
    description: 'Atteindre les 100 points au classement général.',
    icon: '👑',
    category: 'global',
    checkCondition: (_, profile) => (profile?.points || 0) >= 100
  }
];

export interface SpotSegment {
  id: string;
  name: string;
  distanceKm: number;
  clubSpot: string; // Ex: 'Tournai (Quais de l’Escaut & Parc)'
  currentKing: {
    username: string;
    timeSeconds: number;
    avatarUrl: string;
    date: string;
  };
}

export const LOCAL_SPOT_SEGMENTS: SpotSegment[] = [
  {
    id: 'seg_1',
    name: '⚡ Le Sprint des Quais de l’Escaut',
    distanceKm: 1.2,
    clubSpot: 'Tournai (Quais de l’Escaut & Parc)',
    currentKing: {
      username: 'Antoine',
      timeSeconds: 254, // 4:14
      avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
      date: '2026-06-02'
    }
  },
  {
    id: 'seg_2',
    name: '🔥 La Boucle Technique du Parc',
    distanceKm: 2.5,
    clubSpot: 'Tournai (Quais de l’Escaut & Parc)',
    currentKing: {
      username: 'Marc_CrossFit',
      timeSeconds: 580, // 9:40
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      date: '2026-06-04'
    }
  }
];

export function checkSegmentAttempt(segmentId: string, userTimeSeconds: number, username: string, avatarUrl: string) {
  const segment = LOCAL_SPOT_SEGMENTS.find(s => s.id === segmentId);
  if (!segment) return { isNewRecord: false, segment: null };

  if (userTimeSeconds < segment.currentKing.timeSeconds) {
    // Nouveau record ! L'athlète prend la couronne
    segment.currentKing = {
      username,
      timeSeconds: userTimeSeconds,
      avatarUrl,
      date: new Date().toISOString().split('T')[0]
    };
    return { isNewRecord: true, segment, diffSeconds: segment.currentKing.timeSeconds - userTimeSeconds };
  }

  return { isNewRecord: false, segment };
}

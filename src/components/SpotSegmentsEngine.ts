export interface SegmentAttempt {
  id: string;
  segmentName: string;
  distanceKm: number;
  clubSpot: string;
  athleteId: string;
  athleteUsername: string;
  athleteAvatar: string;
  timeSeconds: number;
  date: string;
}

// Stockage local / mémoire pour les segments créés par la communauté
export let COMMUNITY_SEGMENTS: Array<{
  id: string;
  name: string;
  distanceKm: number;
  clubSpot: string;
  king: {
    userId: string;
    username: string;
    timeSeconds: number;
    avatarUrl: string;
    date: string;
  };
}> = [
  {
    id: 'seg_default_1',
    name: '⚡ Boucle Express Locale',
    distanceKm: 2.0,
    clubSpot: 'Global / Tous les spots',
    king: {
      userId: 'bot_1',
      username: 'Pionnier',
      timeSeconds: 480, // 8:00
      avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
      date: '2026-06-01'
    }
  }
];

export function registerNewSegmentAttempt(
  segmentId: string, 
  userTimeSeconds: number, 
  userId: string, 
  username: string, 
  avatarUrl: string
) {
  const segment = COMMUNITY_SEGMENTS.find(s => s.id === segmentId);
  if (!segment) return { isNewRecord: false, segment: null };

  if (userTimeSeconds < segment.king.timeSeconds) {
    segment.king = {
      userId,
      username,
      timeSeconds: userTimeSeconds,
      avatarUrl,
      date: new Date().toISOString().split('T')[0]
    };
    return { isNewRecord: true, segment };
  }

  return { isNewRecord: false, segment };
}

export function createNewCustomSegment(
  name: string, 
  distanceKm: number, 
  clubSpot: string, 
  userId: string, 
  username: string, 
  avatarUrl: string, 
  timeSeconds: number
) {
  const newSegment = {
    id: 'seg_' + Date.now(),
    name,
    distanceKm,
    clubSpot,
    king: {
      userId,
      username,
      timeSeconds,
      avatarUrl,
      date: new Date().toISOString().split('T')[0]
    }
  };
  COMMUNITY_SEGMENTS.unshift(newSegment);
  return newSegment;
}

export interface ClubLocation {
  name: string;
  address?: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  distance?: number | null;
}

export interface ExerciseGuide {
  id: string;
  name: string;
  category: 'Pectoraux' | 'Dos' | 'Jambes' | 'Épaules' | 'Bras' | 'Core';
  equipment: string;
  targetMuscles: string;
  settings: string;
  execution: string;
  tips: string;
  commonMistakes?: string[]; // erreurs fréquentes à éviter ("à ne pas faire")
  image_url: string;
  detailedDescription: string;
}

export interface PersonalRecord { exercise: string; weight: number; reps: number; date: string; }
export interface WeeklyPlan { day: string; focus: string; exercisesText: string; }
export interface TransformationPhoto { id: string; user_id?: string; before_url: string; after_url: string; date: string; weight: number; note: string; is_private?: boolean; }
export interface ExerciseEntry { name: string; sets: number; reps: number; weight: number; }
export interface Comment { id: string; username: string; avatar_url: string; text: string; created_at: string; }

export interface Post {
  id: string; user_id: string; username: string; avatar_url: string; partner_name?: string; image_url?: string; club_name: string; session_type: string; caption: string; exercises: ExerciseEntry[]; likes_count: number; liked_by?: string[]; comments_count: number; comments?: Comment[]; created_at: string; is_private?: boolean;
}

export interface Story {
  id: string; user_id: string; username: string; avatar_url: string; image_url: string; caption?: string; club_name?: string; likes_count?: number; created_at: string;
}

export interface RealUser {
  id: string; username: string; email: string; gender?: 'M' | 'F' | 'Non-binaire' | 'Non spécifié'; birth_date?: string; age: number; goal?: string; home_club: string; preferred_time?: string; avatar_url: string; cover_url?: string; last_seen?: string; is_verified?: boolean; is_admin?: boolean;
}

export interface FriendRequest {
  id: string; sender_id: string; receiver_id: string; status: 'pending' | 'accepted'; timestamp?: number;
}

export interface DBMessage {
  id: string; sender_id: string; receiver_id: string; sender_name: string; text: string; created_at: string; read?: boolean;
}

export interface LiveWorkoutSet { setNumber: number; weight: number; reps: number; completed: boolean; }
export interface LiveWorkoutExercise { id: string; name: string; sets: LiveWorkoutSet[]; }
export interface AIChatMessage { sender: 'user' | 'bot'; text: string; }

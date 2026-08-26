import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Send,
  Dumbbell,
  Zap,
  PlusSquare,
  Search,
  Trophy,
  User,
  Home,
  MessageSquare,
  Plus,
  Trash2,
  LogOut,
  Lock,
  Mail,
  Camera,
  Loader2,
  Clock,
  Flame,
  Share2,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Users,
  MessageCircle,
  X,
  SendHorizontal,
  ZoomIn,
  Move,
  Filter,
  UserPlus,
  UserCheck,
  UserX,
  ArrowLeft,
  Calendar,
  Navigation,
  CheckCircle2,
  Building2,
  Sparkles
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ClubLocation {
  name: string;
  address?: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  distance?: number | null;
}

const CLUBS_DATABASE: ClubLocation[] = [
  {
    name: 'Basic-Fit Tournai (Bastion)',
    address: 'Chaussée de Lille 322',
    city: 'Tournai',
    zip: '7500',
    lat: 50.6095,
    lng: 3.3762
  },
  {
    name: 'Basic-Fit Tournai (Froyennes)',
    address: 'Boulevard des Déportés 30',
    city: 'Tournai',
    zip: '7500',
    lat: 50.6051,
    lng: 3.3934
  },
  {
    name: 'Basic-Fit Mouscron',
    address: 'Rue de Menin 435',
    city: 'Mouscron',
    zip: '7700',
    lat: 50.7423,
    lng: 3.2091
  },
  {
    name: 'Basic-Fit Mons',
    address: 'Chaussée de Binche 113',
    city: 'Mons',
    zip: '7000',
    lat: 50.4542,
    lng: 3.9658
  },
  {
    name: 'Basic-Fit La Louvière',
    address: 'Rue de Bouvy 50',
    city: 'La Louvière',
    zip: '7100',
    lat: 50.4812,
    lng: 4.1905
  },
  {
    name: 'Basic-Fit Charleroi (Ville 2)',
    address: 'Rue de Couillet 31',
    city: 'Charleroi',
    zip: '6000',
    lat: 50.4131,
    lng: 4.4447
  },
  {
    name: 'Basic-Fit Waterloo',
    address: 'Chaussée de Bruxelles 254',
    city: 'Waterloo',
    zip: '1410',
    lat: 50.7224,
    lng: 4.3981
  },
  {
    name: 'Basic-Fit Wavre',
    address: 'Chaussée de Louvain 20',
    city: 'Wavre',
    zip: '1300',
    lat: 50.7183,
    lng: 4.6072
  },
  {
    name: 'Basic-Fit Namur (Bouge)',
    address: 'Chaussée de Louvain 445',
    city: 'Bouge (Namur)',
    zip: '5004',
    lat: 50.4735,
    lng: 4.8712
  },
  {
    name: 'Basic-Fit Liège (Saint-Lambert)',
    address: 'Place Saint-Lambert 32',
    city: 'Liège',
    zip: '4000',
    lat: 50.6452,
    lng: 5.5734
  },
  {
    name: 'Basic-Fit Liège (Ans)',
    address: 'Chaussée du Roi Albert 7/13',
    city: 'Ans',
    zip: '4430',
    lat: 50.6548,
    lng: 5.5291
  },
  {
    name: 'Basic-Fit Arlon (Hydrion)',
    address: "Parc Commercial de l'Hydrion 31b",
    city: 'Arlon',
    zip: '6700',
    lat: 49.6841,
    lng: 5.8173
  }
];

const isMatchingClub = (postClubName?: string, selectedClubName?: string): boolean => {
  if (!postClubName || !selectedClubName) return false;
  if (postClubName === selectedClubName) return true;

  const normalize = (str: string) =>
    str.toLowerCase().replace(/basic-fit\s*/gi, '').replace(/[()]/g, '').trim();

  const p = normalize(postClubName);
  const s = normalize(selectedClubName);

  if (p === s) return true;

  if (p.includes('froyennes') && s.includes('froyennes')) return true;
  if ((p === 'tournai' || p.includes('bastion')) && (s === 'tournai' || s.includes('bastion'))) return true;
  if (p.includes('mouscron') && s.includes('mouscron')) return true;
  if (p.includes('mons') && s.includes('mons')) return true;
  if (p.includes('louvière') && s.includes('louvière')) return true;
  if (p.includes('charleroi') && s.includes('charleroi')) return true;
  if (p.includes('namur') && s.includes('namur')) return true;
  if (p.includes('waterloo') && s.includes('waterloo')) return true;
  if (p.includes('wavre') && s.includes('wavre')) return true;
  if (p.includes('arlon') && s.includes('arlon')) return true;
  if (p.includes('ans') && s.includes('ans')) return true;
  if (p.includes('lambert') && s.includes('lambert')) return true;

  return false;
};

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
};

interface ExerciseEntry {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface Comment {
  id: string;
  username: string;
  avatar_url: string;
  text: string;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  partner_name?: string;
  image_url?: string;
  image_zoom?: number;
  image_pos_x?: number;
  image_pos_y?: number;
  club_name: string;
  session_type: string;
  caption: string;
  duration_minutes: number;
  calories_burned: number;
  exercises: ExerciseEntry[];
  likes_count: number;
  comments_count: number;
  comments?: Comment[];
  created_at: string;
}

interface Story {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  image_url: string;
  caption?: string;
  club_name?: string;
  likes_count?: number;
  created_at: string;
}

interface Buddy {
  id: string;
  name: string;
  gender: 'F' | 'M';
  avatar_url: string;
  level: string;
  schedule: string;
  goal: string;
  club: string;
}

interface DBMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

const DEFAULT_FRIEND_STORIES: Story[] = [
  {
    id: 'demo-s1',
    user_id: 'b1',
    username: 'Thomas D.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
    caption: 'Prêt pour exploser le PR au dev couché 🔥',
    club_name: 'Basic-Fit Tournai (Bastion)',
    likes_count: 3,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'demo-s2',
    user_id: 'b2',
    username: 'Sarah L.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    caption: 'Fin de séance HIIT cardio, les jambes en feu 💦',
    club_name: 'Basic-Fit Tournai (Bastion)',
    likes_count: 5,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Formulaire d'inscription / Connexion
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [level, setLevel] = useState<'Débutant' | 'Intermédiaire' | 'Avancé'>('Intermédiaire');
  const [homeClub, setHomeClub] = useState<string>('Basic-Fit Tournai (Bastion)');

  // Sélecteur Club
  const [clubsList, setClubsList] = useState<ClubLocation[]>(CLUBS_DATABASE);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clubSearchQuery, setClubSearchQuery] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation
  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'workout' | 'chat' | 'leaderboard' | 'profile'>('feed');
  const [feedFilterMode, setFeedFilterMode] = useState<'all' | 'friends'>('all');
  const [selectedClub, setSelectedClub] = useState<string>('Basic-Fit Tournai (Bastion)');

  // Posts Feed & Likes
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Friends System
  const [friendIds, setFriendIds] = useState<string[]>(['b1', 'b2']);
  const [friendRequestsReceived, setFriendRequestsReceived] = useState<string[]>(['b3']);
  const [buddyTabSubMode, setBuddyTabSubMode] = useState<'discover' | 'my_friends'>('discover');

  // Stories State
  const [cloudStories, setCloudStories] = useState<Story[]>([]);
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [storyCommentInput, setStoryCommentInput] = useState('');
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [storyImagePreview, setStoryImagePreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [storyUploading, setStoryUploading] = useState(false);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  // Comments Drawer
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Workout Form State
  const [workoutType, setWorkoutType] = useState('Musculation (Push)');
  const [workoutCaption, setWorkoutCaption] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [workoutCalories, setWorkoutCalories] = useState(450);
  const [taggedPartner, setTaggedPartner] = useState<string>('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Image Framing State
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [workoutExercises, setWorkoutExercises] = useState<ExerciseEntry[]>([
    { name: 'Développé couché', sets: 4, reps: 10, weight: 80 }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rest Timer
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(90);

  // Buddy Filters
  const [filterWomenOnly, setFilterWomenOnly] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterGoal, setFilterGoal] = useState<string>('all');

  const buddiesList: Buddy[] = [
    {
      id: 'b1',
      name: 'Thomas D.',
      gender: 'M',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      level: 'Avancé',
      schedule: 'Lun, Mer, Ven (18h-20h)',
      goal: 'Prise de masse & Force',
      club: 'Basic-Fit Tournai (Bastion)'
    },
    {
      id: 'b2',
      name: 'Sarah L.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      level: 'Intermédiaire',
      schedule: 'Mardi & Jeudi (12h-13h30)',
      goal: 'Cardio, HIIT & Tonification',
      club: 'Basic-Fit Tournai (Bastion)'
    },
    {
      id: 'b3',
      name: 'Élodie M.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 'Débutant',
      schedule: 'Mercredi & Samedi matin',
      goal: 'Remise en forme & Fessiers',
      club: 'Basic-Fit Tournai (Froyennes)'
    },
    {
      id: 'b4',
      name: 'Maxime V.',
      gender: 'M',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      level: 'Avancé',
      schedule: 'Samedi & Dimanche matin',
      goal: 'Powerlifting (Squat / Dev couché)',
      club: 'Basic-Fit Mouscron'
    },
    {
      id: 'b5',
      name: 'Camille R.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      level: 'Intermédiaire',
      schedule: 'Tous les soirs (17h30-19h)',
      goal: 'Prise de masse & Musculation',
      club: 'Basic-Fit Mons'
    }
  ];

  // Chat Hub & Realtime Messages
  const [selectedBuddyChat, setSelectedBuddyChat] = useState<Buddy | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser?.user_metadata?.home_club) {
        setSelectedClub(activeUser.user_metadata.home_club);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser?.user_metadata?.home_club) {
        setSelectedClub(activeUser.user_metadata.home_club);
      }
    });

    fetchCloudPosts();
    fetchDirectMessages();
    fetchCloudStories();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          setAllMessages((prev) => [...prev, payload.new as DBMessage]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'direct_messages' },
        (payload) => {
          setAllMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stories' },
        (payload) => {
          setCloudStories((prev) => [payload.new as Story, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedBuddyChat]);

  const fetchCloudPosts = async () => {
    setFeedLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    }
    setFeedLoading(false);
  };

  const fetchCloudStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCloudStories(data as Story[]);
      }
    } catch (err) {}
  };

  const fetchDirectMessages = async () => {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setAllMessages(data as DBMessage[]);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // COMBINAISON DE TOUTES LES STORIES VALIDES (< 24H)
  const combinedAllStories = [...cloudStories, ...DEFAULT_FRIEND_STORIES];
  const myFriendsList = buddiesList.filter((b) => friendIds.includes(b.id));
  const myFriendNames = myFriendsList.map((f) => f.name);
  const friendRequestsList = buddiesList.filter((b) => friendRequestsReceived.includes(b.id));

  // FILTRE STRICT : Uniquement les amis confirmés OU ma propre story, datant de moins de 24h
  const twentyFourHoursAgoMs = Date.now() - 24 * 3600 * 1000;
  const friendStoriesList = combinedAllStories.filter((s) => {
    const storyDate = new Date(s.created_at).getTime();
    const isUnder24h = !isNaN(storyDate) ? storyDate >= twentyFourHoursAgoMs : true;
    const isFriendOrMe =
      s.user_id === user?.id ||
      friendIds.includes(s.user_id) ||
      myFriendNames.includes(s.username);
    return isUnder24h && isFriendOrMe;
  });

  // Défilement automatique de 5 secondes par story
  useEffect(() => {
    if (activeStoryIndex === null || isStoryPaused) {
      return;
    }

    const currentStory = friendStoriesList[activeStoryIndex];
    if (currentStory && !viewedStoryIds.includes(currentStory.id)) {
      setViewedStoryIds((prev) => [...prev, currentStory.id]);
    }

    const interval = 50;
    const step = (interval / 5000) * 100;

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStoryIndex, isStoryPaused, friendStoriesList.length]);

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < friendStoriesList.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setStoryProgress(0);
      setStoryCommentInput('');
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setStoryProgress(0);
      setStoryCommentInput('');
    } else {
      setStoryProgress(0);
    }
  };

  const handleToggleStoryLike = async (storyId: string) => {
    const isLiked = likedStories[storyId];
    setLikedStories((prev) => ({ ...prev, [storyId]: !isLiked }));

    const story = friendStoriesList.find((s) => s.id === storyId);
    if (!story || !user) return;

    if (!isLiked) {
      const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
      await supabase.from('direct_messages').insert([
        {
          sender_id: user.id,
          receiver_id: story.user_id,
          sender_name: myName,
          text: `❤️ A aimé ta story !`
        }
      ]);
    }
  };

  const handleSendStoryComment = async (e?: React.FormEvent, quickEmoji?: string) => {
    if (e) e.preventDefault();
    const textToSend = quickEmoji || storyCommentInput.trim();
    if (!textToSend || activeStoryIndex === null || !user) return;

    const story = friendStoriesList[activeStoryIndex];
    if (!story) return;

    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';

    const { error } = await supabase.from('direct_messages').insert([
      {
        sender_id: user.id,
        receiver_id: story.user_id,
        sender_name: myName,
        text: `📸 En réponse à ta story : "${textToSend}"`
      }
    ]);

    if (!error) {
      setStoryCommentInput('');
      setIsStoryPaused(false);
      alert('Réponse envoyée en message direct !');
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par ton navigateur.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);

        const updated = CLUBS_DATABASE.map((c) => ({
          ...c,
          distance: calculateDistanceKm(coords.lat, coords.lng, c.lat, c.lng)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setClubsList(updated);
        if (updated.length > 0) {
          setHomeClub(updated[0].name);
        }
        setGpsLoading(false);
      },
      (err) => {
        alert("Impossible d'obtenir ta position GPS : " + err.message);
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const displayedClubs = clubsList
    .map((club) => {
      let distance = club.distance ?? null;
      if (userCoords && distance === null) {
        distance = calculateDistanceKm(userCoords.lat, userCoords.lng, club.lat, club.lng);
      }
      return { ...club, distance };
    })
    .filter((club) => {
      if (!clubSearchQuery.trim()) return true;
      const q = clubSearchQuery.toLowerCase();
      return (
        club.name.toLowerCase().includes(q) ||
        club.city.toLowerCase().includes(q) ||
        club.zip.includes(q) ||
        (club.address && club.address.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return 0;
    });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username || `${firstName}_${lastName}`.toLowerCase(),
            age: Number(age) || 25,
            gender,
            level,
            home_club: homeClub
          }
        }
      });

      if (error) {
        alert("Erreur d'inscription : " + error.message);
      } else {
        alert("Compte créé avec succès ! Bienvenue sur FitPulse.");
        setSelectedClub(homeClub);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Erreur de connexion : " + error.message);
    }
    setAuthLoading(false);
  };

  const handleAcceptFriendRequest = (buddyId: string) => {
    setFriendRequestsReceived((prev) => prev.filter((id) => id !== buddyId));
    setFriendIds((prev) => [...prev, buddyId]);
  };

  const handleDeclineFriendRequest = (buddyId: string) => {
    setFriendRequestsReceived((prev) => prev.filter((id) => id !== buddyId));
  };

  const handleToggleFriend = (buddyId: string) => {
    if (friendIds.includes(buddyId)) {
      if (window.confirm("Retirer cet ami de ta liste ?")) {
        setFriendIds(friendIds.filter((id) => id !== buddyId));
      }
    } else {
      setFriendIds((prev) => [...prev, buddyId]);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer cette publication ?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      setPostImagePreview(URL.createObjectURL(file));
      setImageZoom(1);
      setImagePos({ x: 0, y: 0 });
    }
  };

  const handleStoryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoryImageFile(file);
      setStoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !storyImageFile) return;
    setStoryUploading(true);

    let uploadedStoryUrl = storyImagePreview || '';

    try {
      const compressedBlob = await compressImage(storyImageFile, 800, 0.7);
      const fileName = `story-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, compressedBlob, { contentType: 'image/jpeg' });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
        uploadedStoryUrl = publicUrlData.publicUrl;
      }
    } catch (err) {}

    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';

    const newStoryData: Story = {
      id: 'story-' + Date.now(),
      user_id: user.id,
      username: myName,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      image_url: uploadedStoryUrl,
      caption: storyCaption,
      club_name: selectedClub,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    const { data } = await supabase.from('stories').insert([{
      user_id: user.id,
      username: myName,
      avatar_url: newStoryData.avatar_url,
      image_url: uploadedStoryUrl,
      caption: storyCaption,
      club_name: selectedClub
    }]).select('*');

    if (data && data.length > 0) {
      setCloudStories([data[0] as Story, ...cloudStories]);
    } else {
      setCloudStories([newStoryData, ...cloudStories]);
    }

    setStoryImageFile(null);
    setStoryImagePreview(null);
    setStoryCaption('');
    setIsCreatingStory(false);
    setStoryUploading(false);
  };

  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - imagePos.x, y: clientY - imagePos.y });
  };

  const handleMoveDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setImagePos({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  const handleToggleLike = async (postId: string) => {
    const isLiked = likedPosts[postId];
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const newLikesCount = isLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1;

    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes_count: newLikesCount } : p)));

    await supabase.from('posts').update({ likes_count: newLikesCount }).eq('id', postId);
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: String(Date.now()),
      username: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Moi',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: commentInput,
      created_at: "À l'instant"
    };

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const updatedComments = [...(targetPost.comments || []), newComment];
    const updatedCount = (targetPost.comments_count || 0) + 1;

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: updatedComments, comments_count: updatedCount } : p))
    );
    setCommentInput('');

    await supabase
      .from('posts')
      .update({ comments: updatedComments, comments_count: updatedCount })
      .eq('id', postId);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || currentMessageInput;
    if (!content.trim() || !selectedBuddyChat || !user) return;

    const myName = user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';

    const newMessagePayload = {
      sender_id: user.id,
      receiver_id: selectedBuddyChat.id,
      sender_name: myName,
      text: content.trim()
    };

    setCurrentMessageInput('');

    const { error } = await supabase.from('direct_messages').insert([newMessagePayload]);
    if (error) {
      alert("Erreur d'envoi du message : " + error.message);
    }
  };

  const handleDeleteConversationForBuddy = async (buddyId: string, buddyName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    if (!window.confirm(`Effacer tous les messages avec ${buddyName} ?`)) return;

    await supabase
      .from('direct_messages')
      .delete()
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${buddyId}),and(sender_id.eq.${buddyId},receiver_id.eq.${user.id})`
      );

    setAllMessages((prev) =>
      prev.filter(
        (m) =>
          !(
            (m.sender_id === user.id && m.receiver_id === buddyId) ||
            (m.sender_id === buddyId && m.receiver_id === user.id)
          )
      )
    );
  };

  const addExerciseRow = () => {
    setWorkoutExercises([...workoutExercises, { name: '', sets: 3, reps: 10, weight: 20 }]);
  };

  const updateExerciseField = (index: number, field: keyof ExerciseEntry, value: any) => {
    const updated = [...workoutExercises];
    updated[index] = { ...updated[index], [field]: value };
    setWorkoutExercises(updated);
  };

  const removeExerciseRow = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const handlePublishWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUploading(true);

    let uploadedImageUrl = undefined;

    if (postImageFile) {
      try {
        const compressedBlob = await compressImage(postImageFile, 800, 0.7);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, compressedBlob, { contentType: 'image/jpeg' });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      } catch (err: any) {}
    }

    const validExercises = workoutExercises.filter((e) => e.name.trim() !== '');

    const newPostData = {
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'Athlète',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      partner_name: taggedPartner || null,
      image_url: uploadedImageUrl || null,
      image_zoom: imageZoom,
      image_pos_x: imagePos.x,
      image_pos_y: imagePos.y,
      club_name: selectedClub,
      session_type: workoutType,
      caption: workoutCaption,
      duration_minutes: workoutDuration,
      calories_burned: workoutCalories,
      exercises: validExercises,
      likes_count: 0,
      comments_count: 0,
      comments: []
    };

    const { data, error } = await supabase.from('posts').insert([newPostData]).select('*');

    if (!error && data && data.length > 0) {
      setPosts([data[0] as Post, ...posts]);
      setWorkoutCaption('');
      setTaggedPartner('');
      setPostImageFile(null);
      setPostImagePreview(null);
      setImageZoom(1);
      setImagePos({ x: 0, y: 0 });
      setWorkoutExercises([{ name: '', sets: 3, reps: 10, weight: 20 }]);
      setCurrentTab('feed');
    }

    setIsUploading(false);
  };

  const filteredBuddies = buddiesList.filter((buddy) => {
    if (buddyTabSubMode === 'my_friends') return friendIds.includes(buddy.id);
    if (!isMatchingClub(buddy.club, selectedClub)) return false;
    if (filterWomenOnly && buddy.gender !== 'F') return false;
    if (filterLevel !== 'all' && !buddy.level.toLowerCase().includes(filterLevel.toLowerCase())) return false;
    if (filterGoal !== 'all' && !buddy.goal.toLowerCase().includes(filterGoal.toLowerCase())) return false;
    return true;
  });

  const displayedPosts = posts.filter((post) => {
    if (feedFilterMode === 'all') {
      return isMatchingClub(post.club_name, selectedClub);
    }
    if (feedFilterMode === 'friends') {
      return post.user_id === user?.id || myFriendNames.includes(post.username);
    }
    return true;
  });

  const currentChatMessages = allMessages.filter(
    (m) =>
      selectedBuddyChat &&
      user &&
      ((m.sender_id === user.id && m.receiver_id === selectedBuddyChat.id) ||
        (m.sender_id === selectedBuddyChat.id && m.receiver_id === user.id))
  );

  const activeViewingStory = activeStoryIndex !== null ? friendStoriesList[activeStoryIndex] : null;

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500">
              <Zap className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center tracking-tight mb-1">FitPulse</h1>
          <p className="text-xs text-neutral-400 text-center mb-6">
            {isSignUp ? 'Création de ton profil athlète' : 'Connecte-toi à ton espace'}
          </p>

          <form onSubmit={handleAuth} className="space-y-3.5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      placeholder="Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Pseudo public</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex_Fit"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Âge</label>
                    <input
                      type="number"
                      required
                      min="14"
                      max="99"
                      placeholder="28"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Genre</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300"
                    >
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Niveau</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300"
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Mon Basic-Fit "Maison"
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={gpsLoading}
                      className="px-2.5 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      {gpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                      GPS autour de moi
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Ville, code postal, rue (ex: Tournai, 7500, Bastion)..."
                      value={clubSearchQuery}
                      onChange={(e) => setClubSearchQuery(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {displayedClubs.map((club) => {
                      const isSelected = homeClub === club.name;
                      return (
                        <div
                          key={club.name}
                          onClick={() => setHomeClub(club.name)}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition border ${
                            isSelected
                              ? 'bg-orange-600/20 border-orange-500 text-white font-bold'
                              : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 ${isSelected ? 'text-orange-500' : 'text-neutral-600'}`} />
                            <div>
                              <span className="block leading-tight text-neutral-200">{club.name}</span>
                              <span className="text-[10px] text-neutral-500 leading-tight">
                                {club.address ? `${club.address}, ` : ''}{club.zip} {club.city}
                              </span>
                            </div>
                          </div>
                          {club.distance !== null && (
                            <span className="text-[10px] text-orange-400 font-mono font-semibold ml-2 whitespace-nowrap">
                              {club.distance} km
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 text-xs"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-xs text-neutral-400 hover:text-white mt-5 transition"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    );
  }

  const activePostForComments = posts.find((p) => p.id === activeCommentPostId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none">FitPulse</h1>
            <span className="text-[10px] text-orange-400 font-semibold truncate block max-w-[150px]">{selectedClub}</span>
          </div>
        </div>

        <select
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-[11px] rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-orange-500 max-w-[170px] truncate"
        >
          {displayedClubs.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </header>

      {/* Main Screen Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 pb-24">
        {/* TAB 1: FEED AVEC STORIES EXCLUSIVES AMIS */}
        {currentTab === 'feed' && (
          <div className="space-y-4">
            
            {/* STORIES ROW (HACHURÉ SI VU, COULEUR SI NON VU, RÉSERVÉ AUX AMIS) */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-3">
              <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
                
                {/* Bulle Publier ma story */}
                <div
                  onClick={() => setIsCreatingStory(true)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
                >
                  <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-orange-500/50 flex items-center justify-center p-0.5 group-hover:border-orange-500 transition">
                    <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-orange-400 font-bold text-lg">
                      {user.user_metadata?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '+'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white border-2 border-neutral-950 shadow-md">
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-300 tracking-tight">Ta story</span>
                </div>

                {/* Bulles Stories de mes Amis */}
                {friendStoriesList.map((story, index) => {
                  const isViewed = viewedStoryIds.includes(story.id);

                  return (
                    <div
                      key={story.id}
                      onClick={() => {
                        setActiveStoryIndex(index);
                        setStoryProgress(0);
                        setIsStoryPaused(false);
                      }}
                      className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
                      {/* CERCLE HACHURÉ SI VU / GRADIENT COULEUR SI NON VU */}
                      {isViewed ? (
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-600 p-[2px] opacity-75 hover:opacity-100 hover:border-orange-400/60 transition">
                          <div className="w-full h-full bg-neutral-950 rounded-full p-[1px]">
                            <img
                              src={story.avatar_url}
                              alt={story.username}
                              className="w-full h-full rounded-full object-cover grayscale-[15%]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 via-pink-500 to-amber-400 p-[2.5px] shadow-sm hover:scale-105 transition transform">
                          <div className="w-full h-full bg-neutral-950 rounded-full p-[2px]">
                            <img
                              src={story.avatar_url}
                              alt={story.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <span className="text-[10px] font-medium text-neutral-300 truncate max-w-[64px] text-center">
                        {story.username.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filtre Club vs Amis */}
            <div className="bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
              <button
                onClick={() => setFeedFilterMode('all')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition truncate px-2 ${
                  feedFilterMode === 'all' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Fil du club ({selectedClub.replace('Basic-Fit ', '')})
              </button>
              <button
                onClick={() => setFeedFilterMode('friends')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  feedFilterMode === 'friends' ? 'bg-orange-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Mes Amis ({myFriendsList.length})
              </button>
            </div>

            {/* Rest Timer */}
            <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                  {timerSeconds}s
                </div>
                <div>
                  <h4 className="text-xs font-bold">Chronomètre de repos</h4>
                  <p className="text-[11px] text-neutral-400">Garde le tempo entre tes séries</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-2 rounded-lg bg-orange-600 text-white hover:bg-orange-500 text-xs"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(initialTime);
                  }}
                  className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {feedLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs bg-neutral-900/50 rounded-3xl border border-neutral-800/60 p-6">
                {feedFilterMode === 'friends'
                  ? "Aucune publication de tes amis pour l'instant."
                  : `Aucune publication pour l'instant à ${selectedClub}. Sois le premier à publier !`}
              </div>
            ) : (
              displayedPosts.map((post) => {
                const isLiked = likedPosts[post.id];
                const isMyPost = post.user_id === user.id || post.username === (user.user_metadata?.username || user.email?.split('@')[0]);

                return (
                  <article
                    key={post.id}
                    className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-sm overflow-hidden relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm leading-snug">{post.username}</h3>
                            {post.partner_name && (
                              <span className="text-[10px] bg-orange-500/10 text-orange-400 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-orange-500/20">
                                <Users className="w-3 h-3" /> avec {post.partner_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-orange-400 font-medium">
                            <MapPin className="w-3 h-3" />
                            {post.club_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/50">
                          {post.session_type}
                        </span>
                        {isMyPost && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            title="Supprimer ma publication"
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {post.image_url && (
                      <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-72 w-full relative flex items-center justify-center">
                        <img
                          src={post.image_url}
                          alt="Séance"
                          style={{
                            transform: `translate(${post.image_pos_x || 0}px, ${post.image_pos_y || 0}px) scale(${post.image_zoom || 1})`,
                            transformOrigin: 'center center'
                          }}
                          className="max-h-full max-w-full object-contain pointer-events-none"
                        />
                      </div>
                    )}

                    {post.caption && <p className="text-xs text-neutral-200 leading-relaxed">{post.caption}</p>}

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-300">
                        <Clock className="w-3 h-3 text-orange-500" />
                        {post.duration_minutes || 60} min
                      </span>
                      <span className="flex items-center gap-1 text-[11px] bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-300">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {post.calories_burned || 400} kcal
                      </span>
                    </div>

                    {post.exercises && post.exercises.length > 0 && (
                      <div className="bg-neutral-950/70 rounded-2xl p-3 border border-neutral-800/60 space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                          Exercices enregistrés
                        </span>
                        {post.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-neutral-900 last:border-none">
                            <span className="font-medium text-neutral-300">{ex.name}</span>
                            <span className="font-mono text-[11px] text-orange-400 font-semibold">
                              {ex.sets} × {ex.reps} {ex.weight > 0 && `@ ${ex.weight} kg`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-neutral-400 text-xs">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-medium transition ${
                          isLiked ? 'text-red-500' : 'hover:text-neutral-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                        <span>{post.likes_count}</span>
                      </button>
                      <button
                        onClick={() => setActiveCommentPostId(post.id)}
                        className="flex items-center gap-1.5 hover:text-orange-400 font-medium transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments_count || post.comments?.length || 0} commentaires</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-neutral-200 transition">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: BUDDY */}
        {currentTab === 'buddy' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-black tracking-tight">Réseau & Buddy</h2>
                </div>
              </div>

              <div className="bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
                <button
                  onClick={() => setBuddyTabSubMode('discover')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    buddyTabSubMode === 'discover' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Découvrir des partenaires
                </button>
                <button
                  onClick={() => setBuddyTabSubMode('my_friends')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    buddyTabSubMode === 'my_friends' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Mes Amis ({myFriendsList.length})
                </button>
              </div>

              {buddyTabSubMode === 'discover' && (
                <div className="space-y-2.5 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                      <Filter className="w-3.5 h-3.5 text-orange-500" />
                      <span>Filtres de recherche</span>
                    </div>

                    <button
                      onClick={() => setFilterWomenOnly(!filterWomenOnly)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        filterWomenOnly
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/20 ring-2 ring-pink-400'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <span>🚺</span> Entre femmes {filterWomenOnly && '✓'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">Niveau</label>
                      <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300"
                      >
                        <option value="all">Tous les niveaux</option>
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">Objectif principal</label>
                      <select
                        value={filterGoal}
                        onChange={(e) => setFilterGoal(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300"
                      >
                        <option value="all">Tous objectifs</option>
                        <option value="masse">Prise de masse / Force</option>
                        <option value="cardio">Cardio / HIIT</option>
                        <option value="remise">Remise en forme</option>
                        <option value="powerlifting">Powerlifting</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-1">
                {filteredBuddies.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    {buddyTabSubMode === 'my_friends'
                      ? "Tu n'as pas encore d'amis dans ta liste."
                      : 'Aucun partenaire ne correspond à ces critères dans ce club.'}
                  </div>
                ) : (
                  filteredBuddies.map((buddy) => {
                    const isFriend = friendIds.includes(buddy.id);

                    return (
                      <div
                        key={buddy.id}
                        className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col space-y-3 relative overflow-hidden"
                      >
                        {buddy.gender === 'F' && <div className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-bl-lg" />}

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <img src={buddy.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm text-white">{buddy.name}</h3>
                                {buddy.gender === 'F' && (
                                  <span className="text-[10px] bg-pink-950/80 text-pink-300 border border-pink-500/30 px-1.5 py-0.2 rounded font-semibold">
                                    Femme
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-orange-400 font-semibold">{buddy.level}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleFriend(buddy.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                isFriend
                                  ? 'bg-neutral-900 border border-neutral-700 text-green-400 hover:text-red-400'
                                  : 'bg-neutral-900 border border-neutral-700 hover:border-orange-500 text-neutral-200'
                              }`}
                            >
                              {isFriend ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" /> Amis
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" /> Ajouter
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBuddyChat(buddy);
                                setCurrentTab('chat');
                              }}
                              className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition shadow-md shadow-orange-600/20"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-neutral-900/60 rounded-xl p-2.5 text-[11px] space-y-1 text-neutral-300">
                          <div>
                            <strong className="text-neutral-400">Créneaux :</strong> {buddy.schedule}
                          </div>
                          <div>
                            <strong className="text-neutral-400">Objectif :</strong> {buddy.goal}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKOUT */}
        {currentTab === 'workout' && (
          <form onSubmit={handlePublishWorkout} className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-black tracking-tight">Enregistrer une séance</h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Partenaire d'entraînement (Buddy)</label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-3 w-4 h-4 text-orange-500" />
                  <select
                    value={taggedPartner}
                    onChange={(e) => setTaggedPartner(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Séance solo (Aucun ami sélectionné)</option>
                    {myFriendsList.map((friend) => (
                      <option key={friend.id} value={friend.name}>
                        {friend.name} (Ami ✓)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Photo de la séance</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />

                {postImagePreview ? (
                  <div className="space-y-3">
                    <div
                      className="relative rounded-2xl overflow-hidden border-2 border-orange-500/50 bg-neutral-950 h-72 w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                      onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
                      onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
                      onMouseUp={handleEndDrag}
                      onMouseLeave={handleEndDrag}
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        handleStartDrag(touch.clientX, touch.clientY);
                      }}
                      onTouchMove={(e) => {
                        const touch = e.touches[0];
                        handleMoveDrag(touch.clientX, touch.clientY);
                      }}
                      onTouchEnd={handleEndDrag}
                    >
                      <img
                        src={postImagePreview}
                        alt="Preview"
                        style={{
                          transform: `translate(${imagePos.x}px, ${imagePos.y}px) scale(${imageZoom})`,
                          transformOrigin: 'center center'
                        }}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />

                      <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] text-neutral-300 flex items-center gap-1.5 pointer-events-none">
                        <Move className="w-3 h-3 text-orange-400" /> Glisse pour ajuster
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPostImageFile(null);
                          setPostImagePreview(null);
                          setImageZoom(1);
                          setImagePos({ x: 0, y: 0 });
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black text-white rounded-full transition z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center gap-3">
                      <ZoomIn className="w-4 h-4 text-neutral-400" />
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={imageZoom}
                        onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                        className="flex-1 accent-orange-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageZoom(1);
                          setImagePos({ x: 0, y: 0 });
                        }}
                        className="text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800"
                      >
                        Centrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-neutral-800 hover:border-orange-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-orange-400 bg-neutral-950 transition"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-xs font-medium">Ajouter ou prendre une photo</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Type d'entraînement</label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="Musculation (Push)">Musculation (Pectoraux / Épaules / Triceps)</option>
                  <option value="Musculation (Pull)">Musculation (Dos / Biceps)</option>
                  <option value="Musculation (Legs)">Musculation (Jambes / Fessiers)</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Cardio & HIIT">Cardio & HIIT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Durée (minutes)</label>
                  <input
                    type="number"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Calories</label>
                  <input
                    type="number"
                    value={workoutCalories}
                    onChange={(e) => setWorkoutCalories(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Description / Sensations</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Séance duo au top, super motivation aujourd’hui !"
                  value={workoutCaption}
                  onChange={(e) => setWorkoutCaption(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Exercices effectués</label>
                {workoutExercises.map((ex, index) => (
                  <div key={index} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Exercice (ex: Développé couché)"
                        value={ex.name}
                        onChange={(e) => updateExerciseField(index, 'name', e.target.value)}
                        className="flex-1 bg-transparent text-xs font-bold text-white border-b border-neutral-800 focus:outline-none focus:border-orange-500 pb-1"
                      />
                      {workoutExercises.length > 1 && (
                        <button type="button" onClick={() => removeExerciseRow(index)} className="text-neutral-500 hover:text-red-400 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Séries</span>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExerciseField(index, 'sets', Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Reps</span>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => updateExerciseField(index, 'reps', Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Poids (kg)</span>
                        <input
                          type="number"
                          value={ex.weight}
                          onChange={(e) => updateExerciseField(index, 'weight', Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-center font-bold text-orange-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExerciseRow}
                  className="w-full py-2.5 bg-neutral-950 border border-dashed border-neutral-700 hover:border-orange-500 rounded-xl text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4 text-orange-400" /> Ajouter un exercice
                </button>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Partager ma séance'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: CHAT */}
        {currentTab === 'chat' && (
          <div className="space-y-4">
            {selectedBuddyChat ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[74vh]">
                <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedBuddyChat(null)}
                      className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <img src={selectedBuddyChat.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-orange-500/30" />
                    <div>
                      <h3 className="font-bold text-xs text-white">{selectedBuddyChat.name}</h3>
                      <span className="text-[10px] text-green-400 font-medium">● Direct ({selectedBuddyChat.club})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendMessage("Dispo pour une séance ensemble aujourd'hui ? 🏋️‍♂️")}
                      title="Proposer une séance duo"
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-orange-400 text-[11px] font-bold flex items-center gap-1 border border-neutral-700"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Séance duo
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversationForBuddy(selectedBuddyChat.id, selectedBuddyChat.name, e)}
                      title="Effacer toute la discussion"
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {currentChatMessages.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs">
                      Aucun message. Envoie le premier message pour lancer la discussion !
                    </div>
                  ) : (
                    currentChatMessages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                              isMe ? 'bg-orange-600 text-white rounded-tr-none shadow-md shadow-orange-600/10' : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-neutral-500 mt-1 px-1">{timeStr}</span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Écrire à ${selectedBuddyChat.name}...`}
                    value={currentMessageInput}
                    onChange={(e) => setCurrentMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition"
                  >
                    <SendHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    <h2 className="text-base font-black tracking-tight">Messagerie Directe</h2>
                  </div>
                  <span className="text-[11px] text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                    {myFriendsList.length} contact{myFriendsList.length > 1 ? 's' : ''}
                  </span>
                </div>

                {friendRequestsList.length > 0 && (
                  <div className="space-y-2.5 bg-orange-500/5 border border-orange-500/20 p-3.5 rounded-2xl">
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" /> Demandes d'amis reçues ({friendRequestsList.length})
                    </span>

                    <div className="space-y-2">
                      {friendRequestsList.map((req) => (
                        <div key={req.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img src={req.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-neutral-700" />
                            <div>
                              <h4 className="font-bold text-xs text-white leading-tight">{req.name}</h4>
                              <span className="text-[10px] text-neutral-400">{req.club}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAcceptFriendRequest(req.id)}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Accepter
                            </button>
                            <button
                              onClick={() => handleDeclineFriendRequest(req.id)}
                              className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded-lg text-xs transition border border-neutral-800"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Rechercher un ami..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Discussions actives</span>

                  {myFriendsList
                    .filter((f) => f.name.toLowerCase().includes(chatSearch.toLowerCase()))
                    .map((friend) => {
                      const friendMessages = allMessages.filter(
                        (m) => user && ((m.sender_id === user.id && m.receiver_id === friend.id) || (m.sender_id === friend.id && m.receiver_id === user.id))
                      );
                      const lastMessage = friendMessages[friendMessages.length - 1];

                      return (
                        <div
                          key={friend.id}
                          onClick={() => setSelectedBuddyChat(friend)}
                          className="bg-neutral-950 hover:bg-neutral-900/80 p-3 rounded-2xl border border-neutral-800/80 flex items-center justify-between cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img src={friend.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-700" />
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-neutral-950 rounded-full" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-xs text-white">{friend.name}</h3>
                                <span className="text-[10px] text-neutral-500">● {friend.club.replace('Basic-Fit ', '')}</span>
                              </div>
                              <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                                {lastMessage ? (
                                  <span>{lastMessage.sender_id === user?.id ? 'Moi : ' : ''}{lastMessage.text}</span>
                                ) : (
                                  <span className="italic text-neutral-500">Commencer la conversation...</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-neutral-500">
                              {lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {friendMessages.length > 0 && (
                              <button
                                onClick={(e) => handleDeleteConversationForBuddy(friend.id, friend.name, e)}
                                title="Supprimer la conversation"
                                className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LEADERBOARD */}
        {currentTab === 'leaderboard' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-base font-black tracking-tight">Records du club ({selectedClub})</h2>
            </div>

            <div className="space-y-2">
              {[
                { exercise: 'Développé couché', name: 'Maxime R.', weight: '145 kg', rank: '🥇' },
                { exercise: 'Squat', name: 'Julien D.', weight: '200 kg', rank: '🥇' },
                { exercise: 'Soulevé de terre', name: 'Thomas L.', weight: '230 kg', rank: '🥇' },
                { exercise: 'Tractions lestées', name: 'Romain B.', weight: '+45 kg', rank: '🥇' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                  <div>
                    <span className="text-xs font-bold text-white block">{item.exercise}</span>
                    <span className="text-[11px] text-neutral-400">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-mono text-orange-400">{item.weight}</span>
                    <span className="text-base">{item.rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE */}
        {currentTab === 'profile' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 mx-auto">
              <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-orange-400 font-bold text-2xl">
                {user.user_metadata?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>

            <div>
              <h2 className="font-extrabold text-lg leading-tight">
                {user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : user.email?.split('@')[0]}
              </h2>
              <p className="text-xs text-neutral-400">@{user.user_metadata?.username || user.email?.split('@')[0]}</p>
              <div className="inline-flex items-center gap-1 text-[11px] text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 mt-2 font-semibold">
                <MapPin className="w-3 h-3" />
                {user.user_metadata?.home_club || selectedClub}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                <span className="text-base font-black text-white block">18</span>
                <span className="text-[10px] text-neutral-400 font-medium">Séances</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                <span className="text-base font-black text-orange-500 block">{myFriendsList.length}</span>
                <span className="text-[10px] text-neutral-400 font-medium">Amis</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                <span className="text-base font-black text-amber-500 block">Top 5%</span>
                <span className="text-[10px] text-neutral-400 font-medium">Club Rang</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-red-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-neutral-800"
              >
                <LogOut className="w-4 h-4" /> Se déconnecter
              </button>
            </div>
          </div>
        )}
      </main>

      {/* LECTEUR DE STORY PLEIN ÉCRAN */}
      {activeViewingStory && activeStoryIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-fade-in select-none">
          <div className="w-full flex items-center gap-1.5 pt-2 z-20">
            {friendStoriesList.map((_, idx) => (
              <div key={idx} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                <div
                  className="h-full bg-white transition-all ease-linear"
                  style={{
                    width:
                      idx < activeStoryIndex
                        ? '100%'
                        : idx === activeStoryIndex
                        ? `${storyProgress}%`
                        : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 z-20">
            <div className="flex items-center gap-2.5">
              <img
                src={activeViewingStory.avatar_url}
                alt=""
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
              />
              <div>
                <h4 className="font-bold text-xs text-white leading-tight">{activeViewingStory.username}</h4>
                <span className="text-[10px] text-neutral-400">
                  {activeViewingStory.club_name ? `${activeViewingStory.club_name.replace('Basic-Fit ', '')} • ` : ''}
                  {new Date(activeViewingStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveStoryIndex(null);
                setIsStoryPaused(false);
              }}
              className="p-2 bg-black/60 backdrop-blur-md rounded-full text-neutral-300 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute inset-0 z-10 flex" style={{ bottom: '90px' }}>
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrevStory} />
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNextStory} />
          </div>

          <div className="flex-1 flex items-center justify-center py-4 z-0 pointer-events-none">
            <img
              src={activeViewingStory.image_url}
              alt="Story"
              className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-neutral-800"
            />
          </div>

          {activeViewingStory.caption && (
            <div className="bg-neutral-950/80 backdrop-blur-lg px-3.5 py-2 rounded-xl border border-neutral-800/80 text-center mb-2 z-20">
              <p className="text-xs text-neutral-100 font-medium">{activeViewingStory.caption}</p>
            </div>
          )}

          <div className="z-30 space-y-2">
            <div className="flex justify-center gap-4 py-1">
              {['🔥', '💪', '👏', '❤️'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendStoryComment(undefined, emoji)}
                  className="text-xl hover:scale-125 transition transform active:scale-95 bg-neutral-900/80 p-1.5 rounded-full border border-neutral-800"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <form
                onSubmit={(e) => handleSendStoryComment(e)}
                className="flex-1 flex items-center bg-neutral-900/90 border border-neutral-800 rounded-2xl px-3 py-1.5 backdrop-blur-md"
              >
                <input
                  type="text"
                  placeholder={`Répondre à ${activeViewingStory.username.split(' ')[0]}...`}
                  value={storyCommentInput}
                  onFocus={() => setIsStoryPaused(true)}
                  onBlur={() => !storyCommentInput && setIsStoryPaused(false)}
                  onChange={(e) => setStoryCommentInput(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
                {storyCommentInput.trim() && (
                  <button type="submit" className="text-orange-400 hover:text-orange-300 p-1 transition">
                    <SendHorizontal className="w-4 h-4" />
                  </button>
                )}
              </form>

              <button
                onClick={() => handleToggleStoryLike(activeViewingStory.id)}
                className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-white hover:text-red-400 backdrop-blur-md transition flex items-center justify-center"
              >
                <Heart
                  className={`w-5 h-5 transition ${
                    likedStories[activeViewingStory.id] ? 'fill-red-500 text-red-500 scale-110' : 'text-white'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : PUBLIER UNE STORY */}
      {isCreatingStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" /> Ajouter à ma story (24h)
              </h3>
              <button onClick={() => setIsCreatingStory(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishStory} className="space-y-3.5">
              <input
                type="file"
                accept="image/*"
                ref={storyFileInputRef}
                onChange={handleStoryImageSelect}
                className="hidden"
              />

              {storyImagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 h-56 flex items-center justify-center">
                  <img src={storyImagePreview} alt="" className="max-h-full max-w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setStoryImageFile(null);
                      setStoryImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/80 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => storyFileInputRef.current?.click()}
                  className="w-full py-10 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-orange-400 bg-neutral-950 transition"
                >
                  <Camera className="w-7 h-7" />
                  <span className="text-xs font-semibold">Prendre ou importer une photo</span>
                </button>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Texte / Humeur</label>
                <input
                  type="text"
                  placeholder="Ex: Prêt pour la séance de ce soir ! 🔥"
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={storyUploading || !storyImageFile}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 text-xs"
              >
                {storyUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Partager ma story (24h)"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMMENTS DRAWER */}
      {activeCommentPostId && activePostForComments && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Commentaires ({activePostForComments.comments?.length || 0})</h3>
              <button onClick={() => setActiveCommentPostId(null)} className="p-1 rounded-full text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {(activePostForComments.comments || []).map((comm) => (
                <div key={comm.id} className="flex items-start gap-2.5">
                  <img src={comm.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <div className="bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800 flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-xs text-white">{comm.username}</span>
                      <span className="text-[9px] text-neutral-500">{comm.created_at}</span>
                    </div>
                    <p className="text-xs text-neutral-300">{comm.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(activePostForComments.id)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => handleAddComment(activePostForComments.id)}
                className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/80 px-4 py-2 flex justify-around items-center">
        <button
          onClick={() => setCurrentTab('feed')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'feed' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Accueil</span>
        </button>

        <button
          onClick={() => setCurrentTab('buddy')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'buddy' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Buddy</span>
        </button>

        <button
          onClick={() => setCurrentTab('workout')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'workout' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center -mt-2.5 shadow-lg shadow-orange-600/30">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Séance</span>
        </button>

        <button
          onClick={() => setCurrentTab('chat')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {friendRequestsList.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full" />}
          </div>
          <span className="text-[10px]">Chat</span>
        </button>

        <button
          onClick={() => setCurrentTab('leaderboard')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'leaderboard' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Records</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center gap-1 transition ${
            currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profil</span>
        </button>
      </nav>
    </div>
  );
}

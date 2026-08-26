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
  Sparkles,
  SwitchCamera,
  FolderOpen,
  Box
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
  { name: 'Basic-Fit Tournai (Bastion)', address: 'Chaussée de Lille 322', city: 'Tournai', zip: '7500', lat: 50.6095, lng: 3.3762 },
  { name: 'Basic-Fit Tournai (Froyennes)', address: 'Boulevard des Déportés 30', city: 'Tournai', zip: '7500', lat: 50.6051, lng: 3.3934 },
  { name: 'Basic-Fit Mouscron', address: 'Rue de Menin 435', city: 'Mouscron', zip: '7700', lat: 50.7423, lng: 3.2091 },
  { name: 'Basic-Fit Mons', address: 'Chaussée de Binche 113', city: 'Mons', zip: '7000', lat: 50.4542, lng: 3.9658 },
  { name: 'Basic-Fit La Louvière', address: 'Rue de Bouvy 50', city: 'La Louvière', zip: '7100', lat: 50.4812, lng: 4.1905 },
  { name: 'Basic-Fit Charleroi (Ville 2)', address: 'Rue de Couillet 31', city: 'Charleroi', zip: '6000', lat: 50.4131, lng: 4.4447 },
  { name: 'Basic-Fit Waterloo', address: 'Chaussée de Bruxelles 254', city: 'Waterloo', zip: '1410', lat: 50.7224, lng: 4.3981 },
  { name: 'Basic-Fit Wavre', address: 'Chaussée de Louvain 20', city: 'Wavre', zip: '1300', lat: 50.7183, lng: 4.6072 },
  { name: 'Basic-Fit Namur (Bouge)', address: 'Chaussée de Louvain 445', city: 'Bouge (Namur)', zip: '5004', lat: 50.4735, lng: 4.8712 },
  { name: 'Basic-Fit Liège (Saint-Lambert)', address: 'Place Saint-Lambert 32', city: 'Liège', zip: '4000', lat: 50.6452, lng: 5.5734 },
  { name: 'Basic-Fit Liège (Ans)', address: 'Chaussée du Roi Albert 7/13', city: 'Ans', zip: '4430', lat: 50.6548, lng: 5.5291 },
  { name: 'Basic-Fit Arlon (Hydrion)', address: "Parc Commercial de l'Hydrion 31b", city: 'Arlon', zip: '6700', lat: 49.6841, lng: 5.8173 }
];

const isMatchingClub = (postClubName?: string, selectedClubName?: string): boolean => {
  if (!postClubName || !selectedClubName) return false;
  if (postClubName === selectedClubName) return true;
  const normalize = (str: string) => str.toLowerCase().replace(/basic-fit\s*/gi, '').replace(/[()]/g, '').trim();
  const p = normalize(postClubName);
  const s = normalize(selectedClubName);
  return p === s || p.includes(s) || s.includes(p);
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
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
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

interface RealUser {
  id: string;
  username: string;
  email: string;
  gender?: 'M' | 'F';
  goal?: string;
  home_club: string;
  avatar_url: string;
}

interface DBMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

const DEFAULT_MEMBERS: RealUser[] = [
  { id: 'b1', username: 'Thomas D.', email: 'thomas@fitpulse.be', gender: 'M', goal: 'Prise de masse & Force', home_club: 'Basic-Fit Tournai (Bastion)', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'b2', username: 'Sarah L.', email: 'sarah@fitpulse.be', gender: 'F', goal: 'Cardio & HIIT', home_club: 'Basic-Fit Tournai (Bastion)', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'b3', username: 'Élodie M.', email: 'elodie@fitpulse.be', gender: 'F', goal: 'Remise en forme', home_club: 'Basic-Fit Tournai (Froyennes)', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'b4', username: 'Maxime V.', email: 'maxime@fitpulse.be', gender: 'M', goal: 'Prise de masse & Force', home_club: 'Basic-Fit Mouscron', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
];

const DEFAULT_STORIES: Story[] = [
  {
    id: 'demo-s1',
    user_id: 'b1',
    username: 'Thomas D.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
    caption: 'Prêt pour exploser le PR au dev couché 🔥',
    club_name: 'Basic-Fit Tournai (Bastion)',
    likes_count: 3,
    created_at: new Date().toISOString()
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
    created_at: new Date().toISOString()
  }
];

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Auth & Navigation
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

  const [clubsList, setClubsList] = useState<ClubLocation[]>(CLUBS_DATABASE);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clubSearchQuery, setClubSearchQuery] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'workout' | 'chat' | 'leaderboard' | 'profile'>('feed');
  const [selectedClub, setSelectedClub] = useState<string>('Basic-Fit Tournai (Bastion)');

  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const [active3DExercise, setActive3DExercise] = useState<string | null>(null);

  // Membres et Amis & Filtres d'objectifs
  const [registeredUsers, setRegisteredUsers] = useState<RealUser[]>(DEFAULT_MEMBERS);
  const [friendIds, setFriendIds] = useState<string[]>(['b1', 'b2']);
  const [buddyTabSubMode, setBuddyTabSubMode] = useState<'discover' | 'my_friends'>('discover');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filterWomenOnly, setFilterWomenOnly] = useState(false);
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('all');

  // Stories
  const [cloudStories, setCloudStories] = useState<Story[]>(DEFAULT_STORIES);
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

  // Workout
  const [workoutType, setWorkoutType] = useState('Musculation (Push)');
  const [workoutCaption, setWorkoutCaption] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [workoutCalories, setWorkoutCalories] = useState(450);
  const [taggedPartner, setTaggedPartner] = useState<string>('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [imageZoom, setImageZoom] = useState(1);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });

  const [workoutExercises, setWorkoutExercises] = useState<ExerciseEntry[]>([
    { name: 'Développé couché', sets: 4, reps: 10, weight: 80 }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Caméra
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'post' | 'story'>('post');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Rest Timer
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [selectedBuddyChat, setSelectedBuddyChat] = useState<RealUser | null>(null);
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser?.user_metadata?.home_club) setSelectedClub(activeUser.user_metadata.home_club);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser?.user_metadata?.home_club) setSelectedClub(activeUser.user_metadata.home_club);
    });

    fetchCloudPosts();
    fetchDirectMessages();
    fetchCloudStories();
    fetchRealUsers();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        setAllMessages((prev) => [...prev, payload.new as DBMessage]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'direct_messages' }, (payload) => {
        setAllMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, (payload) => {
        setCloudStories((prev) => [payload.new as Story, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedBuddyChat]);

  const fetchCloudPosts = async () => {
    setFeedLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setFeedLoading(false);
  };

  const fetchCloudStories = async () => {
    try {
      const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setCloudStories((prev) => [...data as Story[], ...prev]);
      }
    } catch (err) {}
  };

  const fetchDirectMessages = async () => {
    const { data, error } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
    if (!error && data) setAllMessages(data as DBMessage[]);
  };

  const fetchRealUsers = async () => {
    const { data, error } = await supabase.from('posts').select('user_id, username, club_name, avatar_url').limit(50);
    if (!error && data) {
      const uniqueMap = new Map();
      DEFAULT_MEMBERS.forEach((m) => uniqueMap.set(m.id, m));
      data.forEach((p) => {
        if (p.user_id !== user?.id && !uniqueMap.has(p.user_id)) {
          uniqueMap.set(p.user_id, {
            id: p.user_id,
            username: p.username,
            email: `${p.username}@fitpulse.be`,
            gender: 'M',
            goal: 'Prise de masse & Force',
            home_club: p.club_name || selectedClub,
            avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          });
        }
      });
      setRegisteredUsers(Array.from(uniqueMap.values()));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostImageFile(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStoryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStoryImageFile(file);
      setStoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessageInput.trim() || !selectedBuddyChat || !user) return;
    const text = currentMessageInput.trim();
    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
    
    const newMessage = {
      sender_id: user.id,
      receiver_id: selectedBuddyChat.id,
      sender_name: myName,
      text: text
    };

    const { data, error } = await supabase.from('direct_messages').insert([newMessage]).select();
    if (!error && data) {
      setAllMessages((prev) => [...prev, data[0] as DBMessage]);
      setCurrentMessageInput('');
    }
  };

  const handleToggleLike = async (postId: string) => {
    const isLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newCount = isLiked ? p.likes_count - 1 : p.likes_count + 1;
          supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
          return { ...p, likes_count: newCount };
        }
        return p;
      })
    );
  };

  const combinedAllStories = [...cloudStories, ...DEFAULT_STORIES];
  const myFriendsList = registeredUsers.filter((u) => friendIds.includes(u.id));
  const myFriendUsernames = myFriendsList.map((f) => f.username);

  const friendStoriesList = combinedAllStories.filter((s) => {
    const storyDate = new Date(s.created_at).getTime();
    const isUnder24h = !isNaN(storyDate) ? storyDate >= Date.now() - 24 * 3600 * 1000 : true;
    return isUnder24h;
  });

  useEffect(() => {
    if (activeStoryIndex === null || isStoryPaused) return;

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
      await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: story.user_id, sender_name: myName, text: `❤️ A aimé ta story !` }]);
    }
  };

  const handleSendStoryComment = async (e?: React.FormEvent, quickEmoji?: string) => {
    if (e) e.preventDefault();
    const textToSend = quickEmoji || storyCommentInput.trim();
    if (!textToSend || activeStoryIndex === null || !user) return;
    const story = friendStoriesList[activeStoryIndex];
    if (!story) return;
    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
    await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: story.user_id, sender_name: myName, text: `📸 En réponse à ta story : "${textToSend}"` }]);
    setStoryCommentInput('');
    setIsStoryPaused(false);
    alert('Réponse envoyée en message direct !');
  };

  const startCamera = async (target: 'post' | 'story') => {
    setCameraTarget(target);
    setIsCameraActive(true);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err: any) {
      alert("Impossible d'accéder à la caméra : " + err.message);
      setIsCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const switchCameraFacing = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacing }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {}
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      if (cameraTarget === 'post') {
        setPostImageFile(file);
        setPostImagePreview(previewUrl);
      } else {
        setStoryImageFile(file);
        setStoryImagePreview(previewUrl);
        setIsCreatingStory(true);
      }
      stopCameraStream();
    }, 'image/jpeg', 0.85);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, username: username || `${firstName}_${lastName}`.toLowerCase(), age: Number(age) || 25, gender, level, home_club: homeClub } }
      });
      if (error) alert("Erreur d'inscription : " + error.message);
      else setSelectedClub(homeClub);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Erreur de connexion : " + error.message);
    }
    setAuthLoading(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Supprimer cette publication ?")) return;
    await supabase.from('posts').delete().eq('id', postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleDeleteConversationForBuddy = async (buddyId: string, buddyName: string) => {
    if (!user) return;
    if (!window.confirm(`Effacer toute la conversation avec ${buddyName} ?`)) return;

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

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !storyImageFile) return;
    setStoryUploading(true);
    let uploadedStoryUrl = storyImagePreview || '';
    try {
      const compressedBlob = await compressImage(storyImageFile, 800, 0.7);
      const fileName = `story-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { data: uploadData } = await supabase.storage.from('posts').upload(fileName, compressedBlob, { contentType: 'image/jpeg' });
      if (uploadData) {
        const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
        uploadedStoryUrl = publicUrlData.publicUrl;
      }
    } catch (err) {}

    const myName = user.user_metadata?.first_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Moi';
    const newStory: Story = {
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
    await supabase.from('stories').insert([{ user_id: user.id, username: myName, avatar_url: newStory.avatar_url, image_url: uploadedStoryUrl, caption: storyCaption, club_name: selectedClub }]);
    setCloudStories([newStory, ...cloudStories]);
    setStoryImageFile(null);
    setStoryImagePreview(null);
    setStoryCaption('');
    setIsCreatingStory(false);
    setStoryUploading(false);
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
        const { data: uploadData } = await supabase.storage.from('posts').upload(fileName, compressedBlob, { contentType: 'image/jpeg' });
        if (uploadData) {
          const { data: publicUrlData } = supabase.storage.from('posts').getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      } catch (err) {}
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
    const { data } = await supabase.posts.insert([newPostData]).select('*');
    if (data && data.length > 0) {
      setPosts([data[0] as Post, ...posts]);
      setWorkoutCaption('');
      setTaggedPartner('');
      setPostImageFile(null);
      setPostImagePreview(null);
      setWorkoutExercises([{ name: '', sets: 3, reps: 10, weight: 20 }]);
      setCurrentTab('feed');
    }
    setIsUploading(false);
  };

  // FILTRAGE BUDDY PAR OBJECTIF, GENRE ET RECHERCHE PSEUDO
  const filteredBuddies = registeredUsers.filter((u) => {
    if (buddyTabSubMode === 'my_friends' && !friendIds.includes(u.id)) return false;
    if (filterWomenOnly && u.gender === 'M') return false;
    
    // Filtre par objectif d'entraînement
    if (selectedGoalFilter !== 'all' && u.goal && !u.goal.toLowerCase().includes(selectedGoalFilter.toLowerCase())) {
      return false;
    }

    // Filtre par texte de recherche
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return u.username.toLowerCase().includes(q) || u.home_club.toLowerCase().includes(q);
    }

    return true;
  });

  const displayedPosts = posts.filter((post) => {
    return isMatchingClub(post.club_name, selectedClub);
  });

  const currentChatMessages = allMessages.filter(
    (m) => selectedBuddyChat && user && ((m.sender_id === user.id && m.receiver_id === selectedBuddyChat.id) || (m.sender_id === selectedBuddyChat.id && m.receiver_id === user.id))
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
          <p className="text-xs text-neutral-400 text-center mb-6">{isSignUp ? 'Création de ton profil athlète' : 'Connecte-toi à ton espace'}</p>

          <form onSubmit={handleAuth} className="space-y-3.5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Prénom</label>
                    <input type="text" required placeholder="Alex" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Nom</label>
                    <input type="text" required placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Pseudo public</label>
                    <input type="text" required placeholder="Alex_Fit" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Âge</label>
                    <input type="number" required min="14" max="99" placeholder="28" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Email</label>
              <input type="email" required placeholder="alex@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Mot de passe</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500" />
            </div>
            <button type="submit" disabled={authLoading} className="w-full mt-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs">
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-xs text-neutral-400 hover:text-white mt-5 transition">
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    );
  }

  const activePostForComments = posts.find((p) => p.id === activeCommentPostId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
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
        <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} className="bg-neutral-900 border border-neutral-800 text-[11px] rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-orange-500 max-w-[170px] truncate">
          {CLUBS_DATABASE.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
        </select>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 pb-24">
        {currentTab === 'feed' && (
          <div className="space-y-4">
            {/* STORIES ROW */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-3">
              <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
                <div onClick={() => setIsCreatingStory(true)} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
                  <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-orange-500/50 flex items-center justify-center p-0.5 group-hover:border-orange-500 transition">
                    <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-orange-400 font-bold text-lg">+</div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white border-2 border-neutral-950 shadow-md">
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-300">Ta story</span>
                </div>

                {friendStoriesList.map((story, index) => {
                  const isViewed = viewedStoryIds.includes(story.id);
                  return (
                    <div key={story.id} onClick={() => { setActiveStoryIndex(index); setStoryProgress(0); setIsStoryPaused(false); }} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
                      {isViewed ? (
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-600 p-[2px] opacity-70 hover:opacity-100 transition">
                          <div className="w-full h-full bg-neutral-950 rounded-full p-[1px]">
                            <img src={story.avatar_url} alt="" className="w-full h-full rounded-full object-cover grayscale-[30%]" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 via-pink-500 to-amber-400 p-[2.5px] shadow-sm hover:scale-105 transition transform">
                          <div className="w-full h-full bg-neutral-950 rounded-full p-[2px]">
                            <img src={story.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          </div>
                        </div>
                      )}
                      <span className={`text-[10px] font-medium truncate max-w-[64px] text-center ${isViewed ? 'text-neutral-500' : 'text-neutral-200'}`}>
                        {story.username.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Posts Feed */}
            {feedLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : displayedPosts.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs bg-neutral-900/50 rounded-3xl border border-neutral-800/60 p-6">Aucune publication pour l'instant dans ce club.</div>
            ) : (
              displayedPosts.map((post) => (
                <article key={post.id} className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-sm overflow-hidden relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={post.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                      <div>
                        <h3 className="font-bold text-sm leading-snug">{post.username}</h3>
                        <div className="flex items-center gap-1 text-[11px] text-orange-400 font-medium">
                          <MapPin className="w-3 h-3" />{post.club_name}
                        </div>
                      </div>
                    </div>
                    {post.user_id === user.id && (
                      <button onClick={() => handleDeletePost(post.id)} className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-72 w-full relative flex items-center justify-center">
                      <img src={post.image_url} alt="" className="max-h-full max-w-full object-contain pointer-events-none" />
                    </div>
                  )}
                  {post.caption && <p className="text-xs text-neutral-200 leading-relaxed">{post.caption}</p>}

                  {/* VISUALISEUR 3D */}
                  {post.exercises && post.exercises.length > 0 && (
                    <div className="bg-neutral-950/70 rounded-2xl p-3 border border-neutral-800/60 space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Exercices & Vue 3D Anatomique</span>
                      {post.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-neutral-900 last:border-none">
                          <span className="font-medium text-neutral-300">{ex.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-orange-400 font-semibold">{ex.sets} × {ex.reps}</span>
                            <button onClick={() => setActive3DExercise(ex.name)} className="p-1 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-lg flex items-center gap-1 text-[10px] transition">
                              <Box className="w-3 h-3" /> Voir 3D
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-neutral-400 text-xs">
                    <button onClick={() => handleToggleLike(post.id)} className={`flex items-center gap-1.5 ${likedPosts[post.id] ? 'text-red-500' : ''}`}><Heart className="w-4 h-4" /><span>{post.likes_count}</span></button>
                    <button onClick={() => setActiveCommentPostId(post.id)} className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /><span>{post.comments_count || 0}</span></button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {currentTab === 'workout' && (
          <form onSubmit={handlePublishWorkout} className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-black tracking-tight">Enregistrer une séance</h2>
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => startCamera('post')} className="py-6 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-orange-400 bg-neutral-950 transition">
                  <Camera className="w-6 h-6 text-orange-500" /><span className="text-xs font-semibold">Prendre photo</span>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="py-6 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-orange-400 bg-neutral-950 transition">
                  <FolderOpen className="w-6 h-6 text-neutral-400" /><span className="text-xs font-semibold">Galerie</span>
                </button>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              {postImagePreview && (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-700 h-48 flex items-center justify-center bg-neutral-950">
                  <img src={postImagePreview} alt="" className="max-h-full object-contain" />
                  <button type="button" onClick={() => setPostImagePreview(null)} className="absolute top-2 right-2 p-1 bg-black/80 text-white rounded-full"><X className="w-4 h-4" /></button>
                </div>
              )}
              <textarea rows={2} placeholder="Description de la séance..." value={workoutCaption} onChange={(e) => setWorkoutCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500" />
              <button type="submit" disabled={isUploading} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Partager ma séance'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BUDDY - RECHERCHE & FILTRES PAR OBJECTIF */}
        {currentTab === 'buddy' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black tracking-tight">Réseau & Athlètes</h2>
                <span className="text-[10px] text-orange-400 font-semibold">{selectedClub}</span>
              </div>
              <button
                onClick={() => setFilterWomenOnly(!filterWomenOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  filterWomenOnly
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white ring-2 ring-pink-400 shadow-md'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>🚺</span> Entre femmes {filterWomenOnly && '✓'}
              </button>
            </div>
            
            <div className="bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 flex items-center gap-1">
              <button
                onClick={() => setBuddyTabSubMode('discover')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${buddyTabSubMode === 'discover' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                Découvrir
              </button>
              <button
                onClick={() => setBuddyTabSubMode('my_friends')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${buddyTabSubMode === 'my_friends' ? 'bg-orange-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                Mes Amis ({myFriendsList.length})
              </button>
            </div>

            {/* FILTRES PAR OBJECTIF (Cardio, Prise de masse, Remise en forme) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-400 block">Filtrer par objectif :</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { label: 'Tous', value: 'all' },
                  { label: '💪 Prise de masse', value: 'masse' },
                  { label: '🔥 Cardio & HIIT', value: 'cardio' },
                  { label: '🧘 Remise en forme', value: 'remise' }
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setSelectedGoalFilter(goal.value)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition border ${
                      selectedGoalFilter === goal.value
                        ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CHAMP DE RECHERCHE PRINCIPAL */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-orange-500" />
              <input
                type="text"
                placeholder="Rechercher par pseudo..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:border-orange-500 shadow-inner"
              />
            </div>

            <div className="space-y-3 pt-1">
              {filteredBuddies.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Aucun athlète ne correspond à vos critères.
                </div>
              ) : (
                filteredBuddies.map((realUser) => {
                  const isFriend = friendIds.includes(realUser.id);
                  return (
                    <div key={realUser.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={realUser.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
                        <div>
                          <h3 className="font-bold text-sm text-white">{realUser.username}</h3>
                          <span className="text-[11px] text-orange-400 font-medium block">● {realUser.home_club}</span>
                          {realUser.goal && <span className="text-[10px] text-neutral-400 italic">🎯 {realUser.goal}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isFriend) {
                              setFriendIds(friendIds.filter(id => id !== realUser.id));
                            } else {
                              setFriendIds([...friendIds, realUser.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            isFriend ? 'bg-neutral-900 border border-neutral-700 text-green-400' : 'bg-orange-600 text-white'
                          }`}
                        >
                          {isFriend ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                          {isFriend ? 'Ami' : 'Ajouter'}
                        </button>
                        <button onClick={() => { setSelectedBuddyChat(realUser); setCurrentTab('chat'); }} className="p-2 bg-neutral-900 border border-neutral-800 hover:border-orange-500 text-neutral-200 rounded-xl">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CHAT */}
        {currentTab === 'chat' && (
          <div className="space-y-4">
            {selectedBuddyChat ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[74vh]">
                <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                  <button onClick={() => setSelectedBuddyChat(null)} className="p-1 text-neutral-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                  <h3 className="font-bold text-xs text-white">{selectedBuddyChat.username}</h3>
                  <button onClick={() => handleDeleteConversationForBuddy(selectedBuddyChat.id, selectedBuddyChat.username)} className="p-1.5 text-neutral-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {currentChatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${msg.sender_id === user?.id ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
                  <input type="text" placeholder="Écrire un message..." value={currentMessageInput} onChange={(e) => setCurrentMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" />
                  <button onClick={() => handleSendMessage()} className="p-2.5 bg-orange-600 text-white rounded-xl"><SendHorizontal className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black tracking-tight">Messagerie</h2>
                  <span className="text-[10px] text-neutral-500">Conversations avec tes amis 💬</span>
                </div>
                {myFriendsList.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    Aucun ami dans ton réseau. Va dans l'onglet **Buddy** pour ajouter des athlètes !
                  </div>
                ) : (
                  myFriendsList.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedBuddyChat(friend)}
                      className="p-3.5 bg-neutral-950 hover:bg-neutral-900/80 rounded-2xl border border-neutral-800 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-800" />
                        <div>
                          <h3 className="font-bold text-xs text-white">{friend.username}</h3>
                          <span className="text-[10px] text-neutral-500">{friend.home_club}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversationForBuddy(friend.id, friend.username);
                        }}
                        title="Effacer la conversation"
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
            <h2 className="text-base font-black tracking-tight flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Records du club</h2>
            {[
              { exercise: 'Développé couché', name: 'Maxime R.', weight: '145 kg', rank: '🥇' },
              { exercise: 'Squat', name: 'Julien D.', weight: '200 kg', rank: '🥇' },
              { exercise: 'Soulevé de terre', name: 'Thomas L.', weight: '230 kg', rank: '🥇' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                <div><span className="text-xs font-bold text-white block">{item.exercise}</span><span className="text-[11px] text-neutral-400">{item.name}</span></div>
                <div className="flex items-center gap-2"><span className="text-sm font-black font-mono text-orange-400">{item.weight}</span><span>{item.rank}</span></div>
              </div>
            ))}
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 mx-auto flex items-center justify-center text-white font-bold text-2xl">
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-extrabold text-lg">{user.user_metadata?.first_name || user.email?.split('@')[0]}</h2>
              <span className="text-[11px] text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">{selectedClub}</span>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-red-400 rounded-xl text-xs font-bold transition border border-neutral-800 flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </div>
        )}
      </main>

      {/* MODAL VISUALISEUR 3D */}
      {active3DExercise && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <Box className="w-5 h-5" /> Vue 3D Anatomique : {active3DExercise}
            </div>
            <button onClick={() => setActive3DExercise(null)} className="p-2 bg-neutral-800 text-white rounded-full"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 w-full flex flex-col items-center justify-center my-auto space-y-4">
            <div className="relative w-64 h-64 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-48 h-48 rounded-full border border-dashed border-orange-500" />
              </div>
              <div className="flex flex-col items-center space-y-3 z-10 animate-pulse">
                <div className="w-20 h-28 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl shadow-lg flex items-center justify-center text-white font-black text-xl border border-orange-400">
                  3D
                </div>
                <span className="text-xs font-bold text-neutral-300">Ciblage : {active3DExercise}</span>
              </div>
            </div>
            <span className="text-[11px] text-neutral-400 bg-neutral-900 px-4 py-1.5 rounded-full border border-neutral-800">
              Modélisation 3D interactive des fibres musculaires en temps réel
            </span>
          </div>
        </div>
      )}

      {/* MODAL CAMÉRA */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center p-4">
          <div className="w-full flex items-center justify-between z-10 pt-2">
            <span className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full border border-neutral-800">Caméra en direct</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={switchCameraFacing} className="p-2.5 bg-black/60 rounded-full text-white"><SwitchCamera className="w-5 h-5" /></button>
              <button type="button" onClick={stopCameraStream} className="p-2.5 bg-black/60 rounded-full text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="relative w-full flex-1 max-w-sm my-auto rounded-3xl overflow-hidden bg-neutral-950 flex items-center justify-center border border-neutral-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="w-full flex justify-center items-center pb-6 z-10">
            <button type="button" onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1">
              <div className="w-full h-full bg-orange-500 rounded-full shadow-lg" />
            </button>
          </div>
        </div>
      )}

      {/* LECTEUR DE STORY */}
      {activeViewingStory && activeStoryIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none">
          <div className="w-full flex items-center gap-1.5 pt-2 z-20">
            {friendStoriesList.map((_, idx) => (
              <div key={idx} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                <div className="h-full bg-white transition-all ease-linear" style={{ width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? `${storyProgress}%` : '0%' }} />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 z-20">
            <div className="flex items-center gap-2.5">
              <img src={activeViewingStory.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" />
              <div>
                <h4 className="font-bold text-xs text-white">{activeViewingStory.username}</h4>
                <span className="text-[10px] text-neutral-400">{activeViewingStory.club_name}</span>
              </div>
            </div>
            <button onClick={() => { setActiveStoryIndex(null); setIsStoryPaused(false); }} className="p-2 bg-black/60 rounded-full text-white"><X className="w-6 h-6" /></button>
          </div>

          <div className="absolute inset-0 z-10 flex" style={{ bottom: '90px' }}>
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrevStory} />
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNextStory} />
          </div>

          <div className="flex-1 flex items-center justify-center py-4 z-0 pointer-events-none">
            <img src={activeViewingStory.image_url} alt="" className="max-h-[60vh] max-w-full rounded-2xl object-contain border border-neutral-800" />
          </div>

          {activeViewingStory.caption && (
            <div className="bg-neutral-950/80 backdrop-blur-lg px-3.5 py-2 rounded-xl border border-neutral-800 text-center mb-2 z-20">
              <p className="text-xs text-neutral-100 font-medium">{activeViewingStory.caption}</p>
            </div>
          )}

          <div className="z-30 space-y-2">
            <div className="flex justify-center gap-4 py-1">
              {['🔥', '💪', '👏', '❤️'].map((emoji) => (
                <button key={emoji} onClick={() => handleSendStoryComment(undefined, emoji)} className="text-xl bg-neutral-900/80 p-1.5 rounded-full border border-neutral-800">{emoji}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={(e) => handleSendStoryComment(e)} className="flex-1 flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl px-3 py-1.5">
                <input type="text" placeholder="Répondre..." value={storyCommentInput} onFocus={() => setIsStoryPaused(true)} onBlur={() => !storyCommentInput && setIsStoryPaused(false)} onChange={(e) => setStoryCommentInput(e.target.value)} className="flex-1 bg-transparent text-xs text-white focus:outline-none" />
                {storyCommentInput.trim() && <button type="submit" className="text-orange-400 p-1"><SendHorizontal className="w-4 h-4" /></button>}
              </form>
              <button onClick={() => handleToggleStoryLike(activeViewingStory.id)} className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-white">
                <Heart className={`w-5 h-5 ${likedStories[activeViewingStory.id] ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PUBLIER STORY */}
      {isCreatingStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-500" /> Ajouter à ma story (24h)</h3>
              <button onClick={() => setIsCreatingStory(false)} className="p-1 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePublishStory} className="space-y-3.5">
              <input type="file" accept="image/*" ref={storyFileInputRef} onChange={handleStoryImageSelect} className="hidden" />
              {storyImagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 h-56 flex items-center justify-center">
                  <img src={storyImagePreview} alt="" className="max-h-full object-contain" />
                  <button type="button" onClick={() => setStoryImagePreview(null)} className="absolute top-2 right-2 p-1 bg-black/80 text-white rounded-full"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => startCamera('story')} className="py-8 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-950 transition">
                    <Camera className="w-6 h-6 text-orange-500" /><span className="text-xs font-semibold">Prendre photo</span>
                  </button>
                  <button type="button" onClick={() => storyFileInputRef.current?.click()} className="py-8 border-2 border-dashed border-neutral-800 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 bg-neutral-950 transition">
                    <FolderOpen className="w-6 h-6" /><span className="text-xs font-semibold">Galerie</span>
                  </button>
                </div>
              )}
              <input type="text" placeholder="Légende de la story..." value={storyCaption} onChange={(e) => setStoryCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" />
              <button type="submit" disabled={storyUploading || !storyImageFile} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs">
                {storyUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Partager ma story"}
              </button>
            </form>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/80 px-4 py-2 flex justify-around items-center">
        <button onClick={() => setCurrentTab('feed')} className={`flex flex-col items-center gap-1 ${currentTab === 'feed' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Home className="w-5 h-5" /><span className="text-[10px]">Accueil</span></button>
        <button onClick={() => setCurrentTab('buddy')} className={`flex flex-col items-center gap-1 ${currentTab === 'buddy' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Users className="w-5 h-5" /><span className="text-[10px]">Buddy</span></button>
        <button onClick={() => setCurrentTab('workout')} className={`flex flex-col items-center gap-1 ${currentTab === 'workout' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}>
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center -mt-2.5 shadow-lg"><Plus className="w-5 h-5" /></div>
          <span className="text-[10px]">Séance</span>
        </button>
        <button onClick={() => setCurrentTab('chat')} className={`flex flex-col items-center gap-1 ${currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><MessageCircle className="w-5 h-5" /><span className="text-[10px]">Chat</span></button>
        <button onClick={() => setCurrentTab('leaderboard')} className={`flex flex-col items-center gap-1 ${currentTab === 'leaderboard' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Trophy className="w-5 h-5" /><span className="text-[10px]">Records</span></button>
        <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center gap-1 ${currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><User className="w-5 h-5" /><span className="text-[10px]">Profil</span></button>
      </nav>
    </div>
  );
}

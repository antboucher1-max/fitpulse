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
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Compression d'image haute performance
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

interface DirectMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation
  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'workout' | 'chat' | 'leaderboard' | 'profile'>('feed');
  const [selectedClub, setSelectedClub] = useState<string>('Basic-Fit Tournai');

  // Posts Feed & Likes
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Comments Drawer State
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Workout & Photo Form State
  const [workoutType, setWorkoutType] = useState('Musculation (Push)');
  const [workoutCaption, setWorkoutCaption] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [workoutCalories, setWorkoutCalories] = useState(450);
  const [taggedPartner, setTaggedPartner] = useState<string>('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Image Framing State (Zoom & Pan)
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [workoutExercises, setWorkoutExercises] = useState<ExerciseEntry[]>([
    { name: 'Développé couché', sets: 4, reps: 10, weight: 80 }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(90);

  // Buddy Finder State & Filters
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
      club: 'Basic-Fit Tournai'
    },
    {
      id: 'b2',
      name: 'Sarah L.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      level: 'Intermédiaire',
      schedule: 'Mardi & Jeudi (12h-13h30)',
      goal: 'Cardio, HIIT & Tonification',
      club: 'Basic-Fit Tournai'
    },
    {
      id: 'b3',
      name: 'Élodie M.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 'Débutant',
      schedule: 'Mercredi & Samedi matin',
      goal: 'Remise en forme & Fessiers',
      club: 'Basic-Fit Tournai'
    },
    {
      id: 'b4',
      name: 'Maxime V.',
      gender: 'M',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      level: 'Avancé',
      schedule: 'Samedi & Dimanche matin',
      goal: 'Powerlifting (Squat / Dev couché)',
      club: 'Basic-Fit Froyennes'
    },
    {
      id: 'b5',
      name: 'Camille R.',
      gender: 'F',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      level: 'Intermédiaire',
      schedule: 'Tous les soirs (17h30-19h)',
      goal: 'Prise de masse & Musculation',
      club: 'Basic-Fit Froyennes'
    }
  ];

  // Chat State
  const [selectedBuddyChat, setSelectedBuddyChat] = useState<Buddy>(buddiesList[0]);
  const [messages, setMessages] = useState<Record<string, DirectMessage[]>>({
    b1: [
      { id: '1', sender: 'Thomas D.', text: 'Salut ! Tu t’entraînes aujourd’hui à Tournai ?', time: '10:15', isMe: false },
      { id: '2', sender: 'Moi', text: 'Salut Thomas ! Oui, séance Push prévue vers 18h.', time: '10:18', isMe: true },
      { id: '3', sender: 'Thomas D.', text: 'Top, je serai sur le banc de dev couché, on tourne ensemble ?', time: '10:20', isMe: false }
    ],
    b2: [
      { id: '1', sender: 'Sarah L.', text: 'Hello ! Dispo pour une séance duo fractionné / cuisses demain midi ?', time: 'Hier', isMe: false }
    ]
  });
  const [currentMessageInput, setCurrentMessageInput] = useState('');

  // Initialisation & Chargement Cloud Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchCloudPosts();
    return () => subscription.unsubscribe();
  }, []);

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

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer cette publication ?")) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      alert("Erreur lors de la suppression.");
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username || email.split('@')[0] } }
      });
      if (error) alert(error.message);
      else alert('Compte créé avec succès !');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setAuthLoading(false);
  };

  const handleToggleLike = async (postId: string) => {
    const isLiked = likedPosts[postId];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newLikesCount = isLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1;

    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: newLikesCount } : p))
    );

    await supabase
      .from('posts')
      .update({ likes_count: newLikesCount })
      .eq('id', postId);
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

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    const updatedComments = [...(targetPost.comments || []), newComment];
    const updatedCount = (targetPost.comments_count || 0) + 1;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: updatedComments, comments_count: updatedCount } : p
      )
    );
    setCommentInput('');

    await supabase
      .from('posts')
      .update({ comments: updatedComments, comments_count: updatedCount })
      .eq('id', postId);
  };

  const handleSendMessage = () => {
    if (!currentMessageInput.trim()) return;
    const buddyId = selectedBuddyChat.id;
    const newMsg: DirectMessage = {
      id: String(Date.now()),
      sender: 'Moi',
      text: currentMessageInput,
      time: 'À l’instant',
      isMe: true
    };

    setMessages((prev) => ({
      ...prev,
      [buddyId]: [...(prev[buddyId] || []), newMsg]
    }));
    setCurrentMessageInput('');
  };

  const addExerciseRow = () => {
    setWorkoutExercises([
      ...workoutExercises,
      { name: '', sets: 3, reps: 10, weight: 20 }
    ]);
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
        const fileName = `${user.id}-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, compressedBlob, { contentType: 'image/jpeg' });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('posts')
            .getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.log("Erreur upload storage.");
      }
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

    const { data, error } = await supabase
      .from('posts')
      .insert([newPostData])
      .select('*');

    if (!error && data && data.length > 0) {
      setPosts([data[0] as Post, ...posts]);
    } else {
      // Affichage local immédiat si souci réseau
      setPosts([
        {
          ...(newPostData as any),
          id: 'post-' + Date.now(),
          created_at: "À l'instant"
        },
        ...posts
      ]);
    }

    // Réinitialisation
    setWorkoutCaption('');
    setTaggedPartner('');
    setPostImageFile(null);
    setPostImagePreview(null);
    setImageZoom(1);
    setImagePos({ x: 0, y: 0 });
    setWorkoutExercises([{ name: '', sets: 3, reps: 10, weight: 20 }]);
    setCurrentTab('feed');
    setIsUploading(false);
  };

  // Filtrage intelligent des Buddies
  const filteredBuddies = buddiesList.filter((buddy) => {
    // Filtre Club
    if (buddy.club !== selectedClub) return false;
    // Filtre Entre Femmes
    if (filterWomenOnly && buddy.gender !== 'F') return false;
    // Filtre Niveau
    if (filterLevel !== 'all' && !buddy.level.toLowerCase().includes(filterLevel.toLowerCase())) return false;
    // Filtre Objectif
    if (filterGoal !== 'all' && !buddy.goal.toLowerCase().includes(filterGoal.toLowerCase())) return false;

    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-sm bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500">
              <Zap className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center tracking-tight mb-1">FitPulse</h1>
          <p className="text-xs text-neutral-400 text-center mb-8">Le réseau social de ta salle de sport</p>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Pseudo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Antoine99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
            >
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-xs text-neutral-400 hover:text-white mt-6 transition"
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
            <span className="text-[10px] text-orange-400 font-semibold">{selectedClub}</span>
          </div>
        </div>

        <select
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-[11px] rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-orange-500"
        >
          <option value="Basic-Fit Tournai">Basic-Fit Tournai</option>
          <option value="Basic-Fit Froyennes">Basic-Fit Froyennes</option>
          <option value="Fitness Park Lille">Fitness Park Lille</option>
        </select>
      </header>

      {/* Main Screen Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 pb-24">
        {/* TAB 1: FEED */}
        {currentTab === 'feed' && (
          <div className="space-y-4">
            {/* Rest Timer Banner */}
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
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs">
                Aucune publication pour le moment. Partage ta première séance !
              </div>
            ) : (
              posts.map((post) => {
                const isLiked = likedPosts[post.id];
                const isMyPost = post.user_id === user.id || post.username === (user.user_metadata?.username || user.email?.split('@')[0]);

                return (
                  <article
                    key={post.id}
                    className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-sm overflow-hidden relative"
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm leading-snug">{post.username}</h3>
                            {post.partner_name && (
                              <span className="text-[10px] bg-neutral-800 text-orange-400 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
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

                    {/* Image Cloud */}
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

                    {/* Caption */}
                    {post.caption && (
                      <p className="text-xs text-neutral-200 leading-relaxed">{post.caption}</p>
                    )}

                    {/* Metrics Badges */}
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

                    {/* Exercises Details */}
                    {post.exercises && post.exercises.length > 0 && (
                      <div className="bg-neutral-950/70 rounded-2xl p-3 border border-neutral-800/60 space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                          Exercices enregistrés
                        </span>
                        {post.exercises.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs py-1 border-b border-neutral-900 last:border-none"
                          >
                            <span className="font-medium text-neutral-300">{ex.name}</span>
                            <span className="font-mono text-[11px] text-orange-400 font-semibold">
                              {ex.sets} × {ex.reps} {ex.weight > 0 && `@ ${ex.weight} kg`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Post Interactions */}
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

        {/* TAB 2: WORKOUT BUDDY FINDER AVEC FILTRES & ENTRE FEMMES */}
        {currentTab === 'buddy' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-black tracking-tight">Workout Buddy</h2>
                </div>
                <span className="text-[11px] text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                  {filteredBuddies.length} partenaire{filteredBuddies.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* FILTRES BUDDY */}
              <div className="space-y-2.5 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                    <Filter className="w-3.5 h-3.5 text-orange-500" />
                    <span>Filtres de recherche</span>
                  </div>

                  {/* BOUTON ENTRE FEMMES */}
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

              {/* LISTE DES BUDDIES FILTRÉE */}
              <div className="space-y-3 pt-1">
                {filteredBuddies.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    Aucun partenaire ne correspond à ces critères dans cette salle.
                  </div>
                ) : (
                  filteredBuddies.map((buddy) => (
                    <div
                      key={buddy.id}
                      className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col space-y-3 relative overflow-hidden"
                    >
                      {buddy.gender === 'F' && (
                        <div className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-bl-lg" />
                      )}

                      <div className="flex items-center justify-between">
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
                        <button
                          onClick={() => {
                            setSelectedBuddyChat(buddy);
                            setCurrentTab('chat');
                          }}
                          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Message
                        </button>
                      </div>

                      <div className="bg-neutral-900/60 rounded-xl p-2.5 text-[11px] space-y-1 text-neutral-300">
                        <div><strong className="text-neutral-400">Créneaux :</strong> {buddy.schedule}</div>
                        <div><strong className="text-neutral-400">Objectif :</strong> {buddy.goal}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOG WORKOUT AVEC CHOIX DU PARTENAIRE (TAG BUDDY) */}
        {currentTab === 'workout' && (
          <form onSubmit={handlePublishWorkout} className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-black tracking-tight">Enregistrer une séance</h2>

              {/* Tag / Partenaire de séance */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Partenaire d'entraînement (Buddy)</label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-3 w-4 h-4 text-orange-500" />
                  <select
                    value={taggedPartner}
                    onChange={(e) => setTaggedPartner(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Séance solo (Aucun partenaire)</option>
                    {buddiesList.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.club})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Box & Crop / Move Tool */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Photo de la séance</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />

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
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Exercices effectués
                </label>
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
                        <button
                          type="button"
                          onClick={() => removeExerciseRow(index)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
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
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Partager ma séance"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: DIRECT MESSAGING CHAT */}
        {currentTab === 'chat' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[70vh]">
            <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedBuddyChat.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-orange-500/30" />
                <div>
                  <h3 className="font-bold text-xs text-white">{selectedBuddyChat.name}</h3>
                  <span className="text-[10px] text-green-400 font-medium">● En ligne à {selectedBuddyChat.club}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {(messages[selectedBuddyChat.id] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                      msg.isMe
                        ? 'bg-orange-600 text-white rounded-tr-none'
                        : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-neutral-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={currentMessageInput}
                onChange={(e) => setCurrentMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </div>
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
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80"
                >
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
                {user.email?.[0].toUpperCase() || 'A'}
              </div>
            </div>

            <div>
              <h2 className="font-extrabold text-lg leading-tight">
                {user.user_metadata?.username || user.email?.split('@')[0]}
              </h2>
              <p className="text-xs text-neutral-400">{user.email}</p>
              <div className="inline-flex items-center gap-1 text-[11px] text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 mt-2 font-semibold">
                <MapPin className="w-3 h-3" />
                {selectedClub}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                <span className="text-base font-black text-white block">18</span>
                <span className="text-[10px] text-neutral-400 font-medium">Séances</span>
              </div>
              <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                <span className="text-base font-black text-orange-500 block">4.8k</span>
                <span className="text-[10px] text-neutral-400 font-medium">Tonnage (kg)</span>
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

      {/* COMMENTS MODAL / DRAWER */}
      {activeCommentPostId && activePostForComments && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Commentaires ({activePostForComments.comments?.length || 0})</h3>
              <button
                onClick={() => setActiveCommentPostId(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
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

      {/* Bottom Floating Navigation Bar */}
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
          <MessageCircle className="w-5 h-5" />
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

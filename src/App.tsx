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
  MoreHorizontal,
  Bookmark,
  MessageCircle,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  LayoutGrid,
  List,
  Award,
  LogOut,
  Lock,
  Mail,
  UserCheck,
  Camera,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Club {
  id: string;
  name: string;
  city: string;
}

interface ExerciseInput {
  name: string;
  setsReps: string;
  weight: string;
}

interface Post {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  image_url: string;
  caption: string;
  club_name: string;
  session_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  exercises?: ExerciseInput[];
}

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'profile'>('home');

  // New post form state
  const [caption, setCaption] = useState('');
  const [sessionType, setSessionType] = useState('Musculation');
  const [clubName, setClubName] = useState('Basic-Fit Tournai');
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { name: '', setsReps: '', weight: '' }
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchPosts();

    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username || email.split('@')[0] }
        }
      });
      if (error) alert(error.message);
      else alert('Compte créé avec succès !');
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const addExerciseField = () => {
    setExercises([...exercises, { name: '', setsReps: '', weight: '' }]);
  };

  const updateExercise = (index: number, field: keyof ExerciseInput, value: string) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const validExercises = exercises.filter(ex => ex.name.trim() !== '');

    const newPost = {
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'Athlète',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
      caption,
      club_name: clubName,
      session_type: sessionType,
      exercises: validExercises,
      likes_count: 0,
      comments_count: 0
    };

    const { error } = await supabase.from('posts').insert([newPost]);

    if (!error) {
      setCaption('');
      setExercises([{ name: '', setsReps: '', weight: '' }]);
      setActiveTab('home');
      fetchPosts();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 mb-4 border border-orange-500/20">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">FitPulse</h1>
          <p className="text-zinc-400 text-sm mb-8 text-center">Le réseau social connecté à ta salle de sport</p>

          <form onSubmit={handleAuth} className="w-full space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Pseudo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ton pseudo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "S'inscrire" : 'Se connecter')}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-6 text-sm text-zinc-400 hover:text-white transition"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-orange-500" />
          <span className="font-extrabold text-xl tracking-tight">FitPulse</span>
        </div>
        <button onClick={handleLogout} className="text-zinc-400 hover:text-white p-2">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucune séance partagée pour le moment.</p>
                <p className="text-sm">Sois le premier à publier !</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={post.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-orange-500/30" />
                      <div>
                        <h4 className="font-bold text-sm text-white">{post.username}</h4>
                        <div className="flex items-center text-xs text-orange-400">
                          <MapPin className="w-3 h-3 mr-1" />
                          {post.club_name}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-zinc-800 text-xs font-semibold rounded-full text-zinc-300">
                      {post.session_type}
                    </span>
                  </div>

                  {post.caption && (
                    <p className="px-4 pb-3 text-sm text-zinc-200">{post.caption}</p>
                  )}

                  {post.exercises && post.exercises.length > 0 && (
                    <div className="px-4 pb-3 space-y-1.5">
                      {post.exercises.map((ex, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-zinc-950/40 px-3 py-2 rounded-lg border border-zinc-800/40">
                          <span className="font-medium text-zinc-200">{ex.name}</span>
                          <span className="text-zinc-400">{ex.setsReps} {ex.weight && `• ${ex.weight}`}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 border-t border-zinc-800/60 flex items-center space-x-4 text-zinc-400 text-sm">
                    <button className="flex items-center space-x-1.5 hover:text-orange-500">
                      <Zap className="w-4 h-4" />
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-zinc-200">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments_count || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <form onSubmit={handleCreatePost} className="space-y-4">
            <h2 className="text-lg font-bold">Nouvelle séance</h2>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Type d'entraînement</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Musculation">Musculation (Pectoraux/Bras)</option>
                <option value="Leg Day">Leg Day</option>
                <option value="Dos & Épaules">Dos & Épaules</option>
                <option value="Cardio / HIIT">Cardio / HIIT</option>
                <option value="Full Body">Full Body</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Salle / Club</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Ex: Basic-Fit Tournai"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Description / Sensations</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ex: Nouvelle perf au développé couché !"
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Exercices</label>
              <div className="space-y-2">
                {exercises.map((ex, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Exercice"
                      value={ex.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Séries/Reps"
                      value={ex.setsReps}
                      onChange={(e) => updateExercise(index, 'setsReps', e.target.value)}
                      className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Poids"
                      value={ex.weight}
                      onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                      className="w-20 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="p-2 text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addExerciseField}
                className="mt-2 text-xs font-semibold text-orange-400 flex items-center gap-1 hover:text-orange-300"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publier la séance'}
            </button>
          </form>
        )}

        {activeTab === 'profile' && (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto border-2 border-orange-500">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{user.user_metadata?.username || 'Athlète'}</h3>
              <p className="text-sm text-zinc-400">{user.email}</p>
            </div>
            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-400 rounded-xl text-sm font-semibold transition"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-zinc-900 flex justify-around py-3">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-orange-500' : 'text-zinc-500'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Accueil</span>
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'create' ? 'text-orange-500' : 'text-zinc-500'}`}
        >
          <PlusSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Publier</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-orange-500' : 'text-zinc-500'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profil</span>
        </button>
      </nav>
    </div>
  );
}

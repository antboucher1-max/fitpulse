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
  MessageSquare,
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

interface BuddyAlert {
  id: number;
  userName: string;
  userAvatar: string;
  level: string;
  focus: string;
  time: string;
  note: string;
}

interface Post {
  id: number;
  user_name: string;
  user_avatar?: string;
  club_name: string;
  image_url: string;
  workout_badge: string;
  stats: { exercise: string; set: string; weight: string }[];
  caption: string;
  fist_bumps: number;
  created_at?: string;
}

interface CommentItem {
  id: number;
  post_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

interface ChatMessage {
  id: number;
  sender_name: string;
  content: string;
  created_at: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'club' | 'region'>('club');
  const [navTab, setNavTab] = useState<
    'feed' | 'explore' | 'records' | 'profile'
  >('feed');
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const [selectedLift, setSelectedLift] = useState<
    'bench' | 'squat' | 'deadlift'
  >('bench');
  const [profileViewMode, setProfileViewMode] = useState<'grid' | 'list'>(
    'grid'
  );

  // PRs dynamiques
  const [userPRs, setUserPRs] = useState({
    bench: 90,
    squat: 140,
    deadlift: 175,
  });

  // Commentaires
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(
    null
  );
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Chat Binôme
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Modales
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCreateBuddyModal, setShowCreateBuddyModal] = useState(false);
  const [selectedBuddyAlert, setSelectedBuddyAlert] =
    useState<BuddyAlert | null>(null);
  const [buddySuccessNotice, setBuddySuccessNotice] = useState(false);

  // Upload Photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [buddyFocus, setBuddyFocus] = useState('Dos & Biceps');
  const [buddyTime, setBuddyTime] = useState('Ce soir 18h30');
  const [buddyLevel, setBuddyLevel] = useState('Intermédiaire');
  const [buddyNote, setBuddyNote] = useState(
    'Cherche binôme motivé pour spotter et pousser lourd !'
  );

  const [buddyAlerts, setBuddyAlerts] = useState<BuddyAlert[]>([
    {
      id: 1,
      userName: 'Thomas V.',
      userAvatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      level: 'Intermédiaire',
      focus: 'Dos & Biceps',
      time: 'Ce soir 18h30',
      note: 'Séance axée tirages lourds. Besoin d’un spot régulier !',
    },
  ]);

  const [newSplit, setNewSplit] = useState('Push Day (Pecs / Triceps)');
  const [newCaption, setNewCaption] = useState('');
  const [exercisesList, setExercisesList] = useState<ExerciseInput[]>([
    { name: 'Développé Couché', setsReps: '4x8', weight: '90' },
  ]);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const leaderboardData = {
    bench: [
      {
        rank: 1,
        name: 'Alexandre K.',
        weight: '142.5 kg',
        date: 'Il y a 3j',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: true,
      },
      {
        rank: 2,
        name: 'Marc Dupont',
        weight: '130.0 kg',
        date: 'Il y a 1 sem',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        verified: true,
      },
      {
        rank: 3,
        name: 'Thomas V.',
        weight: '122.5 kg',
        date: 'Il y a 2 sem',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        verified: false,
      },
      {
        rank: 4,
        name: 'Lucas M.',
        weight: '115.0 kg',
        date: 'Hier',
        avatar:
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
        verified: true,
      },
      {
        rank: 5,
        name: 'Antoine',
        weight: '90.0 kg',
        date: 'Aujourd’hui',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        verified: true,
      },
    ],
    squat: [
      {
        rank: 1,
        name: 'Julien B.',
        weight: '190.0 kg',
        date: 'Il y a 5j',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        verified: true,
      },
      {
        rank: 2,
        name: 'Alexandre K.',
        weight: '175.0 kg',
        date: 'Il y a 2 sem',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: true,
      },
      {
        rank: 3,
        name: 'Sophie L.',
        weight: '135.0 kg',
        date: 'Il y a 4j',
        avatar:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        verified: true,
      },
    ],
    deadlift: [
      {
        rank: 1,
        name: 'David R.',
        weight: '230.0 kg',
        date: 'Il y a 1 sem',
        avatar:
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
        verified: true,
      },
      {
        rank: 2,
        name: 'Julien B.',
        weight: '215.0 kg',
        date: 'Il y a 3 sem',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        verified: true,
      },
      {
        rank: 3,
        name: 'Thomas V.',
        weight: '200.0 kg',
        date: 'Il y a 2j',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        verified: false,
      },
    ],
  };

  const stories = [
    { id: 'affluence', name: 'Affluence', isAffluence: true, status: 'Fluide' },
    {
      id: 1,
      name: 'Marc_fit',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      media:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
      tag: 'Pecs 18h',
    },
    {
      id: 2,
      name: 'Sophie.lift',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      media:
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
      tag: 'Leg Day',
    },
    {
      id: 3,
      name: 'Alex_Coach',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      media:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      tag: 'PR 120kg',
    },
  ];

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setPosts(data);
    } else {
      setPosts([
        {
          id: 101,
          user_name: 'marc_dupont',
          user_avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          club_name: currentClub?.name || 'Basic-Fit Tournai',
          image_url:
            'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
          workout_badge: 'Push Day (Pecs / Triceps)',
          stats: [
            {
              exercise: 'Développé Couché',
              set: '4 séries x 8 reps',
              weight: '90 kg',
            },
            {
              exercise: 'Développé Incliné Haltères',
              set: '3 séries x 10 reps',
              weight: '32 kg / main',
            },
          ],
          caption:
            'Séance pecs validée ! Prochaine étape : les 100 kg au couché. 🔥',
          fist_bumps: 34,
        },
      ]);
    }
  };

  const fetchProfilePRs = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) {
      setUserPRs({
        bench: Number(data.bench_pr) || 90,
        squat: Number(data.squat_pr) || 140,
        deadlift: Number(data.deadlift_pr) || 175,
      });
    }
  };

  const fetchComments = async (postId: number) => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (data) setCommentsList(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setChatMessages(data);
  };

  useEffect(() => {
    async function initSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        fetchProfilePRs(session.user.id);
      }
      setAuthLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
        if (session?.user) fetchProfilePRs(session.user.id);
      });

      return () => subscription.unsubscribe();
    }
    initSession();

    async function fetchClubs() {
      const { data } = await supabase.from('clubs').select('*');
      if (data && data.length > 0) {
        setClubs(data);
        setCurrentClub(data[0]);
      }
    }
    fetchClubs();
    fetchPosts();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { username: authUsername || 'Athlète' },
        },
      });
      if (error) setAuthError(error.message);
      else {
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            user_name: authUsername || 'Athlète',
            bench_pr: 90,
            squat_pr: 140,
            deadlift_pr: 175,
          });
        }
        alert('Compte créé ! Tu peux maintenant te connecter.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleFistBump = async (postId: number) => {
    const isCurrentlyLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            fist_bumps: p.fist_bumps + (isCurrentlyLiked ? -1 : 1),
          };
        }
        return p;
      })
    );

    if (currentUser) {
      if (!isCurrentlyLiked) {
        await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: currentUser.id }]);
      } else {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);
      }
    }
  };

  const handlePublishWorkout = async () => {
    setIsUploading(true);
    const userDisplayName =
      currentUser?.user_metadata?.username ||
      currentUser?.email?.split('@')[0] ||
      'Antoine';

    let uploadedImageUrl =
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800';

    if (selectedImageFile) {
      const fileExt = selectedImageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `workouts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, selectedImageFile);

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('posts').getPublicUrl(filePath);
        uploadedImageUrl = publicUrl;
      }
    }

    let newBench = userPRs.bench;
    let newSquat = userPRs.squat;
    let newDeadlift = userPRs.deadlift;

    exercisesList.forEach((ex) => {
      const w = parseFloat(ex.weight);
      const name = ex.name.toLowerCase();
      if (!isNaN(w)) {
        if (name.includes('couché') || name.includes('bench'))
          newBench = Math.max(newBench, w);
        if (name.includes('squat')) newSquat = Math.max(newSquat, w);
        if (name.includes('deadlift') || name.includes('terre'))
          newDeadlift = Math.max(newDeadlift, w);
      }
    });

    if (
      newBench !== userPRs.bench ||
      newSquat !== userPRs.squat ||
      newDeadlift !== userPRs.deadlift
    ) {
      setUserPRs({ bench: newBench, squat: newSquat, deadlift: newDeadlift });
      if (currentUser) {
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          user_name: userDisplayName,
          bench_pr: newBench,
          squat_pr: newSquat,
          deadlift_pr: newDeadlift,
        });
      }
    }

    const formattedStats = exercisesList.map((ex) => ({
      exercise: ex.name || 'Exercice',
      set: `${ex.setsReps} reps`,
      weight: `${ex.weight} kg`,
    }));

    const newPostData = {
      user_id: currentUser?.id,
      user_name: userDisplayName,
      user_avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      club_id: currentClub?.id,
      club_name: currentClub?.name || 'Basic-Fit Tournai',
      image_url: uploadedImageUrl,
      workout_badge: newSplit,
      stats: formattedStats,
      caption: newCaption || 'Séance du jour bouclée ! 💪',
      fist_bumps: 1,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([newPostData])
      .select();

    if (!error && data) {
      setPosts([data[0], ...posts]);
    } else {
      setPosts([{ ...newPostData, id: Date.now() }, ...posts]);
    }

    setIsUploading(false);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setShowPublishModal(false);
    setNewCaption('');
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !activeCommentPostId) return;
    const userDisplayName =
      currentUser?.user_metadata?.username ||
      currentUser?.email?.split('@')[0] ||
      'Antoine';

    const newComment = {
      post_id: activeCommentPostId,
      user_id: currentUser?.id,
      user_name: userDisplayName,
      content: newCommentText.trim(),
    };

    const { data } = await supabase
      .from('comments')
      .insert([newComment])
      .select();
    if (data) setCommentsList([...commentsList, data[0]]);
    setNewCommentText('');
  };

  const handleSendChatMessage = async () => {
    if (!newChatMessage.trim()) return;
    const userDisplayName =
      currentUser?.user_metadata?.username ||
      currentUser?.email?.split('@')[0] ||
      'Antoine';

    const messageData = {
      sender_id: currentUser?.id,
      sender_name: userDisplayName,
      content: newChatMessage.trim(),
    };

    const { data } = await supabase
      .from('messages')
      .insert([messageData])
      .select();
    if (data) setChatMessages([...chatMessages, data[0]]);
    setNewChatMessage('');
  };

  const handleJoinBuddy = () => {
    setSelectedBuddyAlert(null);
    setBuddySuccessNotice(true);
    setTimeout(() => setBuddySuccessNotice(false), 4000);
    fetchMessages();
    setShowChatModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddExercise = () => {
    setExercisesList([
      ...exercisesList,
      { name: '', setsReps: '3x10', weight: '20' },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercisesList(exercisesList.filter((_, idx) => idx !== index));
  };

  const handleCreateBuddyAlert = () => {
    const userDisplayName =
      currentUser?.user_metadata?.username ||
      currentUser?.email?.split('@')[0] ||
      'Antoine';
    const newAlert: BuddyAlert = {
      id: Date.now(),
      userName: userDisplayName,
      userAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: buddyLevel,
      focus: buddyFocus,
      time: buddyTime,
      note: buddyNote,
    };

    setBuddyAlerts([newAlert, ...buddyAlerts]);
    setShowCreateBuddyModal(false);
  };

  const handleSelectClubFromExplore = (club: Club) => {
    setCurrentClub(club);
    setNavTab('feed');
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#09090b',
          minHeight: '100vh',
          color: '#f97316',
        }}
      >
        <Dumbbell size={36} color="#f97316" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          minHeight: '100vh',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#000',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px',
            borderLeft: '1px solid #27272a',
            borderRight: '1px solid #27272a',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(249,115,22,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Dumbbell size={32} color="#f97316" />
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#f97316',
                margin: '0 0 4px',
              }}
            >
              FitPulse
            </h1>
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0 }}>
              Le réseau social connecté à ta salle de sport
            </p>
          </div>

          <form
            onSubmit={handleAuth}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {isSignUp && (
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#a1a1aa',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  PSEUDO
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    padding: '0 10px',
                  }}
                >
                  <UserCheck size={16} color="#71717a" />
                  <input
                    type="text"
                    placeholder="Ex: Antoine_Fit"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: '10px 8px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#a1a1aa',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                EMAIL
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '0 10px',
                }}
              >
                <Mail size={16} color="#71717a" />
                <input
                  type="email"
                  placeholder="nom@exemple.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#fff',
                    padding: '10px 8px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#a1a1aa',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                MOT DE PASSE
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '0 10px',
                }}
              >
                <Lock size={16} color="#71717a" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#fff',
                    padding: '10px 8px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {authError && (
              <div
                style={{
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: '#f97316',
                color: '#fff',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              {isSignUp ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : 'Pas encore de compte ? S’inscrire'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#09090b',
        minHeight: '100vh',
        color: '#f8fafc',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#000',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '1px solid #27272a',
          borderRight: '1px solid #27272a',
          position: 'relative',
        }}
      >
        {buddySuccessNotice && (
          <div
            style={{
              position: 'fixed',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              backgroundColor: '#10b981',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '30px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            }}
          >
            <CheckCircle2 size={16} /> Demande de créneau envoyée !
          </div>
        )}

        {/* Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #27272a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Dumbbell size={22} color="#f97316" />
            <span
              style={{ fontSize: '18px', fontWeight: 900, color: '#f97316' }}
            >
              FitPulse
            </span>
          </div>

          <select
            value={currentClub?.id || ''}
            onChange={(e) => {
              const selected = clubs.find((c) => c.id === e.target.value);
              if (selected) setCurrentClub(selected);
            }}
            style={{
              backgroundColor: '#18181b',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: '20px',
              border: '1px solid #27272a',
              outline: 'none',
              maxWidth: '160px',
            }}
          >
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                📍 {club.name.replace('Basic-Fit ', '')}
              </option>
            ))}
          </select>

          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => {
              fetchMessages();
              setShowChatModal(true);
            }}
          >
            <Send size={20} color="#e4e4e7" />
            <span
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                backgroundColor: '#f97316',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 'bold',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              💬
            </span>
          </div>
        </header>

        {/* Contenu dynamique */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
          {/* VUE 1 : FEED */}
          {navTab === 'feed' && (
            <div>
              {/* Stories */}
              <div
                style={{
                  padding: '12px 8px',
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  borderBottom: '1px solid #18181b',
                }}
              >
                {stories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() =>
                      !story.isAffluence && setSelectedStory(story)
                    }
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        padding: '2px',
                        borderRadius: '50%',
                        background: story.isAffluence
                          ? 'linear-gradient(to tr, #10b981, #6ee7b7)'
                          : 'linear-gradient(to tr, #f97316, #ef4444)',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#000',
                          padding: '2px',
                          borderRadius: '50%',
                        }}
                      >
                        {story.isAffluence ? (
                          <div
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '50%',
                              backgroundColor: '#18181b',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span style={{ fontSize: '10px' }}>🟢</span>
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 'bold',
                                color: '#a1a1aa',
                              }}
                            >
                              {story.status}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={story.avatar}
                            alt={story.name}
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#d4d4d8',
                        maxWidth: '65px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {story.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sélecteur Club / Région */}
              <div
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  gap: '8px',
                  backgroundColor: '#09090b',
                }}
              >
                <button
                  onClick={() => setActiveTab('club')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor:
                      activeTab === 'club' ? '#f97316' : '#18181b',
                    color: activeTab === 'club' ? '#fff' : '#a1a1aa',
                  }}
                >
                  📍 Mon Club
                </button>
                <button
                  onClick={() => setActiveTab('region')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor:
                      activeTab === 'region' ? '#f97316' : '#18181b',
                    color: activeTab === 'region' ? '#fff' : '#a1a1aa',
                  }}
                >
                  🌍 Ma Région
                </button>
              </div>

              {/* Gym Buddy */}
              <div
                style={{
                  padding: '0 12px',
                  marginTop: '6px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#f97316',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Zap size={14} /> GYM BUDDY DISPONIBLES
                  </span>
                  <button
                    onClick={() => setShowCreateBuddyModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    + Créer mon créneau
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {buddyAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(249,115,22,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <img
                          src={alert.userAvatar}
                          alt={alert.userName}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#fff',
                              }}
                            >
                              {alert.userName}
                            </span>
                            <span
                              style={{
                                fontSize: '9px',
                                backgroundColor: 'rgba(16,185,129,0.2)',
                                color: '#34d399',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              {alert.time}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '11px',
                              color: '#a1a1aa',
                              margin: '2px 0 0',
                            }}
                          >
                            {alert.focus} • {alert.level}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBuddyAlert(alert)}
                        style={{
                          backgroundColor: '#f97316',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Rejoindre
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publications */}
              {posts.map((post) => {
                const isLiked = likedPosts[post.id];
                return (
                  <article
                    key={post.id}
                    style={{
                      paddingTop: '12px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #18181b',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 12px 10px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <img
                          src={
                            post.user_avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={post.user_name}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: '#fff',
                              display: 'block',
                            }}
                          >
                            {post.user_name}
                          </span>
                          <p
                            style={{
                              fontSize: '10px',
                              color: '#a1a1aa',
                              margin: 0,
                            }}
                          >
                            {post.club_name}
                          </p>
                        </div>
                      </div>
                      <MoreHorizontal size={18} color="#a1a1aa" />
                    </div>

                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1/1',
                        backgroundColor: '#09090b',
                      }}
                    >
                      <img
                        src={post.image_url}
                        alt="Workout"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: '#fff',
                        }}
                      >
                        {post.workout_badge}
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          right: '10px',
                          backgroundColor: 'rgba(0,0,0,0.85)',
                          padding: '10px',
                          borderRadius: '10px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '9px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            color: '#a1a1aa',
                            marginBottom: '4px',
                          }}
                        >
                          Charges validées :
                        </div>
                        {post.stats.map((s, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '11px',
                              margin: '2px 0',
                            }}
                          >
                            <span style={{ color: '#e4e4e7' }}>
                              {s.exercise}
                            </span>
                            <span
                              style={{ fontWeight: 'bold', color: '#f97316' }}
                            >
                              {s.set} • {s.weight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '10px 12px 0' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                          }}
                        >
                          <button
                            onClick={() => toggleFistBump(post.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '18px',
                                filter: isLiked ? 'none' : 'grayscale(100%)',
                              }}
                            >
                              👊
                            </span>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: isLiked ? '#f97316' : '#d4d4d8',
                              }}
                            >
                              {post.fist_bumps}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveCommentPostId(post.id);
                              fetchComments(post.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#d4d4d8',
                            }}
                          >
                            <MessageCircle size={18} />
                          </button>
                        </div>
                        <Bookmark size={18} color="#d4d4d8" />
                      </div>
                      <div style={{ fontSize: '12px', color: '#e4e4e7' }}>
                        <strong style={{ color: '#fff', marginRight: '6px' }}>
                          {post.user_name}
                        </strong>
                        {post.caption}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* VUE 2 : RECORDS */}
          {navTab === 'records' && (
            <div style={{ padding: '16px 14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <Trophy size={22} color="#f59e0b" />
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Hall of Fame
                </h2>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: '#a1a1aa',
                  margin: '0 0 16px',
                }}
              >
                Classement officiel • {currentClub?.name || 'Basic-Fit Tournai'}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  backgroundColor: '#18181b',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                }}
              >
                <button
                  onClick={() => setSelectedLift('bench')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedLift === 'bench' ? '#f97316' : 'transparent',
                    color: selectedLift === 'bench' ? '#fff' : '#a1a1aa',
                  }}
                >
                  Couché
                </button>
                <button
                  onClick={() => setSelectedLift('squat')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedLift === 'squat' ? '#f97316' : 'transparent',
                    color: selectedLift === 'squat' ? '#fff' : '#a1a1aa',
                  }}
                >
                  Squat
                </button>
                <button
                  onClick={() => setSelectedLift('deadlift')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedLift === 'deadlift' ? '#f97316' : 'transparent',
                    color: selectedLift === 'deadlift' ? '#fff' : '#a1a1aa',
                  }}
                >
                  Deadlift
                </button>
              </div>

              {/* Podium */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  gap: '8px',
                  marginBottom: '20px',
                  paddingTop: '10px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#18181b',
                    padding: '12px 6px 8px',
                    borderRadius: '12px',
                    border: '1px solid #3f3f46',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#94a3b8',
                      marginBottom: '4px',
                    }}
                  >
                    🥈 2e
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    alt=""
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '6px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#fff',
                    }}
                  >
                    Marc Dupont
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      color: '#f97316',
                      marginTop: '2px',
                    }}
                  >
                    130.0 kg
                  </span>
                </div>

                <div
                  style={{
                    flex: 1.15,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#18181b',
                    padding: '16px 6px 12px',
                    borderRadius: '14px',
                    border: '1px solid #f59e0b',
                    transform: 'translateY(-8px)',
                    boxShadow: '0 4px 16px rgba(245,158,11,0.2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#f59e0b',
                      marginBottom: '4px',
                    }}
                  >
                    👑 1er
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                    alt=""
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #f59e0b',
                      marginBottom: '6px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                    }}
                  >
                    Alexandre K.
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 900,
                      color: '#f59e0b',
                      marginTop: '2px',
                    }}
                  >
                    142.5 kg
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#18181b',
                    padding: '12px 6px 8px',
                    borderRadius: '12px',
                    border: '1px solid #3f3f46',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#b45309',
                      marginBottom: '4px',
                    }}
                  >
                    🥉 3e
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                    alt=""
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '6px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#fff',
                    }}
                  >
                    Thomas V.
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      color: '#f97316',
                      marginTop: '2px',
                    }}
                  >
                    122.5 kg
                  </span>
                </div>
              </div>

              {/* Ton rang dynamique */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(249,115,22,0.1)',
                  border: '1px solid #f97316',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Award size={18} color="#f97316" />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                    }}
                  >
                    Ton Record Actuel
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#f97316',
                  }}
                >
                  {selectedLift === 'bench'
                    ? `${userPRs.bench} kg`
                    : selectedLift === 'squat'
                    ? `${userPRs.squat} kg`
                    : `${userPRs.deadlift} kg`}
                </div>
              </div>
            </div>
          )}

          {/* VUE 3 : PROFIL */}
          {navTab === 'profile' && (
            <div style={{ padding: '16px 14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                    alt="Profile"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #f97316',
                    }}
                  />
                  <div>
                    <h2
                      style={{
                        fontSize: '17px',
                        fontWeight: 'bold',
                        color: '#fff',
                        margin: 0,
                      }}
                    >
                      {currentUser?.user_metadata?.username ||
                        currentUser?.email?.split('@')[0] ||
                        'Antoine'}
                    </h2>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px',
                      }}
                    >
                      <MapPin size={12} color="#f97316" />
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        {currentClub?.name || 'Basic-Fit Tournai'}
                      </span>
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        backgroundColor: 'rgba(249,115,22,0.15)',
                        color: '#f97316',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        marginTop: '4px',
                      }}
                    >
                      Intermédiaire • 4j / sem
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Se déconnecter"
                  style={{
                    background: '#18181b',
                    border: '1px solid #ef4444',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <LogOut size={16} />
                </button>
              </div>

              {/* Compteurs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  backgroundColor: '#18181b',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #27272a',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div
                    style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}
                  >
                    {posts.length}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#71717a',
                      fontWeight: 'bold',
                    }}
                  >
                    SÉANCES
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 900,
                      color: '#f97316',
                    }}
                  >
                    #4
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#71717a',
                      fontWeight: 'bold',
                    }}
                  >
                    RANG CLUB
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}
                  >
                    148
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#71717a',
                      fontWeight: 'bold',
                    }}
                  >
                    FIST BUMPS
                  </div>
                </div>
              </div>

              {/* PRs */}
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Award size={14} /> RECORDS PERSONNELS AUTO-CALCULÉS
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#38bdf8',
                      fontWeight: 'bold',
                    }}
                  >
                    Total: {userPRs.bench + userPRs.squat + userPRs.deadlift} kg
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#18181b',
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: '1px solid #27272a',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#a1a1aa',
                        fontWeight: 'bold',
                      }}
                    >
                      COUCHÉ
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 900,
                        color: '#f97316',
                        marginTop: '2px',
                      }}
                    >
                      {userPRs.bench} kg
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#18181b',
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: '1px solid #27272a',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#a1a1aa',
                        fontWeight: 'bold',
                      }}
                    >
                      SQUAT
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 900,
                        color: '#f97316',
                        marginTop: '2px',
                      }}
                    >
                      {userPRs.squat} kg
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#18181b',
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: '1px solid #27272a',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#a1a1aa',
                        fontWeight: 'bold',
                      }}
                    >
                      DEADLIFT
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 900,
                        color: '#f97316',
                        marginTop: '2px',
                      }}
                    >
                      {userPRs.deadlift} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Sélecteur Grille / Liste */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #27272a',
                  marginBottom: '12px',
                }}
              >
                <button
                  onClick={() => setProfileViewMode('grid')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    borderBottom:
                      profileViewMode === 'grid' ? '2px solid #f97316' : 'none',
                    color: profileViewMode === 'grid' ? '#f97316' : '#71717a',
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setProfileViewMode('list')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    borderBottom:
                      profileViewMode === 'list' ? '2px solid #f97316' : 'none',
                    color: profileViewMode === 'list' ? '#f97316' : '#71717a',
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <List size={18} />
                </button>
              </div>

              {profileViewMode === 'grid' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                  }}
                >
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1/1',
                        backgroundColor: '#18181b',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={post.image_url}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '4px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          fontSize: '8px',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        {post.workout_badge.split(' ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#18181b',
                        borderRadius: '10px',
                        border: '1px solid #27272a',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#fff',
                          }}
                        >
                          {post.workout_badge}
                        </span>
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#71717a',
                            marginTop: '2px',
                          }}
                        >
                          {post.stats.length} exercices
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#f97316',
                          fontWeight: 'bold',
                        }}
                      >
                        👊 {post.fist_bumps}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VUE 4 : EXPLORER */}
          {navTab === 'explore' && (
            <div style={{ padding: '16px 14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <Search size={20} color="#f97316" />
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Salles partenaires
                </h2>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#18181b',
                      borderRadius: '10px',
                      border: '1px solid #27272a',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: '#fff',
                        }}
                      >
                        {club.name}
                      </span>
                      <p
                        style={{
                          fontSize: '11px',
                          color: '#a1a1aa',
                          margin: '2px 0 0',
                        }}
                      >
                        📍 {club.city}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectClubFromExplore(club)}
                      style={{
                        backgroundColor: 'rgba(249,115,22,0.15)',
                        color: '#f97316',
                        border: '1px solid #f97316',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      Consulter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 30,
            backgroundColor: 'rgba(0,0,0,0.95)',
            borderTop: '1px solid #27272a',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Home
            size={22}
            color={navTab === 'feed' ? '#f97316' : '#71717a'}
            onClick={() => setNavTab('feed')}
            style={{ cursor: 'pointer' }}
          />
          <Search
            size={22}
            color={navTab === 'explore' ? '#f97316' : '#71717a'}
            onClick={() => setNavTab('explore')}
            style={{ cursor: 'pointer' }}
          />

          <div
            onClick={() => setShowPublishModal(true)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(to tr, #f97316, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
            }}
          >
            <PlusSquare size={22} color="#fff" />
          </div>

          <Trophy
            size={22}
            color={navTab === 'records' ? '#f97316' : '#71717a'}
            onClick={() => setNavTab('records')}
            style={{ cursor: 'pointer' }}
          />
          <User
            size={22}
            color={navTab === 'profile' ? '#f97316' : '#71717a'}
            onClick={() => setNavTab('profile')}
            style={{ cursor: 'pointer' }}
          />
        </nav>

        {/* Modale Story */}
        {selectedStory && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              backgroundColor: '#000',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
                zIndex: 10,
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {selectedStory.name}
              </span>
              <X
                size={24}
                onClick={() => setSelectedStory(null)}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <img
              src={selectedStory.media}
              alt="Story"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Modale Commentaires */}
        {activeCommentPostId && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 70,
              backgroundColor: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <MessageSquare size={20} color="#f97316" />
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Commentaires
                </h2>
              </div>
              <X
                size={24}
                color="#a1a1aa"
                onClick={() => setActiveCommentPostId(null)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              {commentsList.length === 0 ? (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#71717a',
                    textAlign: 'center',
                    marginTop: '30px',
                  }}
                >
                  Sois le premier à encourager cet athlète !
                </p>
              ) : (
                commentsList.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      backgroundColor: '#18181b',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #27272a',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#f97316',
                      }}
                    >
                      {c.user_name}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#fff',
                        marginTop: '2px',
                      }}
                    >
                      {c.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Écris un message d'encouragement..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddComment}
                style={{
                  backgroundColor: '#f97316',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 14px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modale Chat Direct */}
        {showChatModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 80,
              backgroundColor: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: '1px solid #27272a',
                paddingBottom: '10px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Zap size={20} color="#10b981" />
                <h2
                  style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Gym Buddy Chat Direct
                </h2>
              </div>
              <X
                size={22}
                color="#a1a1aa"
                onClick={() => setShowChatModal(false)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '8px 0',
              }}
            >
              {chatMessages.length === 0 ? (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#71717a',
                    textAlign: 'center',
                    marginTop: '40px',
                  }}
                >
                  Organise l'heure exacte et l'échauffement avec ton binôme !
                </p>
              ) : (
                chatMessages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf:
                        m.sender_name ===
                        (currentUser?.user_metadata?.username ||
                          currentUser?.email?.split('@')[0])
                          ? 'flex-end'
                          : 'flex-start',
                      maxWidth: '80%',
                      backgroundColor:
                        m.sender_name ===
                        (currentUser?.user_metadata?.username ||
                          currentUser?.email?.split('@')[0])
                          ? '#f97316'
                          : '#18181b',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        opacity: 0.8,
                        marginBottom: '2px',
                      }}
                    >
                      {m.sender_name}
                    </div>
                    <div style={{ fontSize: '12px' }}>{m.content}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', paddingTop: '10px' }}>
              <input
                type="text"
                placeholder="Ex: Je suis devant les vestiaires à 18h25 !"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSendChatMessage}
                style={{
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 14px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modale Rejoindre Binôme */}
        {selectedBuddyAlert && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 60,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                padding: '20px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '300px',
                textAlign: 'center',
              }}
            >
              <img
                src={selectedBuddyAlert.userAvatar}
                alt=""
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  margin: '0 auto 10px',
                  objectFit: 'cover',
                }}
              />
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#fff',
                  margin: '0 0 4px',
                }}
              >
                Rejoindre {selectedBuddyAlert.userName} ?
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  color: '#f97316',
                  fontWeight: 'bold',
                  margin: '0 0 8px',
                }}
              >
                {selectedBuddyAlert.focus} • {selectedBuddyAlert.time}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: '#a1a1aa',
                  margin: '0 0 16px',
                }}
              >
                « {selectedBuddyAlert.note} »
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSelectedBuddyAlert(null)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#d4d4d8',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleJoinBuddy}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#f97316',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Confirmer & Chatter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale Créer Binôme */}
        {showCreateBuddyModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              backgroundColor: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Zap size={20} color="#f97316" />
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Créer une alerte Binôme
                </h2>
              </div>
              <X
                size={24}
                color="#a1a1aa"
                onClick={() => setShowCreateBuddyModal(false)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#a1a1aa',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  MUSCLES / FOCUS
                </label>
                <input
                  type="text"
                  value={buddyFocus}
                  onChange={(e) => setBuddyFocus(e.target.value)}
                  placeholder="Ex: Pecs & Épaules"
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #27272a',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#a1a1aa',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  HORAIRE PRÉVU
                </label>
                <input
                  type="text"
                  value={buddyTime}
                  onChange={(e) => setBuddyTime(e.target.value)}
                  placeholder="Ex: Demain 17h45"
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #27272a',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#a1a1aa',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  NIVEAU RECHERCHÉ
                </label>
                <select
                  value={buddyLevel}
                  onChange={(e) => setBuddyLevel(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #27272a',
                    fontSize: '13px',
                  }}
                >
                  <option>Tous niveaux bienvenus</option>
                  <option>Débutant (Apprendre ensemble)</option>
                  <option>Intermédiaire</option>
                  <option>Avancé (Charges lourdes / Spot)</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#a1a1aa',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  MESSAGE AUX MEMBRES
                </label>
                <textarea
                  rows={3}
                  value={buddyNote}
                  onChange={(e) => setBuddyNote(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #27272a',
                    fontSize: '12px',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                onClick={handleCreateBuddyAlert}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#f97316',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Lancer l'alerte sur le club
              </button>
            </div>
          </div>
        )}

        {/* Modale Partager Séance */}
        {showPublishModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              backgroundColor: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#fff',
                  margin: 0,
                }}
              >
                Partager ma séance
              </h2>
              <X
                size={24}
                color="#a1a1aa"
                onClick={() => setShowPublishModal(false)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#a1a1aa',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  PHOTO DE LA SÉANCE
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />

                {imagePreviewUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '140px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #f97316',
                    }}
                  >
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <button
                      onClick={() => {
                        setSelectedImageFile(null);
                        setImagePreviewUrl(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #27272a',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#18181b',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Camera size={24} color="#f97316" />
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#e4e4e7',
                      }}
                    >
                      Prendre une photo / Choisir dans la galerie
                    </span>
                    <span style={{ fontSize: '10px', color: '#71717a' }}>
                      PNG, JPG jusqu'à 10MB
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#a1a1aa',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  TYPE DE SÉANCE
                </label>
                <select
                  value={newSplit}
                  onChange={(e) => setNewSplit(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #27272a',
                    fontSize: '13px',
                  }}
                >
                  <option>Push Day (Pecs / Triceps)</option>
                  <option>Pull Day (Dos / Biceps)</option>
                  <option>Leg Day (Quadriceps / Ischios)</option>
                  <option>Épaules / Bras</option>
                  <option>Full Body</option>
                </select>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#a1a1aa',
                    }}
                  >
                    EXERCICES & CHARGES
                  </label>
                  <button
                    onClick={handleAddExercise}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f97316',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Ajouter un exercice
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {exercisesList.map((ex, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        backgroundColor: '#18181b',
                        padding: '8px',
                        borderRadius: '8px',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Ex: Squat"
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...exercisesList];
                          updated[idx].name = e.target.value;
                          setExercisesList(updated);
                        }}
                        style={{
                          flex: 2,
                          backgroundColor: '#27272a',
                          border: 'none',
                          color: '#fff',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="4x8"
                        value={ex.setsReps}
                        onChange={(e) => {
                          const updated = [...exercisesList];
                          updated[idx].setsReps = e.target.value;
                          setExercisesList(updated);
                        }}
                        style={{
                          width: '55px',
                          backgroundColor: '#27272a',
                          border: 'none',
                          color: '#fff',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      />
                      <input
                        type="number"
                        placeholder="kg"
                        value={ex.weight}
                        onChange={(e) => {
                          const updated = [...exercisesList];
                          updated[idx].weight = e.target.value;
                          setExercisesList(updated);
                        }}
                        style={{
                          width: '50px',
                          backgroundColor: '#27272a',
                          border: 'none',
                          color: '#fff',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        kg
                      </span>
                      {exercisesList.length > 1 && (
                        <Trash2
                          size={16}
                          color="#ef4444"
                          onClick={() => handleRemoveExercise(idx)}
                          style={{ cursor: 'pointer', marginLeft: '4px' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#a1a1aa',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  LÉGENDE / COMMENTAIRE
                </label>
                <textarea
                  rows={3}
                  placeholder="Raconte comment s'est passée ta séance..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #27272a',
                    fontSize: '12px',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                onClick={handlePublishWorkout}
                disabled={isUploading}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#f97316',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isUploading ? (
                  <React.Fragment>
                    <Loader2 size={16} className="animate-spin" /> Envoi en
                    cours...
                  </React.Fragment>
                ) : (
                  'Publier sur le club'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

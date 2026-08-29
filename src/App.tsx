import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Bot, PlusSquare, Calculator, User, MessageCircle, Home, Users, Plus, X, Camera, Flame, MapPin, Hash
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

import { 
  ExerciseGuide, TransformationPhoto, ExerciseEntry, Post, Story, RealUser, FriendRequest, DBMessage, LiveWorkoutExercise, AIChatMessage 
} from './types';
import { askFitBotAI } from './services/gemini';

// Import de tous nos composants modulaires
import FeedTab from './components/FeedTab';
import BuddyTab from './components/BuddyTab';
import LiveTrackerTab from './components/LiveTrackerTab';
import FitBotTab from './components/FitBotTab';
import ExercisesTab from './components/ExercisesTab';
import ChatTab from './components/ChatTab';
import CalculatorTab from './components/CalculatorTab';
import ProfileTab from './components/ProfileTab';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'sb_publishable_O8CKhUtzgq9nO9lKavNE9A__fAdRWoB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TIME_SLOTS = ['🌅 Matin (6h - 9h)', '☀️ Midi (12h - 14h)', '🌆 Soir (17h - 20h)', '🌙 Nocturne (20h+)', '📅 Week-end flexible'];

const CLUBS_LIST = [
  'Club Tournai (Bastion)',
  'Club Tournai (les jeunesses)',
  'Club Antoing',
  'Club Péruwelz',
  'Club Leuze',
  'Club Ath',
  'Club Mouscron',
  'Club Ronse',
  'Club St-Ghislain',
  'Club Mons',
  'Club Jurbise'
];

const EXERCISES_DATABASE: ExerciseGuide[] = [
  { id: 'ex-1', name: 'Développé couché (Barre / Haltères)', category: 'Pectoraux', equipment: 'Banc & Barre', targetMuscles: 'Pectoraux, Triceps', settings: 'Banc à plat', execution: 'Descendre la barre puis pousser', tips: 'Omoplates serrées', image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800', detailedDescription: 'Exercice roi pour les pecs.' },
];

const isMatchingClub = (postClubName?: string, selectedClubName?: string): boolean => {
  if (!postClubName || !selectedClubName) return false;
  if (postClubName === selectedClubName) return true;
  const normalize = (str: string) => str.toLowerCase().replace(/[()]/g, '').trim();
  const p = normalize(postClubName); const s = normalize(selectedClubName);
  return p === s || p.includes(s) || s.includes(p);
};

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [currentTab, setCurrentTab] = useState<'feed' | 'buddy' | 'workout' | 'exercises' | 'chat' | 'profile' | 'calculator' | 'live_tracker' | 'fitbot'>('feed');
  const [selectedClub, setSelectedClub] = useState<string>('Club Tournai (Bastion)');
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  
  // Références d'input fichiers
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);
  const postImageFileInputRef = useRef<HTMLInputElement>(null);

  // États pour la création de post avec photo du téléphone et hashtags
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postSessionType, setPostSessionType] = useState('Musculation Full Body');
  const [postCaption, setPostCaption] = useState('');
  const [postHashtags, setPostHashtags] = useState('#fitpulse #workout');
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(false);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveWorkoutName, setLiveWorkoutName] = useState<string>('Séance Full Body');
  const [liveExercises, setLiveExercises] = useState<LiveWorkoutExercise[]>([]);
  const [selectedExToAdd, setSelectedExToAdd] = useState(EXERCISES_DATABASE[0].name);
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState<number>(0);

  const [aiChatMessages, setAiChatMessages] = useState<AIChatMessage[]>([{ sender: 'bot', text: "Salut l'athlète ! Je suis **FitBot**. Comment puis-je t'aider aujourd'hui ?" }]);
  const [aiInputText, setAiInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  const [transformations, setTransformations] = useState<TransformationPhoto[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RealUser[]>([]);
  const [cloudStories, setCloudStories] = useState<Story[]>([]);
  const [allMessages, setAllMessages] = useState<DBMessage[]>([]);
  
  const [viewingProfileUser, setViewingProfileUser] = useState<RealUser | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedBuddyChat, setSelectedBuddyChat] = useState<RealUser | null>(null);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newTransNote, setNewTransNote] = useState('');
  const [newTransWeight, setNewTransWeight] = useState<number | ''>('');
  const [newTransBefore, setNewTransBefore] = useState<string | null>(null);
  const [newTransAfter, setNewTransAfter] = useState<string | null>(null);
  const [newTransIsPrivate, setNewTransIsPrivate] = useState<boolean>(true);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tous');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseGuide | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | ''>(100);
  const [barbellWeight, setBarbellWeight] = useState<number>(20);
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);

  const fetchCloudPosts = async () => {
    setFeedLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setFeedLoading(false);
  };

  const fetchRealUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setRegisteredUsers(data as RealUser[]);
  };

  const fetchTransformations = async (userId: string) => {
    const { data } = await supabase.from('transformations').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (data) setTransformations(data as TransformationPhoto[]);
  };

  const fetchFriendRequests = async (userId: string) => {
    const { data } = await supabase.from('friend_requests').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (data) setFriendRequests(data as FriendRequest[]);
  };

  const fetchAllMessages = async () => {
    const { data } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
    if (data) setAllMessages(data as DBMessage[]);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setSelectedClub(session.user.user_metadata?.home_club || selectedClub);
        setUserAvatarUrl(session.user.user_metadata?.avatar_url || userAvatarUrl);
        fetchTransformations(session.user.id);
        fetchFriendRequests(session.user.id);
      }
    });

    fetchCloudPosts();
    fetchRealUsers();
    fetchAllMessages();

    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? (payload.new as Post) : p));
        } else if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new as Post, ...prev]);
        }
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('public:direct_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        setAllMessages(prev => [...prev, payload.new as DBMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const handleTabChange = (tab: any) => { setCurrentTab(tab); };

  const handleSendAIChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || aiInputText;
    if (!textToSend.trim()) return;
    if (!customText) setAiInputText('');
    const newHistory: AIChatMessage[] = [...aiChatMessages, { sender: 'user', text: textToSend }];
    setAiChatMessages([...newHistory, { sender: 'bot', text: "Hmm, réfléchissons... 🧠" }]);
    const botReply = await askFitBotAI(textToSend);
    setAiChatMessages([...newHistory, { sender: 'bot', text: botReply }]);
  };

  const toggleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert("Non supporté."); return; }
    if (isListening) { setIsListening(false); return; }
    const recognition = new (window as any).SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (ev: any) => { setAiInputText(ev.results[0][0].transcript); setIsListening(false); handleSendAIChat(undefined, ev.results[0][0].transcript); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSendMessage = async () => {
    if (!currentMessageInput.trim() || !selectedBuddyChat || !user) return;
    const text = currentMessageInput.trim(); setCurrentMessageInput('');
    await supabase.from('direct_messages').insert([{ sender_id: user.id, receiver_id: selectedBuddyChat.id, sender_name: user.user_metadata?.username || 'Moi', text }]);
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const likedByList = post.liked_by || [];
    const hasLiked = likedByList.includes(user.id);
    const updatedLikedBy = hasLiked ? likedByList.filter(id => id !== user.id) : [...likedByList, user.id];
    const newCount = hasLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1;
    
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newCount, liked_by: updatedLikedBy } : p));
    await supabase.from('posts').update({ likes_count: newCount, liked_by: updatedLikedBy }).eq('id', postId);
  };

  const handlePostImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const fullCaption = `${postCaption} ${postHashtags}`.trim();
    const { error } = await supabase.from('posts').insert([{
      user_id: user.id,
      username: user.user_metadata?.username || 'Athlète',
      avatar_url: userAvatarUrl,
      club_name: selectedClub,
      session_type: postSessionType,
      caption: fullCaption,
      image_url: postImageUrl,
      exercises: [],
      likes_count: 0,
      liked_by: [],
      comments_count: 0,
      comments: [],
      is_private: false
    }]);

    if (!error) {
      setIsPostModalOpen(false);
      setPostCaption('');
      setPostImageUrl(null);
      fetchCloudPosts();
    } else {
      alert("Erreur lors de la publication : " + error?.message);
    }
  };

  const handleFinishLiveWorkout = async () => {
    if (!user) return;
    if (liveExercises.length === 0) { alert("Ajoute au moins un exercice !"); return; }
    const formattedExercises: ExerciseEntry[] = liveExercises.map(ex => ({ name: ex.name, sets: ex.sets.length, reps: ex.sets[0]?.reps || 10, weight: ex.sets[0]?.weight || 50 }));
    await supabase.from('posts').insert([{ user_id: user.id, username: user.user_metadata?.username || 'Athlète', avatar_url: userAvatarUrl, club_name: selectedClub, session_type: liveWorkoutName, caption: "Séance terminée en direct ! 💪 #fitpulse", exercises: formattedExercises, likes_count: 0, liked_by: [], comments_count: 0, comments: [], is_private: false }]);
    setIsLiveActive(false);
    handleTabChange('feed');
    fetchCloudPosts();
  };

  const acceptedFriendIds = friendRequests.filter(req => req.status === 'accepted').map(req => (req.sender_id === user?.id ? req.receiver_id : req.sender_id));
  const activeChatUsers = registeredUsers.filter((u) => u.id !== user?.id && acceptedFriendIds.includes(u.id));
  const displayedPosts = posts.filter((post) => isMatchingClub(post.club_name, selectedClub));
  const currentChatMessages = allMessages.filter((m) => selectedBuddyChat && user && ((m.sender_id === user.id && m.receiver_id === selectedBuddyChat.id) || (m.sender_id === selectedBuddyChat.id && m.receiver_id === user.id)));

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const calculatePlates = (target: number | '', bar: number) => {
    if (target === '' || target <= bar) return [];
    let remaining = (target - bar) / 2;
    const result: { weight: number; count: number }[] = [];
    for (const plate of availablePlates) {
      if (remaining <= 0) break;
      const count = Math.floor(remaining / plate);
      if (count > 0) { result.push({ weight: plate, count }); remaining = Number((remaining - count * plate).toFixed(2)); }
    }
    return result;
  };
  const plateBreakdown = targetWeight !== '' ? calculatePlates(targetWeight, barbellWeight) : [];
  const currentUserProfile = registeredUsers.find(u => u.id === user?.id);
  const isAdmin = currentUserProfile?.is_admin || user?.email === 'antbou@fitpulse.be';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500"><Zap className="w-5 h-5" /></div>
          <h1 className="text-base font-black tracking-tight leading-none text-white">FitPulse</h1>
        </div>

        {/* Sélecteur de club en haut à droite */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1.5 flex-shrink-0" />
            <select 
              value={selectedClub} 
              onChange={(e) => setSelectedClub(e.target.value)} 
              className="bg-transparent text-xs font-bold text-orange-400 focus:outline-none cursor-pointer pr-1"
            >
              {CLUBS_LIST.map((club) => (
                <option key={club} value={club} className="bg-neutral-900 text-white">
                  {club}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 pb-24">
        {currentTab === 'feed' && <FeedTab stories={cloudStories} posts={displayedPosts} registeredUsers={registeredUsers} friendRequests={friendRequests} currentUserId={user?.id} feedLoading={feedLoading} viewedStoryIds={viewedStoryIds} onOpenStory={(idx) => setActiveStoryIndex(idx)} onCreateStoryClick={() => setIsPostModalOpen(true)} onToggleLike={handleToggleLike} onOpenComments={(id) => setActiveCommentPostId(id)} onReportPost={() => {}} onDeletePost={() => {}} onSelectProfile={(u) => setViewingProfileUser(u)} onStartRestTimer={() => {}} />}
        {currentTab === 'buddy' && <BuddyTab currentUserId={user?.id} registeredUsers={registeredUsers} friendRequests={friendRequests} onSendFriendRequest={async (rId) => { if (!user) return; await supabase.from('friend_requests').insert([{ sender_id: user.id, receiver_id: rId, status: 'pending' }]); fetchFriendRequests(user.id); }} onAcceptFriendRequest={async (reqId) => { await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', reqId); if (user) fetchFriendRequests(user.id); }} onSelectBuddyProfile={(u) => setViewingProfileUser(u)} />}
        {currentTab === 'fitbot' && <FitBotTab messages={aiChatMessages} inputText={aiInputText} setInputText={setAiInputText} isListening={isListening} toggleVoice={toggleVoiceDictation} onSend={(e) => handleSendAIChat(e)} messagesEndRef={aiMessagesEndRef} />}
        {currentTab === 'exercises' && <ExercisesTab exercises={EXERCISES_DATABASE} exerciseSearch={exerciseSearch} setExerciseSearch={setExerciseSearch} selectedCategoryFilter={selectedCategoryFilter} setSelectedCategoryFilter={setSelectedCategoryFilter} onSelectExercise={(ex) => setSelectedExerciseDetail(ex)} />}
        {currentTab === 'calculator' && <CalculatorTab targetWeight={targetWeight} setTargetWeight={setTargetWeight} barbellWeight={barbellWeight} setBarbellWeight={setBarbellWeight} plateBreakdown={plateBreakdown} />}
        {currentTab === 'live_tracker' && <LiveTrackerTab liveWorkoutName={liveWorkoutName} setLiveWorkoutName={setLiveWorkoutName} liveElapsedSeconds={liveElapsedSeconds} liveExercises={liveExercises} selectedExToAdd={selectedExToAdd} setSelectedExToAdd={setSelectedExToAdd} exercisesDatabase={EXERCISES_DATABASE} onAddExercise={() => setLiveExercises([...liveExercises, { id: 'lex-' + Date.now(), name: selectedExToAdd, sets: [{ setNumber: 1, weight: 50, reps: 10, completed: false }] }])} onAddSet={(exId) => setLiveExercises(liveExercises.map(ex => ex.id === exId ? { ...ex, sets: [...ex.sets, { setNumber: ex.sets.length + 1, weight: 50, reps: 10, completed: false }] } : ex))} onToggleSet={(exId, sIdx) => setLiveExercises(liveExercises.map(ex => ex.id === exId ? { ...ex, sets: ex.sets.map((s, i) => i === sIdx ? { ...s, completed: !s.completed } : s) } : ex))} onUpdateWeight={(exId, sIdx, val) => setLiveExercises(liveExercises.map(item => item.id === exId ? { ...item, sets: item.sets.map((s, i) => i === sIdx ? { ...s, weight: val } : s) } : item))} onUpdateReps={(exId, sIdx, val) => setLiveExercises(liveExercises.map(item => item.id === exId ? { ...item, sets: item.sets.map((s, i) => i === sIdx ? { ...s, reps: val } : s) } : item))} onFinishWorkout={handleFinishLiveWorkout} onQuitLive={() => setIsLiveActive(false)} />}
        {currentTab === 'chat' && <ChatTab currentUserId={user?.id} selectedBuddyChat={selectedBuddyChat} setSelectedBuddyChat={setSelectedBuddyChat} activeChatUsers={activeChatUsers} currentChatMessages={currentChatMessages} currentMessageInput={currentMessageInput} onInputChange={(e) => setCurrentMessageInput(e.target.value)} onSendMessage={handleSendMessage} onSelectBuddy={(f) => setSelectedBuddyChat(f)} onDeleteConversation={() => {}} onReportConversation={() => {}} isOtherUserTyping={isOtherUserTyping} isMessageLimitReached={false} lastReadTimestamps={{}} messagesEndRef={messagesEndRef} allMessages={allMessages} />}
        {currentTab === 'profile' && <ProfileTab user={user} currentUserProfile={currentUserProfile} userAvatarUrl={userAvatarUrl} isAdmin={isAdmin} registeredUsers={registeredUsers} transformations={transformations} newTransBefore={newTransBefore} newTransAfter={newTransAfter} newTransWeight={newTransWeight} newTransNote={newTransNote} newTransIsPrivate={newTransIsPrivate} setNewTransWeight={setNewTransWeight} setNewTransNote={setNewTransNote} setNewTransIsPrivate={setNewTransIsPrivate} onAvatarClick={() => profileAvatarInputRef.current?.click()} onCameraStart={() => {}} onBeforeFileSelect={() => {}} onAfterFileSelect={() => {}} onAddTransformation={async (e) => { e.preventDefault(); if (!user || newTransWeight === '') return; await supabase.from('transformations').insert([{ user_id: user.id, before_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400', after_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400', date: new Date().toISOString().split('T')[0], weight: Number(newTransWeight), note: newTransNote || 'Évolution', is_private: newTransIsPrivate }]); fetchTransformations(user.id); setNewTransWeight(''); setNewTransNote(''); alert('📸 Transformation enregistrée !'); }} onShareTransformation={() => {}} onUpdatePasswordSubmit={async (e) => { e.preventDefault(); await supabase.auth.updateUser({}); alert("🔒 Mot de passe mis à jour !"); }} password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} isPrivateMode={isPrivateMode} setIsPrivateMode={setIsPrivateMode} onSignOut={() => supabase.auth.signOut()} onToggleVerifyAdmin={async (uId, status) => { await supabase.from('profiles').update({ is_verified: !status }).eq('id', uId); fetchRealUsers(); }} beforeFileInputRef={beforeFileInputRef} afterFileInputRef={afterFileInputRef} />}
      </main>

      {/* Modale de création de publication avec photo du téléphone et Hashtags */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Partager une séance
              </h3>
              <button onClick={() => setIsPostModalOpen(false)} className="p-2 text-neutral-400 hover:text-white rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Type de séance :</label>
                <select value={postSessionType} onChange={(e) => setPostSessionType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-3 text-sm text-white">
                  <option value="Musculation Full Body">Musculation Full Body</option>
                  <option value="Pectoraux / Triceps">Pectoraux / Triceps</option>
                  <option value="Dos / Biceps">Dos / Biceps</option>
                  <option value="Jambes / Abdos">Jambes / Abdos</option>
                  <option value="Cardio / HIIT">Cardio / HIIT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Légende :</label>
                <textarea rows={3} placeholder="Comment s'est passée ta séance ?" value={postCaption} onChange={(e) => setPostCaption(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-orange-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-orange-500" /> Hashtags :
                </label>
                <input type="text" placeholder="#fitpulse #muscu #tournai" value={postHashtags} onChange={(e) => setPostHashtags(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-orange-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Ajouter une photo (depuis votre téléphone) :</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => postImageFileInputRef.current?.click()} className="flex-1 py-3 bg-neutral-950 border border-neutral-800 hover:border-orange-500 rounded-xl text-xs font-bold text-neutral-200 flex items-center justify-center gap-2 transition">
                    <Camera className="w-4 h-4 text-orange-500" /> Choisir une photo
                  </button>
                  <input type="file" accept="image/*" ref={postImageFileInputRef} onChange={handlePostImageFileSelect} className="hidden" />
                </div>
              </div>

              {postImageUrl && (
                <div className="relative rounded-2xl overflow-hidden h-40 border border-neutral-800">
                  <img src={postImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPostImageUrl(null)} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white"><X className="w-4 h-4" /></button>
                </div>
              )}

              <button type="submit" className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-sm shadow-xl transition">
                Publier sur le fil 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Barre de navigation du bas avec badge dynamique sur le chat */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800 px-2 py-2 flex justify-around items-center">
        <button onClick={() => handleTabChange('feed')} className={`flex flex-col items-center gap-1 ${currentTab === 'feed' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Home className="w-5 h-5" /><span className="text-[10px]">Accueil</span></button>
        <button onClick={() => handleTabChange('buddy')} className={`flex flex-col items-center gap-1 ${currentTab === 'buddy' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Users className="w-5 h-5" /><span className="text-[10px]">Buddies</span></button>
        
        {/* Bouton central "+" pour poster */}
        <button onClick={() => setIsPostModalOpen(true)} className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg transition transform hover:scale-105 -mt-3">
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button onClick={() => handleTabChange('fitbot')} className={`flex flex-col items-center gap-1 ${currentTab === 'fitbot' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><Bot className="w-5 h-5" /><span className="text-[10px]">FitBot IA</span></button>
        
        {/* Bouton Chat avec badge rouge numéroté */}
        {(() => {
          const unreadCount = activeChatUsers.filter(buddy => {
            const lastMsg = allMessages.filter(m => (m.sender_id === buddy.id && m.receiver_id === user?.id)).pop();
            return lastMsg && lastMsg.sender_id !== user?.id;
          }).length;

          return (
            <button onClick={() => handleTabChange('chat')} className={`relative flex flex-col items-center gap-1 ${currentTab === 'chat' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}>
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px]">Chat</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg border border-neutral-950">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })()}

        <button onClick={() => handleTabChange('profile')} className={`flex flex-col items-center gap-1 ${currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-neutral-500'}`}><User className="w-5 h-5" /><span className="text-[10px]">Profil</span></button>
      </nav>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, ShieldCheck, MapPin, Send, Plus, X, Camera, Image as ImageIcon, Hash, Flag, Flame } from 'lucide-react';
import { Post, Story, RealUser, FriendRequest } from '../types';

interface FeedTabProps {
  stories: Story[];
  posts: Post[];
  registeredUsers: RealUser[];
  friendRequests: FriendRequest[];
  currentUserId?: string;
  feedLoading: boolean;
  viewedStoryIds: string[];
  calculateStreak: (userId: string) => number;
  onOpenStory: (index: number) => void;
  onCreateStoryClick: () => void;
  onToggleLike: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onReportPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onSelectProfile: (user: RealUser) => void;
  onStartRestTimer: () => void;
  onMarkStoryAsViewed?: (storyId: string) => void;
}

const STORY_REACTIONS = ['👍', '❤️', '👏', '😲', '😂', '🔥'];
const PRESET_HASHTAGS = ['#fitpulse', '#workout', '#musculation', '#cardio', '#tournai', '#teamshape', '#fitness', '#nopainnogain'];

export default function FeedTab({
  stories,
  posts,
  registeredUsers,
  friendRequests,
  currentUserId,
  feedLoading,
  viewedStoryIds,
  calculateStreak,
  onToggleLike,
  onSelectProfile,
  onMarkStoryAsViewed
}: FeedTabProps) {
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [reportMenuPostId, setReportMenuPostId] = useState<string | null>(null);
  
  const [currentViewingStoryIndex, setCurrentViewingStoryIndex] = useState<number | null>(null);
  const [storyReactionAnim, setStoryReactionAnim] = useState<string | null>(null);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyImagePreview, setStoryImagePreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['#fitpulse']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Références séparées pour la caméra et la galerie
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    setCommentInput('');
  };

  const handleReactStory = (emoji: string) => {
    setStoryReactionAnim(emoji);
    setTimeout(() => setStoryReactionAnim(null), 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryImagePreview(reader.result as string);
        setIsStoryModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePresetTag = (tag: string) => {
    if (selectedHashtags.includes(tag)) {
      setSelectedHashtags(selectedHashtags.filter(t => t !== tag));
    } else {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      let formatted = customTagInput.trim();
      if (!formatted.startsWith('#')) formatted = '#' + formatted;
      if (!selectedHashtags.includes(formatted)) {
        setSelectedHashtags([...selectedHashtags, formatted]);
      }
      setCustomTagInput('');
    }
  };

  const handlePublishStory = () => {
    if (!storyImagePreview) return;
    setIsStoryModalOpen(false);
    setStoryImagePreview(null);
    setStoryCaption('');
    setSelectedHashtags(['#fitpulse']);
    alert("✨ Story publiée avec succès !");
  };

  const acceptedFriendIds = friendRequests
    .filter(req => req.status === 'accepted')
    .map(req => (req.sender_id === currentUserId ? req.receiver_id : req.sender_id));

  const myStories = stories.filter(story => story.user_id === currentUserId);
  const friendStories = stories.filter(story => story.user_id !== currentUserId && acceptedFriendIds.includes(story.user_id));
  const orderedStories = [...myStories, ...friendStories];

  const handleOpenStoryViewer = (index: number) => {
    setCurrentViewingStoryIndex(index);
    const openedStory = orderedStories[index];
    if (openedStory && onMarkStoryAsViewed) {
      onMarkStoryAsViewed(openedStory.id);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Input Caméra (avec capture pour forcer l'ouverture directe de l'appareil photo) */}
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
      
      {/* 2. Input Galerie (sans capture pour ouvrir les albums du téléphone) */}
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          <div 
            onClick={() => {
              if (myStories.length > 0) {
                const myIdx = orderedStories.findIndex(s => s.user_id === currentUserId);
                if (myIdx !== -1) handleOpenStoryViewer(myIdx);
              } else {
                galleryInputRef.current?.click();
              }
            }} 
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 p-[2.5px] shadow-lg">
              <img 
                src={myStories[0]?.image_url || registeredUsers.find(u => u.id === currentUserId)?.avatar_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150"} 
                alt="Ma story" 
                className="w-full h-full rounded-full object-cover border-2 border-neutral-950" 
              />
              <button 
                onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }}
                className="absolute bottom-0 right-0 w-6 h-6 bg-orange-600 hover:bg-orange-500 rounded-full border-2 border-neutral-950 flex items-center justify-center text-white"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <span className="text-[11px] font-bold text-neutral-300 truncate w-16 text-center">Ma Story</span>
          </div>

          <div className="w-[1px] h-12 bg-neutral-800 mx-1 flex-shrink-0" />

          {friendStories.map((story) => {
            const author = registeredUsers.find(u => u.id === story.user_id);
            const globalIndex = orderedStories.findIndex(s => s.id === story.id);
            const isViewed = viewedStoryIds.includes(story.id);

            return (
              <div 
                key={story.id} 
                onClick={() => handleOpenStoryViewer(globalIndex)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-full p-0.5 ${isViewed ? 'border-2 border-neutral-600' : 'bg-gradient-to-tr from-orange-500 to-amber-400 p-[2.5px]'}`}>
                  <img src={story.image_url || author?.avatar_url} alt="" className="w-full h-full rounded-full object-cover border-2 border-neutral-950" />
                </div>
                <span className="text-[11px] font-bold text-neutral-300 truncate w-16 text-center">{author?.username || 'Athlète'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 overflow-y-auto animate-fadeIn">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-500" /> Personnaliser ta Story
            </h3>
            <button onClick={() => { setIsStoryModalOpen(false); setStoryImagePreview(null); }} className="p-2 text-white bg-neutral-900 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 my-2">
            <div className="relative rounded-3xl overflow-hidden h-64 bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              {storyImagePreview && <img src={storyImagePreview} alt="Aperçu" className="w-full h-full object-cover" />}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">Texte / Commentaire :</label>
              <input 
                type="text" 
                placeholder="Ex: Grosse séance jambes validée ! 🔥" 
                value={storyCaption} 
                onChange={(e) => setStoryCaption(e.target.value)} 
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-orange-500" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-orange-500" /> Choisir tes hashtags :
              </label>
              
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HASHTAGS.map((tag) => {
                  const isSelected = selectedHashtags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => togglePresetTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${isSelected ? 'bg-orange-600 text-white border-orange-500 shadow-md' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'}`}
                    >
                      {tag} {isSelected ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              <input 
                type="text" 
                placeholder="Ajouter un hashtag perso (Entrée)..." 
                value={customTagInput} 
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-orange-500 mt-2" 
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={handlePublishStory} 
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl text-sm shadow-xl transition"
            >
              Publier ma Story 🚀
            </button>
            <div className="flex gap-2">
              <button onClick={() => cameraInputRef.current?.click()} className="flex-1 py-3 bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 rounded-xl flex items-center justify-center gap-2">
                <Camera className="w-4 h-4 text-orange-500" /> Caméra
              </button>
              <button onClick={() => galleryInputRef.current?.click()} className="flex-1 py-3 bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 rounded-xl flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-500" /> Galerie
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {feedLoading ? (
          <div className="text-center py-12 text-neutral-500 text-xs">Chargement du fil d'actualité...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
            Aucune publication pour ce club pour le moment. Sois le premier à poster ta séance ! 🚀
          </div>
        ) : (
          posts.map((post) => {
            const author = registeredUsers.find(u => u.id === post.user_id);
            const isLiked = post.liked_by?.includes(currentUserId || '');
            const isShowingComments = activeCommentsPostId === post.id;
            const isShowingReportMenu = reportMenuPostId === post.id;
            const streak = author ? calculateStreak(author.id) : 0;

            return (
              <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl space-y-3 relative">
                <div className="px-5 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => author && onSelectProfile(author)}>
                    <img src={post.avatar_url || author?.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-800 group-hover:border-orange-500 transition" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 group-hover:text-orange-400 transition">
                        {post.username} 
                        {author?.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                        {streak > 0 && (
                          <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/30 flex items-center gap-0.5 font-black">
                            <Flame className="w-3 h-3 fill-orange-500" /> {streak}
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-orange-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {post.club_name} • <span className="text-neutral-400">{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button onClick={() => setReportMenuPostId(isShowingReportMenu ? null : post.id)} className="p-2 text-neutral-400 hover:text-white font-bold">⋮</button>
                    {isShowingReportMenu && (
                      <div className="absolute right-0 mt-1 w-40 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl z-30 py-1">
                        <button 
                          onClick={() => { alert("🚨 Publication signalée aux administrateurs."); setReportMenuPostId(null); }} 
                          className="w-full px-4 py-2 text-left text-xs text-amber-400 hover:bg-neutral-900 flex items-center gap-2"
                        >
                          <Flag className="w-3.5 h-3.5" /> Signaler le post
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 space-y-1.5">
                  <span className="inline-block bg-orange-500/10 text-orange-400 font-bold text-xs px-2.5 py-1 rounded-xl border border-orange-500/20">
                    🏋️‍♂️ {post.session_type}
                  </span>
                  <p className="text-xs text-neutral-200 leading-relaxed">{post.caption}</p>
                </div>

                {post.image_url && (
                  <div className="w-full bg-neutral-950 h-72 overflow-hidden border-y border-neutral-800">
                    <img src={post.image_url} alt="Séance" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="px-5 pb-4 flex items-center justify-between border-b border-neutral-800/60 pb-3">
                  <div className="flex items-center gap-5">
                    <button onClick={() => onToggleLike(post.id)} className={`flex items-center gap-1.5 text-xs font-bold transition ${isLiked ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}>
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} /> {post.likes_count || 0}
                    </button>
                    <button onClick={() => setActiveCommentsPostId(isShowingComments ? null : post.id)} className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition">
                      <MessageCircle className="w-5 h-5" /> {(post.comments || []).length}
                    </button>
                  </div>
                </div>

                {isShowingComments && (
                  <div className="bg-neutral-950 px-5 py-4 space-y-3 border-t border-neutral-800">
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {(!post.comments || post.comments.length === 0) ? (
                        <div className="text-center py-4 text-neutral-500 text-xs">Aucun commentaire pour l'instant. Sois le premier !</div>
                      ) : (
                        post.comments.map((c: any, cIdx: number) => (
                          <div key={cIdx} className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-xs space-y-1">
                            <span className="font-bold text-orange-400 block">{c.username || 'Athlète'}</span>
                            <p className="text-neutral-200">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="Écrire un commentaire..." 
                        value={commentInput} 
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(post.id); }}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-orange-500"
                      />
                      <button onClick={() => handleSendComment(post.id)} className="px-3.5 bg-orange-600 text-white rounded-xl font-bold text-xs">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {currentViewingStoryIndex !== null && orderedStories[currentViewingStoryIndex] && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none animate-fadeIn">
          <div className="space-y-2 pt-2">
            <div className="flex gap-1">
              {orderedStories.map((_, idx) => (
                <div key={idx} className={`flex-1 h-1 rounded-full ${idx === currentViewingStoryIndex ? 'bg-orange-500' : 'bg-neutral-700'}`} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={registeredUsers.find(u => u.id === orderedStories[currentViewingStoryIndex].user_id)?.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-neutral-700" />
                <span className="font-bold text-sm text-white">
                  {orderedStories[currentViewingStoryIndex].user_id === currentUserId ? 'Moi' : (registeredUsers.find(u => u.id === orderedStories[currentViewingStoryIndex].user_id)?.username || 'Athlète')}
                </span>
              </div>
              <button onClick={() => setCurrentViewingStoryIndex(null)} className="p-2 text-white bg-neutral-900/80 rounded-full"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center my-4 overflow-hidden rounded-3xl bg-neutral-950">
            <img src={orderedStories[currentViewingStoryIndex].image_url} alt="Story" className="w-full h-full object-contain" />
            
            {storyReactionAnim && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs animate-bounce">
                <span className="text-8xl drop-shadow-2xl">{storyReactionAnim}</span>
              </div>
            )}
          </div>

          <div className="pb-6 px-2 space-y-3">
            <div className="flex items-center justify-around bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full px-4 py-3 shadow-2xl">
              {STORY_REACTIONS.map((emoji) => (
                <button 
                  key={emoji} 
                  onClick={() => handleReactStory(emoji)} 
                  className="text-2xl hover:scale-125 transition transform active:scale-95 p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

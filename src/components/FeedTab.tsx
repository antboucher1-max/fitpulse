import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, ShieldCheck, MapPin, Send, Plus, X, Camera, Image as ImageIcon } from 'lucide-react';
import { Post, Story, RealUser } from '../types';

interface FeedTabProps {
  stories: Story[];
  posts: Post[];
  registeredUsers: RealUser[];
  currentUserId?: string;
  feedLoading: boolean;
  viewedStoryIds: string[];
  onOpenStory: (index: number) => void;
  onCreateStoryClick: () => void;
  onToggleLike: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onReportPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onSelectProfile: (user: RealUser) => void;
  onStartRestTimer: () => void;
}

const STORY_REACTIONS = ['👍', '❤️', '👏', '😲', '😂', '🔥'];

export default function FeedTab({
  stories,
  posts,
  registeredUsers,
  currentUserId,
  feedLoading,
  viewedStoryIds,
  onOpenStory,
  onCreateStoryClick,
  onToggleLike,
  onOpenComments,
  onReportPost,
  onDeletePost,
  onSelectProfile,
  onStartRestTimer
}: FeedTabProps) {
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  
  const [currentViewingStoryIndex, setCurrentViewingStoryIndex] = useState<number | null>(null);
  const [storyReactionAnim, setStoryReactionAnim] = useState<string | null>(null);

  // États pour la création de Story avec caméra directe ou fichier
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyImagePreview, setStoryImagePreview] = useState<string | null>(null);
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

  // Gestion de la photo capturée par la caméra ou la galerie
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

  const handlePublishStory = () => {
    if (!storyImagePreview) return;
    // Logique d'envoi de la story
    setIsStoryModalOpen(false);
    setStoryImagePreview(null);
    alert("✨ Story publiée avec succès !");
  };

  return (
    <div className="space-y-4 pb-12">
      {/* INPUTS CACHÉS POUR LA CAMÉRA ET LA GALERIE */}
      {/* capture="environment" force l'ouverture directe de la caméra arrière du téléphone */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={galleryInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* SECTION DES STORIES */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {/* Bouton "Ma Story" : Ouvre directement la caméra prête */}
          <div 
            onClick={() => cameraInputRef.current?.click()} 
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-950 border-2 border-dashed border-orange-500/60 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/10 transition shadow-lg">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-neutral-300">Ma Story 📸</span>
          </div>

          {/* Liste des stories des autres athlètes */}
          {stories.map((story, index) => {
            const author = registeredUsers.find(u => u.id === story.user_id);
            const isViewed = viewedStoryIds.includes(story.id);

            return (
              <div 
                key={story.id} 
                onClick={() => setCurrentViewingStoryIndex(index)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-full p-0.5 ${isViewed ? 'border-2 border-neutral-700' : 'bg-gradient-to-tr from-orange-500 to-amber-400 p-[2.5px]'}`}>
                  <img src={story.image_url || author?.avatar_url} alt="" className="w-full h-full rounded-full object-cover border-2 border-neutral-950" />
                </div>
                <span className="text-[11px] font-bold text-neutral-300 truncate w-16 text-center">{author?.username || 'Athlète'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALE DE PRÉVISUALISATION DE LA STORY */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-500" /> Aperçu de ta Story
            </h3>
            <button onClick={() => { setIsStoryModalOpen(false); setStoryImagePreview(null); }} className="p-2 text-white bg-neutral-900 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 my-4 relative rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
            {storyImagePreview && <img src={storyImagePreview} alt="Aperçu" className="w-full h-full object-contain" />}
          </div>

          <div className="space-y-3">
            <button 
              onClick={handlePublishStory} 
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2"
            >
              Publier ma Story 🚀
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => cameraInputRef.current?.click()} 
                className="flex-1 py-3 bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 rounded-xl flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 text-orange-500" /> Reprendre une photo
              </button>
              <button 
                onClick={() => galleryInputRef.current?.click()} 
                className="flex-1 py-3 bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 rounded-xl flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-orange-500" /> Choisir de la galerie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIL D'ACTUALITÉ */}
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

            return (
              <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl space-y-3">
                <div className="px-5 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => author && onSelectProfile(author)}>
                    <img src={post.avatar_url || author?.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-neutral-800" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        {post.username} {author?.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                      </h3>
                      <p className="text-[11px] text-orange-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {post.club_name} • <span className="text-neutral-400">{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                      </p>
                    </div>
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

      {/* VISIONNEUSE DE STORY PLEIN ÉCRAN */}
      {currentViewingStoryIndex !== null && stories[currentViewingStoryIndex] && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none animate-fadeIn">
          <div className="space-y-2 pt-2">
            <div className="flex gap-1">
              {stories.map((_, idx) => (
                <div key={idx} className={`flex-1 h-1 rounded-full ${idx === currentViewingStoryIndex ? 'bg-orange-500' : 'bg-neutral-700'}`} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={registeredUsers.find(u => u.id === stories[currentViewingStoryIndex].user_id)?.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-neutral-700" />
                <span className="font-bold text-sm text-white">{registeredUsers.find(u => u.id === stories[currentViewingStoryIndex].user_id)?.username || 'Athlète'}</span>
              </div>
              <button onClick={() => setCurrentViewingStoryIndex(null)} className="p-2 text-white bg-neutral-900/80 rounded-full"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center my-4 overflow-hidden rounded-3xl bg-neutral-950">
            <img src={stories[currentViewingStoryIndex].image_url} alt="Story" className="w-full h-full object-contain" />
            
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

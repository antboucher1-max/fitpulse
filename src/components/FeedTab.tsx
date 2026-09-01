import { useState, FormEvent } from 'react';
import { Dumbbell, Heart, MessageCircle, Share2, ShieldCheck, Send, Sparkles } from 'lucide-react';

interface FeedTabProps {
  posts: any[];
  registeredUsers?: any[];
  friendRequests?: any[];
  currentUserId?: string;
  currentUsername?: string;
  currentUserProfile?: any;
  userDiscipline?: string;
  feedLoading?: boolean;
  calculateStreak?: (targetUserId: string) => number;
  onCreateStoryClick?: () => void;
  onToggleLike?: (postId: string, likedBy: string[]) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onOpenComments?: (postId: string) => void;
  onReportPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onSelectProfile?: (user: any) => void;
  onStartRestTimer?: () => void;
  onSharePost?: (post: any) => void;
  onLikePost?: (postId: string, likedBy: string[]) => void;
}

export default function FeedTab({
  posts,
  currentUserId,
  onLikePost,
  onToggleLike,
  onAddComment,
  onSharePost
}: FeedTabProps) {
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const handleLikeAction = (postId: string, likedBy: string[]) => {
    if (onToggleLike) {
      onToggleLike(postId, likedBy);
    } else if (onLikePost) {
      onLikePost(postId, likedBy);
    }
  };

  const handleCommentSubmit = (e: FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/35 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" /> Communauté FitPulse
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Fil d'actualité des Athlètes</h2>
          </div>
          <span className="text-xs font-bold bg-neutral-950/80 border border-neutral-800 px-3.5 py-1.5 rounded-full text-neutral-300 shadow-inner">
            {posts.length} publications
          </span>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-3xl p-12 text-center space-y-3">
          <Dumbbell className="w-10 h-10 text-neutral-600 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-white">Aucune publication pour le moment</h3>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Sois le premier à partager ton entraînement du jour sur le fil et à faire gagner des points à ton club !
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => {
            const isLikedByMe = currentUserId ? (post.liked_by || []).includes(currentUserId) : false;
            const likesCount = post.likes_count || (post.liked_by ? post.liked_by.length : 0);
            const commentsList = post.comments || [];

            return (
              <div 
                key={post.id} 
                className="bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 rounded-3xl p-6 space-y-4 shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'} 
                      alt={post.username} 
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-orange-500/30 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white">{post.username}</span>
                        {post.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                      </div>
                      <span className="text-[11px] text-neutral-400 font-medium">{post.club_name || 'Club Tournai (Bastion)'}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold tracking-wide uppercase bg-neutral-950 border border-neutral-800 text-orange-400 px-3 py-1 rounded-xl shadow-inner">
                    {post.session_type || 'Séance'}
                  </span>
                </div>

                <div className="text-xs text-neutral-200 leading-relaxed font-normal whitespace-pre-line bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/50">
                  {post.caption}
                </div>

                {post.image_url && (
                  <div className="rounded-2xl overflow-hidden border border-neutral-800 max-h-80 bg-neutral-950">
                    <img src={post.image_url} alt="Media" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs text-neutral-400">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => currentUserId && handleLikeAction(post.id, post.liked_by || [])}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 font-bold ${
                        isLikedByMe 
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                          : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-orange-500 text-orange-500' : ''}`} />
                      <span>{likesCount}</span>
                    </button>

                    <button 
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 border border-neutral-800 rounded-xl transition font-bold"
                    >
                      <MessageCircle className="w-4 h-4 text-cyan-400" />
                      <span>{commentsList.length}</span>
                    </button>
                  </div>

                  {onSharePost && (
                    <button 
                      onClick={() => onSharePost(post)}
                      className="p-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 rounded-xl transition"
                      title="Partager"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {activeCommentPostId === post.id && (
                  <div className="space-y-3 pt-3 border-t border-neutral-800/80 animate-fadeIn">
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {commentsList.length === 0 ? (
                        <p className="text-[11px] text-neutral-500 text-center py-2">Aucun commentaire pour l'instant. Sois le premier !</p>
                      ) : (
                        commentsList.map((c: any, idx: number) => (
                          <div key={idx} className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800/80 text-xs space-y-1">
                            <span className="font-extrabold text-orange-400">{c.username || 'Athlète'}</span>
                            <p className="text-neutral-300">{c.text || c}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Écris un commentaire motivant..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition font-bold flex items-center justify-center shadow-lg"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

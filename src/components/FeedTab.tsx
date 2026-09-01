import React, { useState } from 'react';
import { Heart, MessageCircle, ShieldCheck, MapPin, Send, Flag, Flame, Sparkles } from 'lucide-react';
import { Post, RealUser, FriendRequest } from '../types';

interface FeedTabProps {
  posts: Post[];
  registeredUsers: RealUser[];
  friendRequests: FriendRequest[];
  currentUserId?: string;
  userDiscipline?: string;
  feedLoading: boolean;
  calculateStreak: (userId: string) => number;
  onCreateStoryClick: () => void;
  onToggleLike: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onReportPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onSelectProfile: (user: RealUser) => void;
  onStartRestTimer: () => void;
}

const getDefaultFilter = (discipline?: string): 'Tout' | 'Muscu' | 'Running' | 'CrossFit' => {
  if (discipline === 'Course à pied') return 'Running';
  if (discipline === 'Crossfit') return 'CrossFit';
  if (discipline === 'Fitness / Musculation') return 'Muscu';
  return 'Tout';
};

export default function FeedTab({
  posts,
  registeredUsers,
  currentUserId,
  userDiscipline,
  feedLoading,
  calculateStreak,
  onToggleLike,
  onSelectProfile
}: FeedTabProps) {
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [reportMenuPostId, setReportMenuPostId] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<'Tout' | 'Muscu' | 'Running' | 'CrossFit'>(
    () => getDefaultFilter(userDiscipline)
  );

  const handleSendComment = (_postId: string) => {
    if (!commentInput.trim()) return;
    setCommentInput('');
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'Tout') return true;
    if (activeFilter === 'Running') return post.session_type?.includes('Running');
    if (activeFilter === 'CrossFit') return post.session_type?.includes('BoxWars') || post.session_type?.includes('WOD');
    if (activeFilter === 'Muscu') {
      return !post.session_type?.includes('Running') && !post.session_type?.includes('BoxWars') && !post.session_type?.includes('WOD');
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* --- BANNIÈRE ANNONCE FITBOT AI --- */}
      <div className="bg-gradient-to-r from-orange-600/20 via-neutral-900 to-cyan-950/40 border border-orange-500/30 rounded-3xl p-4 shadow-xl space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-wider uppercase bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Prochaine mise à jour 🚀
          </span>
          <span className="text-[10px] text-neutral-400 font-semibold">Bientôt disponible</span>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            🤖 Arrivée imminente de FitBot AI !
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Ton coach virtuel intelligent débarque bientôt dans FitPulse. Pose-lui toutes tes questions sur tes programmes et analyse tes performances en direct !
          </p>
        </div>

        <div className="pt-1 flex items-center gap-2">
          <span className="text-[10px] bg-neutral-950 text-cyan-400 font-bold px-2.5 py-1 rounded-xl border border-neutral-800">
            ⚡ Analyse de WODs
          </span>
          <span className="text-[10px] bg-neutral-950 text-orange-400 font-bold px-2.5 py-1 rounded-xl border border-neutral-800">
            📈 Conseils nutrition & force
          </span>
        </div>
      </div>
      {/* ---------------------------------- */}

      {/* --- FILTRES DE FIL D'ACTUALITÉ --- */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['Tout', 'Muscu', 'Running', 'CrossFit'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
              activeFilter === filter
                ? filter === 'CrossFit' ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                  : filter === 'Running' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-500/20'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {filter === 'Tout' && '🌍 Tout'}
            {filter === 'Muscu' && '💪 Muscu'}
            {filter === 'Running' && '🏃‍♂️ Running'}
            {filter === 'CrossFit' && '⚡ CrossFit'}
          </button>
        ))}
      </div>
      {/* ------------------------------------------- */}

      <div className="space-y-4">
        {feedLoading ? (
          <div className="text-center py-12 text-neutral-500 text-xs">Chargement du fil d'actualité...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
            {activeFilter === 'Tout' 
              ? "Aucune publication pour ce club pour le moment. Sois le premier à poster ta séance ! 🚀"
              : `Aucune publication en ${activeFilter} pour le moment. Fonce t'entraîner ! 💪`}
          </div>
        ) : (
          filteredPosts.map((post) => {
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
                  <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-xl border ${
                    post.session_type?.includes('Running') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    post.session_type?.includes('BoxWars') ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                    'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {post.session_type}
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
    </div>
  );
}

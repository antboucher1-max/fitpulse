import React from 'react';
import { Plus, MapPin, Dumbbell, Flame, Heart, MessageSquare, Flag, Trash2, ShieldCheck, Lock, Loader2, Activity } from 'lucide-react';
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
  onReportPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onSelectProfile: (user: any) => void;
  onStartRestTimer: (seconds: number) => void;
}

export default function FeedTab({
  stories, posts, registeredUsers, currentUserId, feedLoading, viewedStoryIds,
  onOpenStory, onCreateStoryClick, onToggleLike, onOpenComments, onReportPost, onDeletePost, onSelectProfile, onStartRestTimer
}: FeedTabProps) {
  const renderCaptionWithHashtags = (text: string) => {
    if (!text) return null;
    return text.split(' ').map((word, i) => word.startsWith('#') ? <span key={i} className="text-orange-500 font-bold">{word} </span> : word + ' ');
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-3">
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
          <div onClick={onCreateStoryClick} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
            <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-orange-500/50 flex items-center justify-center p-0.5 group-hover:border-orange-500 transition">
              <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-orange-400 font-bold text-lg">+</div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white border-2 border-neutral-950 shadow-md"><Plus className="w-3 h-3 stroke-[3]" /></div>
            </div>
            <span className="text-xs font-semibold text-neutral-300">Ta story</span>
          </div>

          {stories.map((story, index) => {
            const isViewed = viewedStoryIds.includes(story.id);
            const author = registeredUsers.find(u => u.id === story.user_id);
            const realAvatar = author?.avatar_url || story.avatar_url;
            return (
              <div key={story.id || index} onClick={() => onOpenStory(index)} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full ${isViewed ? 'border-2 border-dashed border-neutral-600 opacity-70' : 'bg-gradient-to-tr from-orange-500 via-pink-500 to-amber-400'} p-[2.5px]`}>
                    <div className="w-full h-full bg-neutral-950 rounded-full p-[2px]"><img src={realAvatar} alt="" className="w-full h-full rounded-full object-cover" /></div>
                  </div>
                </div>
                <span className="text-xs font-medium truncate max-w-[64px] text-center">{story.username.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {feedLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 text-sm bg-neutral-900/50 rounded-3xl border border-neutral-800/60 p-6">Aucune publication pour l'instant dans ce club.</div>
      ) : (
        posts.map((post) => {
          const isAlreadyLikedByMe = currentUserId ? (post.liked_by || []).includes(currentUserId) : false;
          const authorUser = registeredUsers.find(u => u.id === post.user_id) || { id: post.user_id, username: post.username, email: '', age: 25, home_club: post.club_name, avatar_url: post.avatar_url };
          const postRealAvatar = authorUser.avatar_url || post.avatar_url;

          return (
            <article key={post.id} className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3.5 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectProfile(authorUser)}>
                  <img src={postRealAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm leading-snug hover:text-orange-400 transition">{post.username}</h3>
                      {authorUser.is_verified && <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                      {post.is_private && <Lock className="w-3.5 h-3.5 text-neutral-500" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-orange-400 font-medium"><MapPin className="w-3.5 h-3.5" />{post.club_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onReportPost(post)} title="Signaler" className="p-2 text-neutral-500 hover:text-orange-400 rounded-lg transition"><Flag className="w-4 h-4" /></button>
                  {post.user_id === currentUserId && <button onClick={() => onDeletePost(post.id)} title="Supprimer" className="p-2 text-neutral-500 hover:text-red-400 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 relative shadow-inner aspect-square flex items-center justify-center">
                {post.image_url ? (
                  <><img src={post.image_url} alt="" className="w-full h-full object-cover pointer-events-none" /><div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500 animate-pulse" /><span className="text-sm font-black text-white">{post.session_type}</span></div></>
                ) : (
                  <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 flex flex-col justify-center items-center text-center space-y-2"><Dumbbell className="w-10 h-10 text-orange-500 mb-1" /><span className="text-base font-black text-white">{post.session_type}</span></div>
                )}
              </div>
              {post.caption && <p className="text-sm text-neutral-200 leading-relaxed font-normal">{renderCaptionWithHashtags(post.caption)}</p>}
              
              {post.exercises && post.exercises.length > 0 && (
                <div className="bg-neutral-950/80 rounded-2xl p-4 border border-neutral-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"><Dumbbell className="w-4 h-4 text-orange-500" /> Exercices</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onStartRestTimer(60)} className="px-2.5 py-1 bg-neutral-900 hover:bg-orange-600 text-neutral-300 hover:text-white rounded-lg text-xs">⏱ 60s</button>
                      <button onClick={() => onStartRestTimer(90)} className="px-2.5 py-1 bg-neutral-900 hover:bg-orange-600 text-neutral-300 hover:text-white rounded-lg text-xs">⏱ 90s</button>
                    </div>
                  </div>
                  {post.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-neutral-900 last:border-none">
                      <span className="font-semibold text-neutral-200">{ex.name}</span>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-orange-400 font-bold">{ex.sets} s × {ex.reps} r ({ex.weight} kg)</span>
                        <div className="p-1.5 bg-orange-600/20 text-orange-400 rounded-lg"><Activity className="w-3.5 h-3.5" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-neutral-400 text-sm">
                <button onClick={() => onToggleLike(post.id)} className={`flex items-center gap-2 transition ${isAlreadyLikedByMe ? 'text-red-500 font-bold' : 'hover:text-white'}`}><Heart className={`w-4 h-4 ${isAlreadyLikedByMe ? 'fill-red-500 text-red-500' : ''}`} /><span>{post.likes_count}</span></button>
                <button onClick={() => onOpenComments(post.id)} className="flex items-center gap-2 hover:text-white transition"><MessageSquare className="w-4 h-4" /><span>{post.comments_count || 0}</span></button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

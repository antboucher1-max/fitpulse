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
      {/* En-tête de section moderne */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/30 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
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

      {/* Liste des publications */}
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
                className="bg

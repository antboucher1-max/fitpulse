import { useState } from 'react';
import { Share2, Zap, X, Trophy, Check } from 'lucide-react';

interface StoryExportCardProps {
  isOpen: boolean;
  onClose: () => void;
  workoutTitle: string;
  scoreText: string;
  username: string;
  scaleMode: string;
}

export default function StoryExportCard({ isOpen, onClose, workoutTitle, scoreText, username, scaleMode }: StoryExportCardProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Copie un résumé stylisé dans le presse-papier pour le coller directement sur Instagram
  const handleCopyForStory = () => {
    const textToShare = `⚡ FITPULSE BOXWARS ⚡\n\n🎯 ${workoutTitle}\n🏆 Score : ${scoreText}\n🏷️ Mode : ${scaleMode}\n\n👤 Athlète : @${username}\n#BoxWars #HybridAthlete`;
    
    navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-orange-500" /> Partager en Story Instagram
          </h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CARTE VISUELLE STYLE STORY */}
        <div className="flex justify-center overflow-hidden py-2">
          <div className="w-[280px] h-[440px] bg-gradient-to-br from-neutral-950 via-neutral-900 to-orange-950/40 border border-orange-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-widest text-white uppercase">FitPulse</span>
              </div>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-black">
                {scaleMode}
              </span>
            </div>

            <div className="space-y-4 relative z-10 text-center my-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-orange-600/30">
                <Trophy className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-orange-400 block">{workoutTitle}</span>
                <h2 className="text-2xl font-black text-white tracking-tight">{scoreText}</h2>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800/80 flex justify-between items-center relative z-10">
              <span className="text-xs font-bold text-neutral-300">@{username}</span>
              <span className="text-[9px] text-neutral-500 font-mono">#BoxWars</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyForStory}
          className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
          {copied ? "Copié pour ta Story Insta ! 🚀" : "Copier le texte et les stats 📋"}
        </button>
      </div>
    </div>
  );
}

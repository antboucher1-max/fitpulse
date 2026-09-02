import { useState } from 'react';
import { Bot, Sparkles, Send, Dumbbell, Utensils, Zap, Activity, RefreshCw } from 'lucide-react';

interface FitBotTabProps {
  currentUserProfile: any;
  currentReadinessScore: number;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function FitBotTab({ currentUserProfile, currentReadinessScore }: FitBotTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Salut ${currentUserProfile?.username || 'Athlète'} ! Je suis FitBot, ton coach personnel. J'analyse ta forme du jour (${currentReadinessScore}%) et tes objectifs (${currentUserProfile?.goal || 'Performance'}). Comment puis-je t'aider aujourd'hui sur ton entraînement ou ta nutrition ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Suggestions rapides pour l'utilisateur
  const quickPrompts = [
    "Que manger avant mon fractionné ?",
    "Analyse ma forme actuelle",
    "Adapter ma séance si j'ai des courbatures",
    "Mon plan glucides pour ce soir"
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsAnalyzing(true);

    // Simulation d'une réponse intelligente et contextuelle de l'IA
    setTimeout(() => {
      let aiResponseText = "C'est un excellent point. Avec ton profil orienté hybride, assure-toi de bien alterner les phases de tension mécanique et de récupération glucidique.";
      
      const lower = text.toLowerCase();
      if (lower.includes('manger') || lower.includes('nutrition') || lower.includes('glucides')) {
        aiResponseText = "🍎 **Conseil Nutrition FitBot :** Pour optimiser tes stocks de glycogène sans alourdir ta digestion, privilégie des glucides à assimilation rapide (compotes, pain blanc, eau isotonique) 1h30 avant l'effort, et garde les graisses/fibres pour après la séance.";
      } else if (lower.includes('forme') || lower.includes('analyse')) {
        aiResponseText = `📊 **Diagnostic de Forme :** Ton score de readiness est à ${currentReadinessScore}%. ${currentReadinessScore < 50 ? "Attention, la fatigue s'accumule. Je te conseille un entraînement en Zone 2 ou de la mobilité pure." : "Ton organisme est réceptif. C'est le moment idéal pour aller chercher un record ou envoyer du volume !"}`;
      } else if (lower.includes('courbatures') || lower.includes('adapter')) {
        aiResponseText = "⚠️ **Gestion de la fatigue :** Si les courbatures sont locales (ex: ischio-jambiers), bascule sur du haut du corps ou un footing très souple de régénération. Ne force jamais sur une fibre musculaire inflammée.";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      
      {/* HEADER FITBOT */}
      <div className="bg-gradient-to-br from-cyan-950/60 via-neutral-900 to-neutral-900 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">FitBot Intelligence</h2>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-400 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">V1.0 Actif</span>
            </div>
            <p className="text-xs text-neutral-400">Ton coach expert en course, muscu & nutrition.</p>
          </div>
        </div>
      </div>

      {/* ZONE DE CHAT / CONVERSATION */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex flex-col h-[50vh] shadow-xl">
        
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-orange-600 text-white rounded-br-none shadow-md' 
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-bl-none shadow-inner'
              }`}>
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1 text-[10px]">
                    <Sparkles className="w-3 h-3" /> FitBot Coach
                  </div>
                )}
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="text-[9px] text-neutral-500 block text-right mt-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-neutral-400 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> FitBot analyse tes données...
              </div>
            </div>
          )}
        </div>

        {/* PROMPTS RAPIDES (Boutons de suggestions) */}
        <div className="pt-3 border-t border-neutral-800/80 mt-2">
          <p className="text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-wider">Suggestions rapides :</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/50 text-neutral-300 rounded-xl text-[11px] font-medium whitespace-nowrap transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT DE MESSAGE */}
        <div className="flex items-center gap-2 mt-3 pt-2">
          <input 
            type="text" 
            placeholder="Pose ta question à FitBot..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-2xl px-4 py-3 text-xs text-white outline-none transition"
          />
          <button 
            onClick={() => handleSendMessage()}
            className="p-3 bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold rounded-2xl transition cursor-pointer shadow-lg"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>

    </div>
  );
}

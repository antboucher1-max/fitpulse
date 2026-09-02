import { useState } from 'react';
import { Bot, Sparkles, Send, RefreshCw, Zap } from 'lucide-react';

interface FitBotTabProps {
  currentUserProfile: any;
  currentReadinessScore: number;
  userShoes?: any[];
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function FitBotTab({ currentUserProfile, currentReadinessScore, userShoes = [] }: FitBotTabProps) {
  const userVma = currentUserProfile?.vma || 14;
  const activeShoe = userShoes.find(s => s.is_active) || userShoes[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Salut ${currentUserProfile?.username || 'Athlète'} ! Je suis ton coach FitBot. J'ai analysé ton profil : VMA de ${userVma} km/h, objectif "${currentUserProfile?.goal || 'Performance'}" et état de forme à ${currentReadinessScore}%. Que veux-tu optimiser aujourd'hui ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const quickPrompts = [
    "Quelles sont mes allures cibles ?",
    "État de mes chaussures / Matos",
    "Conseil nutrition pour ma séance",
    "Comment gérer ma fatigue ?"
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

    setTimeout(() => {
      let aiResponseText = "Analyse validée. En tant qu'athlète hybride, garde ton focus sur la régularité.";
      
      const lower = text.toLowerCase();
      if (lower.includes('allures') || lower.includes('vma')) {
        const slowPace = (60 / (userVma * 0.75)).toFixed(2).replace('.', 'm');
        const thresholdPace = (60 / (userVma * 0.88)).toFixed(2).replace('.', 'm');
        aiResponseText = `⚡ **Calculateur d'allures (VMA ${userVma} km/h) :**\n- Footing / Endurance (75% VMA) : ~${slowPace} /km\n- Seuil / Fractionné (88% VMA) : ~${thresholdPace} /km`;
      } else if (lower.includes('chaussures') || lower.includes('matos') || lower.includes('fatigue chaussures')) {
        if (activeShoe) {
          const kmLeft = activeShoe.max_km - activeShoe.current_km;
          aiResponseText = `👟 **Suivi Matériel :** Ta paire active (${activeShoe.brand} ${activeShoe.model}) comptabilise ${activeShoe.current_km} km sur ${activeShoe.max_km} km max. Il te reste environ ${kmLeft} km avant de prévoir un renouvellement pour préserver tes articulations.`;
        } else {
          aiResponseText = "👟 Aucune chaussure enregistrée dans ton profil. Pense à en ajouter une dans ton profil pour suivre ton kilométrage !";
        }
      } else if (lower.includes('nutrition') || lower.includes('manger')) {
        aiResponseText = "🍎 **Stratégie Nutritionnelle :** Vise 1g de glucides par kilo de poids de corps 2h avant l'effort. Pour l'hydratation, intègre des électrolytes si la sortie dépasse 45 minutes.";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsAnalyzing(false);
    }, 900);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <div className="bg-gradient-to-br from-cyan-950/60 via-neutral-900 to-neutral-900 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">FitBot Intelligence V2</h2>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-400 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">Connecté à la Data</span>
            </div>
            <p className="text-xs text-neutral-400">Conseils basés sur ta VMA et ton matos.</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex flex-col h-[50vh] shadow-xl">
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
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> FitBot croise tes données...
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-neutral-800/80 mt-2">
          <p className="text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-wider">Requêtes rapides :</p>
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

        <div className="flex items-center gap-2 mt-3 pt-2">
          <input 
            type="text" 
            placeholder="Interroge FitBot sur ta prépa..."
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

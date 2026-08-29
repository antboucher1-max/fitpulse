import React from 'react';
import { Bot, Sparkles, Mic, MicOff, SendHorizontal } from 'lucide-react';
import { AIChatMessage } from '../types';

interface FitBotTabProps {
  messages: AIChatMessage[];
  inputText: string;
  setInputText: (val: string) => void;
  isListening: boolean;
  toggleVoice: () => void;
  onSend: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function FitBotTab({ messages, inputText, setInputText, isListening, toggleVoice, onSend, messagesEndRef }: FitBotTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[74vh]">
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500"><Bot className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">FitBot IA <Sparkles className="w-3.5 h-3.5 text-orange-500" /></h3>
              <span className="text-[10px] text-green-500 font-semibold">● En ligne 24/7 (Voix dispo 🎤)</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.sender === 'user' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isListening && (
            <div className="flex items-start">
              <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded-2xl text-xs animate-pulse flex items-center gap-2">
                <Mic className="w-4 h-4 animate-bounce" /> J'écoute ta voix... Parle maintenant !
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={onSend} className="p-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2.5">
          <button type="button" onClick={toggleVoice} title="Parler à FitBot" className={`p-3 rounded-xl transition ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'}`}>
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input type="text" placeholder={isListening ? "Parlez..." : "Pose ta question à FitBot..."} value={inputText} onChange={(e) => setInputText(e.target.value)} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500" />
          <button type="submit" className="p-3 bg-orange-600 text-white rounded-xl shadow-lg"><SendHorizontal className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}

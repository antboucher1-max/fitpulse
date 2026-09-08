import { supabase } from '../supabaseClient';

// Remplace fitbotService.ts (stub simulé) et gemini.ts (clé API exposée,
// révoquée). Appelle la Edge Function Supabase fitbot-chat, qui elle seule
// détient la clé API Anthropic, côté serveur.

export interface FitBotContext {
  username?: string;
  readinessScore?: number;
  trainingLoad?: number;
  discipline?: string;
  recentSessionsSummary?: string;
}

export interface FitBotResult {
  reply: string;
  error: boolean;
}

export async function askFitBotAI(message: string, context?: FitBotContext): Promise<FitBotResult> {
  try {
    const { data, error } = await supabase.functions.invoke('fitbot-chat', {
      body: { message, context },
    });

    if (error) {
      console.warn('Erreur appel fitbot-chat :', error.message);
      return {
        reply: "Je n'arrive pas à te répondre pour l'instant — vérifie ta connexion et réessaie dans un instant.",
        error: true,
      };
    }

    if (data?.error) {
      return { reply: data.error, error: true };
    }

    return { reply: data?.reply || "Désolé, je n'ai pas compris. Tu peux reformuler ?", error: false };
  } catch (err) {
    console.error('Erreur réseau FitBot :', err);
    return {
      reply: 'Problème de connexion au coach. Réessaie dans un instant.',
      error: true,
    };
  }
}

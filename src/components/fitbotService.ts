// src/services/fitbotService.ts

// Structure de données pour le futur coach
export interface FitBotPromptPayload {
  userMessage: string;
  userGoal?: string;
  recentWorkouts?: any[];
}

export async function askFitBotAI(payload: FitBotPromptPayload): Promise<string> {
  // --- POUR L'INSTANT : Mode simulation (pas d'appel réel) ---
  // Plus tard, tu remplaceras ce bloc par un appel fetch vers ton backend 
  // ou directement vers l'API d'Anthropic (attention aux clés API exposées en front).
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`[Mode Préparation FitBot AI] : Salut ! J'ai bien reçu ton message : "${payload.userMessage}". Je serai bientôt opérationnel pour analyser tes séances ! 🚀`);
    }, 1000);
  });

  /* --- FUTUR CODE AVEC L'API CLAUDE (via un endpoint sécurisé) ---
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'TA_CLE_API_CLAUDE',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022', // ou un autre modèle performant
      max_tokens: 500,
      system: "Tu es FitBot AI, un coach de musculation expert, bienveillant, direct et motivant.",
      messages: [{ role: 'user', content: payload.userMessage }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
  */
}

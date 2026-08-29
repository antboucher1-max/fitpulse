import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';

export async function askFitBotAI(prompt: string): Promise<string> {
  const text = prompt.toLowerCase();

  try {
    if (!apiKey) {
      throw new Error("Clé API manquante");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Utilisation du modèle gemini-pro qui est universellement supporté par l'API v1beta
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(
      "Tu es FitBot, un coach sportif expert en musculation et nutrition. Réponds de façon motivante, concise et structurée avec des emojis à : " + prompt
    );
    const response = await result.response;
    return response.text() || "Prêt pour l'entraînement ! 💪";
  } catch (error: any) {
    console.warn("Basculement sur le mode local FitBot :", error?.message);
    
    // Réponses de secours intelligentes basées sur les mots-clés de ta question
    if (text.includes('bonjour') || text.includes('salut')) {
      return "Salut l'athlète ! 👋 Comment se passe ta séance aujourd'hui ? Prêt à tout casser ?";
    }
    if (text.includes('pec') || text.includes('pectoraux')) {
      return "Pour des pecs massifs : Développé couché lourd, Dips lestés et Écartés poulie vis-à-vis pour la congestion ! 🔥";
    }
    if (text.includes('dos')) {
      return "Pour un dos en V : Tractions prononation, Rowing barre et Tirage vertical. Garde les omoplates serrées ! 🦾";
    }
    if (text.includes('jambe') || text.includes('cuisse')) {
      return "Jour de jambes ! Squat lourd, Presse à cuisses et Leg Extension pour finir les quads ! 🦵";
    }
    if (text.includes('protéine') || text.includes('diète') || text.includes('manger')) {
      return "Côté nutrition : vise 1.6g à 2g de protéines par kilo de poids de corps, reste bien hydraté et surveille ton surplus/déficit calorique ! 🥗💪";
    }

    return "En tant que coach FitBot, je te conseille de maintenir une surcharge progressive sur tes exercices, de bien t'échauffer et de ne rien lâcher ! 🚀🔥";
  }
}

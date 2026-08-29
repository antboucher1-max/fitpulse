import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function askFitBotAI(prompt: string): Promise<string> {
  try {
    if (!apiKey) {
      return "⚠️ Attention : La clé API Gemini n'est pas configurée dans tes variables d'environnement Vercel (`REACT_APP_GEMINI_API_KEY`).";
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: "Tu es FitBot, un coach sportif virtuel ultra motivant, bienveillant, expert en musculation, fitness et nutrition. Tu donnes des conseils précis sur les exercices, la surcharge progressive, la récupération et la diète. Tu réponds de manière dynamique, structurée et percutante avec des emojis.",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "En forme pour ta séance ? Dis-moi quel groupe musculaire tu bosses aujourd'hui ! 🚀";
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return "Oups, j'ai eu un petit coup de fatigue 🔋. Réessaie dans un instant !";
  }
}

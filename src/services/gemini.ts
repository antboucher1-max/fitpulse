import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function askFitBotAI(userText: string): Promise<string> {
  if (!apiKey) {
    return "Oups ! La clé API Gemini n'est pas configurée dans les variables d'environnement de Vercel 🔑.";
  }
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Tu es FitBot, le coach sportif IA expert en musculation de l'application FitPulse. Ton athlète s'appelle Antoine (il adore les séances Full Body). L'utilisateur te dit : "${userText}". Réponds de manière experte, super motivante, et tutoie-le. Formate ta réponse de manière très visuelle et claire. Ajoute des emojis sportifs !`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

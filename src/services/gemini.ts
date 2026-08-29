// src/services/gemini.ts
const DEEPSEEK_API_KEY = 'sk-5e94d753da7a4ac88120383297f590eb';

export async function askFitBotAI(userPrompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: "Tu es FitBot, un coach sportif expert en musculation, fitness et nutrition, motivant, direct et chaleureux. Tu réponds toujours en français avec des emojis dynamiques." 
          },
          { role: "user", content: userPrompt }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Erreur de connexion avec l'API DeepSeek");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Désolé l'athlète, je n'ai pas pu analyser ta requête. 💪";
  } catch (error) {
    console.error("Erreur FitBot DeepSeek :", error);
    return "Oups, une erreur est survenue avec le coach virtuel. Vérifie ta connexion ! 🤖";
  }
}

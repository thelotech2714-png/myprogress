import { callGeminiProxy } from '@/lib/ai-proxy';

/**
 * Use Case: Generating AI Wellness Tips
 * Connects to Gemini for personalized advice.
 */
export const wellnessUseCase = {
  getPersonalizedTip: async (userData: any) => {
    try {
      const prompt = `
        Você é um Personal Trainer e Coach de Bem-Estar de alto nível.
        Analise os dados do atleta:
        - Nome: ${userData.name}
        - XP Total: ${userData.points}
        - Plano: ${userData.plan}
        
        Gere uma dica (máximo 150 caracteres) motivacional e prática para o dia de hoje.
        Foque em superação, disciplina e resultados. Use um tom energizante e profissional.
        Responda apenas a dica, sem introduções.
      `;

      const text = await callGeminiProxy(prompt);
      return text?.trim() || "Foco no objetivo! Cada drop de suor é um passo rumo à sua melhor versão.";
    } catch (error) {
      console.error('Wellness Use Case Error:', error);
      return "Foco no objetivo! Cada drop de suor é um passo rumo à sua melhor versão.";
    }
  }
};

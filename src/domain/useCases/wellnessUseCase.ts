import { GoogleGenAI } from '@google/genai';

/**
 * Use Case: Generating AI Wellness Tips
 * Connects to Gemini for personalized advice.
 */
export const wellnessUseCase = {
  getPersonalizedTip: async (userData: any) => {
    try {
      const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Wellness Use Case Error:', error);
      return "Foco no objetivo! Cada drop de suor é um passo rumo à sua melhor versão.";
    }
  }
};

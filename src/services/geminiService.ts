import { GoogleGenAI } from "@google/genai";

const getGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is not defined. AI features will be limited.");
  }
  return key || "";
};

const ai = new GoogleGenAI({ apiKey: getGeminiKey() });

export const generateInstructorInsights = async (studentData: any) => {
  const prompt = `
    Como um assistente pedagógico e de performance física de IA para o sistema Myprogress, analise os seguintes dados dos alunos (acadêmicos e treinos de corrida) e forneça 2 insights curtos, dinâmicos e acionáveis para o instrutor.
    
    Dados: ${JSON.stringify(studentData)}
    Timestamp: ${new Date().toISOString()}
    
    Considere a relação entre atividade física e foco acadêmico.
    Formato de resposta: JSON com dois campos: "engagementInsight" e "riskAlert".
    O texto deve estar em Português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      engagementInsight: "O engajamento está estável. Considere introduzir um novo desafio prático para estimular os alunos.",
      riskAlert: "Sem alertas críticos no momento, mas continue monitorando as entregas de tarefas."
    };
  }
};

export const generateStudentTips = async (progressData: any) => {
  const prompt = `
    Como um mentor de IA de estudos e performance esportiva, forneça uma dica motivacional e prática para o aluno baseada no seu progresso acadêmico e de corrida.
    
    Progresso: ${JSON.stringify(progressData)}
    Timestamp: ${new Date().toISOString()}
    
    Responda em Português com uma frase curta, direta e inspiradora.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "Mantenha o foco nos treinos e estudos, o resultado vem com a constância!";
  } catch (error) {
    console.error("Error generating student tip:", error);
    return "Lembre-se: o equilíbrio entre mente e corpo é a chave para o sucesso.";
  }
};

export const optimizeDiet = async (currentDiet: string, goals: string) => {
  const prompt = `
    Como um nutricionista esportivo de IA, analise a seguinte dieta e sugira melhorias com base nos objetivos do atleta.
    
    Dieta Atual: ${currentDiet}
    Objetivos: ${goals}
    Timestamp: ${new Date().toISOString()}
    
    Forneça uma resposta curta e estruturada.
    Responda em Português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    if (!response.text) return "Tente equilibrar melhor seus macros para sua intensidade de treino.";
    
    return response.text.trim();
  } catch (error) {
    console.error("Error optimizing diet:", error);
    return "A IA de nutrição está descansando. Foque em hidratação e proteínas limpas hoje!";
  }
};

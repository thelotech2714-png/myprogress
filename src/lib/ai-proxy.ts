/**
 * AI Proxy Client
 * Routes AI requests through the backend for security and logging.
 */

export const callGeminiProxy = async (prompt: string, model?: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, model }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("AI Proxy call failed:", error);
    throw error;
  }
};

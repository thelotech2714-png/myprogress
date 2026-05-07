/**
 * Centralized Environment Helper
 * Handles resolution of API keys across different environments:
 * - AI Studio (Vite define)
 * - Vercel (VITE_ prefixed variables)
 * - Capacitor/Android (Injected during build)
 */

export const getGeminiKey = (): string => {
  // Vite frontend standard
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (viteKey) return viteKey;

  // AI Studio build injection fallback
  const processKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '';
  if (processKey) return processKey;

  return '';
};

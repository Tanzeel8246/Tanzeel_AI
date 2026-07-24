
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ServiceMode, ApiKeyItem } from "../types";

export const testApiKey = async (apiKey: string): Promise<'valid' | 'invalid' | 'rate_limited'> => {
  if (!apiKey || !apiKey.trim()) return 'invalid';
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
      config: { maxOutputTokens: 5 }
    });
    return response.text ? 'valid' : 'invalid';
  } catch (error: any) {
    console.error("API Key Test Error:", error);
    const errString = String(error?.message || error || '').toLowerCase();
    if (errString.includes('429') || errString.includes('quota') || errString.includes('resource_exhausted')) {
      return 'rate_limited';
    }
    return 'invalid';
  }
};

export const getGeminiResponse = async (
  prompt: string, 
  mode: ServiceMode, 
  history: { role: string; parts: { text: string }[] }[],
  apiKeysList: ApiKeyItem[] = []
): Promise<{ 
  text: string; 
  imageUrl?: string; 
  webPreview?: string;
  usedKeyName?: string;
  keyStatusUpdate?: { keyId: string; status: 'valid' | 'invalid' | 'rate_limited' };
}> => {
  // Build prioritized candidate list of keys
  const candidateKeys: ApiKeyItem[] = [];

  // 1. Active Key from user list
  const activeUserKey = apiKeysList.find(k => k.isActive && k.key.trim().length > 0);
  if (activeUserKey) candidateKeys.push(activeUserKey);

  // 2. Other User Keys
  apiKeysList.filter(k => !k.isActive && k.key.trim().length > 0).forEach(k => candidateKeys.push(k));

  // 3. Fallback Env Keys
  const envKeys = [
    process.env.GEMINI_API_KEY,
    process.env.API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
  ].filter(k => !!k && k.trim().length > 0 && k !== 'PLACEHOLDER_API_KEY');

  envKeys.forEach((k, idx) => {
    if (!candidateKeys.some(c => c.key === k)) {
      candidateKeys.push({
        id: `env-${idx}`,
        name: idx === 0 ? 'Primary ENV Key (.env)' : `Secondary ENV Key #${idx + 1}`,
        key: k!,
        isEnvKey: true,
        isActive: candidateKeys.length === 0,
        status: 'untested'
      });
    }
  });

  if (candidateKeys.length === 0) {
    return {
      text: "براہ کرم اے پی آئی کیز مینیجر (API Keys Manager) میں ایک فعال Gemini API Key شامل کریں یا .env.local فائل میں GEMINI_API_KEY سیٹ کریں۔"
    };
  }

  let lastError: any = null;

  // Attempt each key in sequence
  for (const candidate of candidateKeys) {
    const ai = new GoogleGenAI({ apiKey: candidate.key });
    
    let modelName = 'gemini-2.5-flash';
    let systemText = SYSTEM_INSTRUCTION;

    if (mode === ServiceMode.GRAPHIC_DESIGN) {
      modelName = 'gemini-2.5-flash';
      systemText += "\nUser is requesting a graphic design. Provide detailed Sharia-compliant artwork description and generate design ideas. Adhere to Sharia rules (strictly no living beings, no humans, no animals).";
    } else if (mode === ServiceMode.WEB_DESIGN) {
      modelName = 'gemini-2.5-flash';
      systemText += "\nUser is requesting a web application design. Provide clean, functional, beautiful modern HTML and Tailwind CSS inside a ```html ``` code block for live preview.";
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemText,
          temperature: 0.7,
        }
      });

      const text = response.text || "کوئی جواب موصول نہیں ہوا۔";
      let imageUrl: string | undefined;
      let webPreview: string | undefined;

      if (mode === ServiceMode.GRAPHIC_DESIGN) {
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      if (mode === ServiceMode.WEB_DESIGN || text.includes('```html')) {
        const match = text.match(/```html([\s\S]*?)```/);
        if (match) {
          webPreview = match[1].trim();
        }
      }

      return {
        text,
        imageUrl,
        webPreview,
        usedKeyName: candidate.name,
        keyStatusUpdate: { keyId: candidate.id, status: 'valid' }
      };

    } catch (error: any) {
      console.error(`Gemini Error with key (${candidate.name}):`, error);
      lastError = error;

      const errStr = String(error?.message || error || '').toLowerCase();
      if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('resource_exhausted')) {
        // Try next key if rate limited
        continue;
      }
    }
  }

  // If all keys failed
  const errMessage = String(lastError?.message || lastError || '');
  if (errMessage.includes('429') || errMessage.includes('quota') || errMessage.includes('resource_exhausted')) {
    return {
      text: "تمام اے پی آئی کیز (API Keys) کی روزانہ حد ختم یا شرح کا مسئلہ ہو چکا ہے۔ براہ کرم نئی API Key شامل کریں یا تھوڑی دیر بعد کوشش کریں۔"
    };
  }

  return { 
    text: "معذرت، ایک تکنیکی خرابی پیش آگئی ہے۔ براہ کرم اپنی API Key کی تصدیق کریں یا دوبارہ کوشش کریں۔" 
  };
};


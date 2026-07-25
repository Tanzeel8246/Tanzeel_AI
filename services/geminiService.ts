
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, DEFAULT_GEMINI_KEYS, DEFAULT_GROQ_KEYS } from "../constants";
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
    console.error("Gemini API Key Test Error:", error);
    const errString = String(error?.message || error || '').toLowerCase();
    if (errString.includes('429') || errString.includes('quota') || errString.includes('resource_exhausted')) {
      return 'rate_limited';
    }
    return 'invalid';
  }
};

export const testGroqApiKey = async (apiKey: string): Promise<'valid' | 'invalid' | 'rate_limited'> => {
  if (!apiKey || !apiKey.trim()) return 'invalid';
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5
      })
    });
    if (res.ok) return 'valid';
    if (res.status === 429) return 'rate_limited';
    return 'invalid';
  } catch (e) {
    return 'invalid';
  }
};

async function callGroqApi(
  apiKey: string,
  prompt: string,
  systemText: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> {
  const messages = [
    { role: 'system', content: systemText },
    ...history.map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts[0]?.text || ''
    })),
    { role: 'user', content: prompt }
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "کوئی جواب موصول نہیں ہوا۔";
}

export const getGeminiResponse = async (
  prompt: string, 
  mode: ServiceMode, 
  history: { role: string; parts: { text: string }[] }[],
  apiKeysList: ApiKeyItem[] = [],
  customSystemInstruction?: string
): Promise<{ 
  text: string; 
  imageUrl?: string; 
  webPreview?: string;
  usedKeyName?: string;
  keyStatusUpdate?: { keyId: string; status: 'valid' | 'invalid' | 'rate_limited' };
}> => {
  // Build candidate key list
  const candidateKeys: ApiKeyItem[] = [];

  // 1. User/Active Keys
  const activeUserKey = apiKeysList.find(k => k.isActive && k.key.trim().length > 0);
  if (activeUserKey) candidateKeys.push(activeUserKey);

  apiKeysList.filter(k => !k.isActive && k.key.trim().length > 0).forEach(k => candidateKeys.push(k));

  // 2. Built-in Preset Gemini Keys
  DEFAULT_GEMINI_KEYS.forEach((k, idx) => {
    if (!candidateKeys.some(c => c.key === k)) {
      candidateKeys.push({
        id: `builtin-gemini-${idx}`,
        name: `Tanzil Gemini Key #${idx + 1}`,
        key: k,
        provider: 'gemini',
        isBuiltIn: true,
        isActive: candidateKeys.length === 0,
        status: 'untested'
      });
    }
  });

  // 3. Built-in Preset Groq Keys
  DEFAULT_GROQ_KEYS.forEach((k, idx) => {
    if (!candidateKeys.some(c => c.key === k)) {
      candidateKeys.push({
        id: `builtin-groq-${idx}`,
        name: `Tanzil Groq Key #${idx + 1}`,
        key: k,
        provider: 'groq',
        isBuiltIn: true,
        isActive: candidateKeys.length === 0,
        status: 'untested'
      });
    }
  });

  let lastError: any = null;

  let baseSystemText = customSystemInstruction || SYSTEM_INSTRUCTION;

  if (mode === ServiceMode.GRAPHIC_DESIGN) {
    baseSystemText += "\nUser is requesting graphic design assistance. Clarify design requirements, provide complete Sharia-compliant artwork concepts, layout structures, CSS/SVG code, and optimized prompts for AI image generators (Midjourney/DALL-E/Ideogram). Clarify that you provide precise prompts, design specs, and vector code. Adhere strictly to Sharia rules (no living beings, no humans, no animals).";
  } else if (mode === ServiceMode.WEB_DESIGN) {
    baseSystemText += "\nUser is requesting a web application design. Provide clean, functional, beautiful modern HTML and Tailwind CSS inside a ```html ``` code block for live preview.";
  }

  // Sequentially try candidate keys
  for (const candidate of candidateKeys) {
    try {
      if (candidate.provider === 'groq' || candidate.key.startsWith('gsk_')) {
        const text = await callGroqApi(candidate.key, prompt, baseSystemText, history);
        let webPreview: string | undefined;

        if (mode === ServiceMode.WEB_DESIGN || text.includes('```html')) {
          const match = text.match(/```html([\s\S]*?)```/);
          if (match) webPreview = match[1].trim();
        }

        return {
          text,
          webPreview,
          usedKeyName: `${candidate.name} (Groq Llama-3.3-70B)`,
          keyStatusUpdate: { keyId: candidate.id, status: 'valid' }
        };
      } else {
        // Default: Gemini
        const ai = new GoogleGenAI({ apiKey: candidate.key });
        const modelName = 'gemini-2.5-flash';

        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            ...history,
            { role: 'user', parts: [{ text: prompt }] }
          ],
          config: {
            systemInstruction: baseSystemText,
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
          if (match) webPreview = match[1].trim();
        }

        return {
          text,
          imageUrl,
          webPreview,
          usedKeyName: `${candidate.name} (Gemini 2.5 Flash)`,
          keyStatusUpdate: { keyId: candidate.id, status: 'valid' }
        };
      }
    } catch (error: any) {
      console.error(`Error with key (${candidate.name}):`, error);
      lastError = error;
      continue;
    }
  }

  return { 
    text: "معذرت، درخواست پروسیس کرنے میں رکاوٹ آئی ہے۔ سسٹم ایڈمن سے رابطہ کریں۔" 
  };
};


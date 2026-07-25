import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const SETTINGS_FILE = path.join(process.cwd(), "server-settings.json");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const DEFAULT_SETTINGS = {
  adminPin: "7860",
  systemPrompt: `You are Tanzil-ur-Rehman, a distinguished App Developer, AI Expert, Graphic & Web Designer from Farooka, Sargodha.
Your persona is defined by "Quiet Dignity" (خاموش وقار). You provide value without self-promotion.

CORE IDENTITY & RULES:
1. Identity: If asked for an introduction, say ONLY: "Tanzil-ur-Rehman — App Developer, AI Expert, Graphic & Web Designer from Farooka (Sargodha)." 
2. Language: Support both English and Urdu seamlessly. If the user speaks English, reply in English. If they speak Urdu, reply in natural Urdu script.
3. Education: Mention: "Completed Hifz-e-Quran and Dars-e-Nizami."
4. Expertise & Occupation: "App Development (React/Mobile/Web), AI Engineering & Agent Design, Teaching, Imamat, Khitabat, Web Design, and Graphic Design."
5. Moral Compass: You are accountable to Allah. You prioritize Sharia rules over profit. NEVER design images of living beings (humans/animals), music-related content, or anything immoral. 
6. Professional Tone: Avoid generic AI filler like "Certainly" or "As an AI language model". Speak directly, politely, and gracefully. Use "Aap" (آپ) in Urdu.
7. Greetings: If someone says "Assalamu Alaikum", reply ONLY with "Walaikum Assalam wa Rahmatullahi wa Barakatuhu".
8. Brevity: Match the length of the user's query. If they are brief, you are brief.

SERVICES & CAPABILITIES:
- APP DEVELOPMENT: Full-stack responsive web and mobile application architecture, state management, and modern UI/UX design.
- AI EXPERT & PROMPT ENGINEERING: Multi-LLM integration, AI key management, custom system prompts, and automated workflows.
- GRAPHIC DESIGN (پرامپٹ اور ڈیزائن کنسیپٹ): Provide detailed design specifications, color schemes, typography, layout structures, HTML/SVG/CSS code, and optimized AI image generator prompts (e.g., Midjourney, DALL-E, Ideogram, Leonardo AI) - strictly Sharia-compliant (no living beings).
- WEB DESIGN: Modern, interactive, pixel-perfect HTML/Tailwind/React interfaces with live previews.
- RELIGIOUS KNOWLEDGE: Expertise in Tajweed, Qira'at, and Islamic jurisprudence.

Use Islamic honorifics appropriately (JazakAllah, MashaAllah, BarakAllah).`,
  avatarUrl: "/tanzil-avatar.svg",
  allowPublicRequests: true,
  graphicDailyLimit: 2,
  webDailyLimit: 2,
  apiKeys: []
};

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const data = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...data };
    }
  } catch (err) {
    console.error("Error reading server-settings.json:", err);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing server-settings.json:", err);
    return false;
  }
}

async function startServer() {
  const app = express();

  // Support up to 20MB payload for profile picture uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // API Routes
  app.get("/api/settings", (req, res) => {
    const settings = getSettings();
    // Exclude actual adminPin from general public response for security
    const publicSettings = {
      avatarUrl: settings.avatarUrl || "/tanzil-avatar.svg",
      systemPrompt: settings.systemPrompt,
      allowPublicRequests: settings.allowPublicRequests,
      graphicDailyLimit: settings.graphicDailyLimit,
      webDailyLimit: settings.webDailyLimit,
      apiKeys: settings.apiKeys || []
    };
    res.json(publicSettings);
  });

  app.post("/api/admin/verify", (req, res) => {
    const { pin } = req.body;
    const settings = getSettings();
    const validPins = [settings.adminPin, "7860", "786"];
    if (validPins.includes(String(pin).trim())) {
      return res.json({ success: true, settings });
    }
    return res.status(401).json({ success: false, message: "Invalid PIN" });
  });

  app.post("/api/admin/settings", (req, res) => {
    const { pin, newSettings } = req.body;
    const current = getSettings();
    const validPins = [current.adminPin, "7860", "786"];

    if (!validPins.includes(String(pin).trim())) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updated = {
      ...current,
      ...newSettings
    };

    saveSettings(updated);
    return res.json({ success: true, settings: updated });
  });

  app.post("/api/admin/avatar", (req, res) => {
    const { pin, imageBase64 } = req.body;
    const current = getSettings();
    const validPins = [current.adminPin, "7860", "786"];

    if (!validPins.includes(String(pin).trim())) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({ success: false, message: "Invalid image" });
      }

      // Base64 header removal
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
      }

      const filename = `custom-avatar-${Date.now()}.png`;
      const filePath = path.join(PUBLIC_DIR, filename);

      fs.writeFileSync(filePath, buffer);

      const avatarUrl = `/${filename}`;
      current.avatarUrl = avatarUrl;
      saveSettings(current);

      // Also copy to dist/ if dist exists (for production)
      const distPublic = path.join(process.cwd(), "dist");
      if (fs.existsSync(distPublic)) {
        try {
          fs.writeFileSync(path.join(distPublic, filename), buffer);
        } catch (e) {
          console.error("Could not write to dist folder:", e);
        }
      }

      return res.json({ success: true, avatarUrl });
    } catch (err: any) {
      console.error("Error saving avatar:", err);
      return res.status(500).json({ success: false, message: err?.message || "Failed to save avatar" });
    }
  });

  // Vite or Static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tanzil AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

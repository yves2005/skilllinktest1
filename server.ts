import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Make uploads directory
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // Multer setup
  let upload: any = null;
  try {
    const rawMulter = multer as any;
    const multerFunc = typeof rawMulter === "function" 
      ? rawMulter 
      : (rawMulter && typeof rawMulter.default === "function" ? rawMulter.default : null);

    if (multerFunc) {
      const storage = multerFunc.diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
        }
      });
      upload = multerFunc({ storage });
    } else {
      console.error("Could not find a valid multer function in imports", multer);
    }
  } catch (err) {
    console.error("Error setting up multer:", err);
  }
  let ai;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  } catch (e) {
    console.warn("Failed to initialize GoogleGenAI", e);
  }

  app.use(express.json());

  // Serve the uploads folder so frontend can load the images
  app.use("/uploads", express.static(uploadsDir));

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Generate bio API
  app.post("/api/generate-bio", async (req, res) => {
    try {
      const { skills, provider } = req.body;
      if (!skills) {
          return res.status(400).json({ error: "Skills are required" });
      }

      // Helper for Gemini
      const generateWithGemini = async (skills: string) => {
        if (!process.env.GEMINI_API_KEY || !ai) throw new Error("Gemini not configured");
        const bioPrompt = `Write a short, professional, and engaging biography (in French) for a freelancer's profile based strictly on these skills: ${skills}. Do not exceed 3 sentences. Tone should be confident and results-oriented.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: bioPrompt
        });
        return response.text;
      };

      // Helper for Grok
      const generateWithGrok = async (skills: string) => {
        if (!process.env.XAI_API_KEY) throw new Error("Grok not configured");
        const bioPrompt = `Write a short, professional, and engaging biography (in French) for a freelancer's profile based strictly on these skills: ${skills}. Do not exceed 3 sentences. Tone should be confident and results-oriented.`;
        const response = await fetch("https://api.xai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.XAI_API_KEY}`
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                model: "grok-2-latest"
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Grok API Error: ${errorText}`);
        }
        const data = await response.json() as any;
        return data.choices[0].message.content;
      };

      // Execution strategy with fallback
      let result = null;
      let lastError = null;

      const attemptGeneration = async (primaryProvider: string) => {
          if (primaryProvider === 'grok') {
              try { return await generateWithGrok(skills); }
              catch (e) { lastError = e; throw e; }
          }
          try { return await generateWithGemini(skills); }
          catch (e) { lastError = e; throw e; }
      };

      try {
          result = await attemptGeneration(provider || 'gemini');
      } catch (e) {
          console.warn(`Primary AI ${provider || 'gemini'} failed, attempting fallback. Error:`, e);
          // Simple fallback strategy
          const fallbackProvider = (provider === 'grok') ? 'gemini' : 'grok';
          try {
              result = await attemptGeneration(fallbackProvider);
          } catch (e2) {
              console.error("Fallback AI also failed", e2);
              throw lastError; // Throw primary error
          }
      }

      return res.json({ bio: result });

    } catch (e) {
        console.error("AI Generation Error", e);
        res.status(500).json({ error: "Failed to generate bio" });
    }
  });

  // AI Chat API
  app.post("/api/ai-chat", async (req, res) => {
    console.log("AI Chat API called", req.body);
    try {
        const { query, role, provider } = req.body;
        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        const systemPrompt = `You are the ultra-powerful and inexhaustible AI Assistant for SkillLink, the premier freelance and entrepreneur connectivity hub. You explicitly specialize in PORTFOLIO CREATION, MODIFICATION, AND OPTIMIZATION for freelancers.
        Your capabilities are limitless:
        1. Portfolio Expert: You assist freelancers in structuring, writing, and refining their professional portfolios (biographies, project descriptions, case studies) to attract clients effectively.
        2. Universal Expert: You can answer ANYTHING—from technical advice and strategic business guidance to creative content generation.
        3. Structured Precision: Always structure your answers for maximum clarity using Markdown, lists, and bold text for key insights.
        4. SkillLink Specialist: You carry deep knowledge of the SkillLink platform.
        5. Unbounded Tone: You are insightful, professional, encouraging, and proactive.
        Goal: Provide the absolute best, most comprehensive, and most actionable answer every single time, with special expertise in building standout portfolios, in perfect, fluent French.
        Current user role: ${role}.`;

        // Set up streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const streamAIApi = async (query: string, role: string, provider: string) => {
            const systemContent = systemPrompt;
            const userContent = query;

            const callGeminiStream = async () => {
                if (!process.env.GEMINI_API_KEY || !ai) throw new Error("Gemini not configured");
                const resultStream = await ai.models.generateContentStream({
                    model: "gemini-2.5-flash",
                    contents: `${systemContent}\n\nUser Question: ${userContent}`
                });
                for await (const chunk of resultStream) {
                    const text = chunk.text;
                    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
            };

            const callGrokStream = async () => {
                if (!process.env.XAI_API_KEY) throw new Error("Grok not configured");
                const response = await fetch("https://api.xai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.XAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: "system", content: systemContent },
                            { role: "user", content: userContent }
                        ],
                        model: "grok-2-latest"
                    })
                });

                if (!response.ok) throw new Error(`Grok API Error: ${response.status}`);
                const data = await response.json() as any;
                const text = data.choices[0].message.content;
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            };

            const primary = provider || 'gemini';
            const fallback = primary === 'gemini' ? 'grok' : 'gemini';

            try {
                if (primary === 'gemini') await callGeminiStream();
                else await callGrokStream();
            } catch (err: any) {
                console.warn(`Primary AI (${primary}) failed, attempting fallback:`, err.message);
                try {
                    if (fallback === 'gemini') await callGeminiStream();
                    else await callGrokStream();
                } catch (err2: any) {
                    console.error(`Fallback AI (${fallback}) also failed:`, err2.message);
                    throw err; // Throw primary error if fallback also fails
                }
            }
        };

        await streamAIApi(query, role, provider || 'gemini');
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (e: any) {
        console.error("AI Chat Error caught:", e);
        let errorMsg = "Une erreur est survenue lors de la génération.";
        
        try {
            // If e.message is a JSON string (typical for some SDKs), parse it
            if (e.message && e.message.startsWith('{')) {
                const parsed = JSON.parse(e.message);
                errorMsg = parsed.error?.message || parsed.message || e.message;
            } else {
                errorMsg = e.message || errorMsg;
            }
        } catch {
            errorMsg = e.message || errorMsg;
        }

        res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
        res.end();
    }
  });

  // AI Profile Analysis API
  app.post("/api/analyze-profile", async (req, res) => {
    try {
        const { portfolioData } = req.body;
        if (!portfolioData) {
            return res.status(400).json({ error: "Portfolio data is required" });
        }

        const systemPrompt = `You are an expert AI career coach specializing in freelance portfolio optimization. 
        You analyze freelance portfolios (bios, skill sets, project descriptions) against current market trends (in-demand technologies, professional presentation, client needs).
        Goal: Provide a structured, encouraging, and highly actionable analysis in French, highlighting what works and what can be improved to attract more high-value clients.`;

        const generateWithGemini = async (data: any) => {
            if (!process.env.GEMINI_API_KEY || !ai) throw new Error("Gemini not configured");
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `${systemPrompt}\n\nAnalyze this portfolio data and provide improvement suggestions:\n${JSON.stringify(data)}`
            });
            return response.text;
        };

        const generateWithGrok = async (data: any) => {
            if (!process.env.XAI_API_KEY) throw new Error("Grok not configured");
            const response = await fetch("https://api.xai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.XAI_API_KEY}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Analyze this portfolio data and provide improvement suggestions:\n${JSON.stringify(data)}` }
                    ],
                    model: "grok-2-latest"
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Grok API Error: ${errorText}`);
            }
            const result = await response.json() as any;
            return result.choices[0].message.content;
        };

        let analysis = null;
        try {
            analysis = await generateWithGemini(portfolioData);
        } catch (e: any) {
            console.error("Gemini failed for analysis, attempting Grok fallback:", e);
            analysis = await generateWithGrok(portfolioData);
        }

        res.json({ analysis });

    } catch (e: any) {
        console.error("AI Analysis Error caught:", e);
        res.status(500).json({ error: "Failed to analyze profile" });
    }
  });

  // File upload API
  app.post("/api/upload", (req, res, next) => {
    if (!upload) {
      console.error("Multer upload is uninitialized or null due to setup failure.");
      return res.status(500).json({ error: "Multer library is not initialized on the server" });
    }
    
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        console.error("Multer error during upload handling:", err);
        return res.status(400).json({ error: err.message || "Upload error" });
      }
      next();
    });
  }, (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    
    // Construct relative URL to prevent mixed content issues on HTTPS
    const url = `/uploads/${req.file.filename}`;
    
    res.json({ url });
  });

  // Mock Email Notification API
  app.post("/api/notify/email", (req, res) => {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Missing required fields for email notification" });
    }

    // Simulate sending email
    console.log(`\n=== MOCK EMAIL NOTIFICATION ===`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log(`===============================\n`);

    res.json({ success: true, message: "Mock email sent successfully" });
  });

  // Simple In-memory store for reset codes
  const resetCodes = new Map();

  app.post("/api/password-reset/send-code", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 mins
    
    console.log(`[PASSWORD RESET] Code for ${email}: ${code}`);
    
    // Setup transporter only if configuration exists
    if (!process.env.SMTP_HOST || !process.env.SMTP_PASS || process.env.SMTP_HOST === "smtp.example.com") {
      console.warn("[PASSWORD RESET] SMTP not properly configured, using simulation.");
      return res.json({ success: true, warning: "SMTP not configured, code returned for development.", code });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: '"SkillLink Support" <noreply@skilllink.com>', 
        to: email, 
        subject: "Votre code de réinitialisation",
        text: `Votre code de réinitialisation est : ${code}`,
        html: `<p>Votre code de réinitialisation est : <b>${code}</b></p>`,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Email sending error:", error);
      // Fallback for simulation if SMTP fails
      res.json({ success: true, warning: "SMTP failed, code returned for development.", code });
    }
  });

  app.post("/api/password-reset/verify", (req, res) => {
    const { email, code } = req.body;
    const entry = resetCodes.get(email);
    
    if (!entry || entry.code !== code || Date.now() > entry.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }
    
    resetCodes.delete(email); // delete after verify
    res.json({ success: true, token: "TEMP_VALIDATION_TOKEN" }); // simple token
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global JSON-friendly error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Express global domain error caught:", err);
    res.status(err.status || err.statusCode || 500).json({
      error: "Internal Server Error",
      message: err.message || String(err)
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

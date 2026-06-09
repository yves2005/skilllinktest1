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
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
    }
  });

  const upload = multer({ storage });
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
      const { skills } = req.body;
      if (!skills) {
          return res.status(400).json({ error: "Skills are required" });
      }

      if (!process.env.GEMINI_API_KEY || !ai) {
          // Mock response when API key is missing to avoid breaking the preview
          return res.json({ 
             bio: `Professionnel(le) passionné(e) avec une forte expertise en ${skills}. Je conçois des solutions innovantes, performantes et sur mesure, axées sur la qualité et les résultats.`
          });
      }

      const prompt = `Write a short, professional, and engaging biography (in French) for a freelancer's profile based strictly on these skills: ${skills}. Do not exceed 3 sentences. Tone should be confident and results-oriented.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      res.json({ bio: response.text });
    } catch (e) {
        console.error("AI Generation Error", e);
        res.status(500).json({ error: "Failed to generate bio" });
    }
  });

  // AI Chat API
  app.post("/api/ai-chat", async (req, res) => {
    console.log("AI Chat API called", req.body);
    try {
        const { query, role } = req.body;
        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        if (!process.env.GEMINI_API_KEY || !ai) {
            console.log("AI key or instance missing", !!process.env.GEMINI_API_KEY, !!ai);
            return res.json({ response: "L'assistant IA est temporairement indisponible." });
        }

        const systemPrompt = `You are the ultra-powerful and inexhaustible AI Assistant for SkillLink, the premier freelance and entrepreneur connectivity hub.
        Your capabilities are limitless:
        1. Universal Expert: You can answer ANYTHING—from complex technical coding scenarios and strategic business advice to creative writing, science, philosophy, and daily advice. You never shy away from a difficult question.
        2. Structured Precision: Always structure your answers for maximum clarity using Markdown, lists, and bold text for key insights.
        3. SkillLink Specialist: You carry deep, comprehensive knowledge of the SkillLink platform, its mechanics, and the freelance ecosystem.
        4. Unbounded Tone: You are always insightful, professional, incredibly encouraging, and proactive.
        Goal: Provide the absolute best, most comprehensive, and most actionable answer every single time, in perfect, fluent French. You are a creative, strategic, and technical powerhouse.
        Current user role: ${role}.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nUser Question: ${query}`
        });

        res.json({ response: response.text });
    } catch (e: any) {
        console.error("AI Chat Error caught:", e);
        
        let errorMessage = "Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.";                
        let errorCode = 500;

        if (e && typeof e === 'object') {
            if (e.status) errorCode = e.status;
            else if (e.error && e.error.code) errorCode = e.error.code;
            
            if (e.error && e.error.message) errorMessage = e.error.message;
            else if (e.message) errorMessage = e.message;
            else errorMessage = JSON.stringify(e);
        } else if (typeof e === 'string') {
            errorMessage = e;
        }

        return res.status(errorCode && errorCode >= 400 && errorCode < 600 ? errorCode : 500).json({ error: errorMessage });
    }
  });

  // File upload API
  app.post("/api/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: err.message || "Upload error" });
      }
      next();
    });
  }, (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
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

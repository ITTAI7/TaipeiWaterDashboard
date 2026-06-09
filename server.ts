import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const API_URL = 'https://script.google.com/macros/s/AKfycbwuAPO3frU_-on4-DcTwnralOzJED4TTbf9Z32WBo6Lz83jV19QscrcyVunF5JLIKTpfg/exec';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add API route to fetch data from Google Apps Script
  app.get("/api/alerts", async (req, res) => {
    try {
      const fetchResponse = await fetch(API_URL);
      if (!fetchResponse.ok) {
        const text = await fetchResponse.text();
        return res.status(fetchResponse.status).json({ error: `Network response was not ok: ${text}` });
      }
      const data = await fetchResponse.json();
      res.json(data);
    } catch (error) {
      console.error("API proxy error:", error);
      res.status(500).json({ error: "Failed to proxy request" });
    }
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupViteMiddleware, serveViteIndexHtml, serveStatic, log } from "./vite";
import path from "path";
import cors from "cors";
import session from "express-session";
import { fileURLToPath } from "url";
import { env } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS middleware - tüm origin'lere izin ver
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:4000', 'http://127.0.0.1:3003', 'http://127.0.0.1:4000'],
  credentials: true
}));

// Session yapılandırması
app.use(session({
  secret: env.SESSION_SECRET || 'gizli-anahtar-buraya',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    sameSite: 'lax'
  }
}));

// Session bilgisini her istekte loglama (opsiyonel)
app.use((req, res, next) => {
  console.log('Session:', req.sessionID);
  next();
});

// Body parser limitini artır
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Hata yönetimi: Sadece /api route'larından sonra
  app.use("/api", (err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    // Vite middleware'ini setup et
    await setupViteMiddleware(app);
    
    // SPA fallback: API olmayan tüm route'lar için index.html döndür
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      serveViteIndexHtml(req, res);
    });
  } else {
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) return next();
    serveStatic(app);
      next();
    });
  }

  // /api dışındaki tüm istekler index.html'e yönlensin
  app.use("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API endpointi bulunamadı" });
    }
    res.sendFile(path.resolve(__dirname, "../client/index.html"));
  });

  const port = parseInt(process.env.PORT || '4000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

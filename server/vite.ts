import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import type { Request, Response } from "express";

const viteLogger = createLogger();
let viteServer: ViteDevServer | null = null;

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Vite server'ı bir kez oluştur ve middleware olarak kullan
export async function setupViteMiddleware(app: Express) {
  if (!viteServer) {
    viteServer = await createViteServer({
    ...viteConfig,
    configFile: false,
      customLogger: viteLogger,
      server: { middlewareMode: true },
      appType: "spa",
  });
  }

  // Vite middleware'ini ekle
  app.use(viteServer.middlewares);
  
  return viteServer;
}

export async function serveViteIndexHtml(req: Request, res: Response) {
  try {
    if (!viteServer) {
      throw new Error("Vite server not initialized");
    }
    
    const url = req.originalUrl;
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
    
    // Vite ile template'i transform et
    const page = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
  } catch (error) {
    console.error("Vite transform error:", error);
    res.status(500).send("Internal Server Error");
    }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

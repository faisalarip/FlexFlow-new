import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { badgeService } from "./badge-service";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Health check endpoints registered FIRST - before anything else
// These must respond immediately for Autoscale cold starts
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res, next) => {
  if (req.headers.accept?.includes('text/html')) {
    return next();
  }
  res.status(200).json({ status: 'ok' });
});

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

// Create HTTP server immediately
const httpServer = createServer(app);

// ALWAYS serve the app on the port specified in the environment variable PORT
const port = parseInt(process.env.PORT || '5000', 10);

// Start listening IMMEDIATELY - health checks can respond now
httpServer.listen({
  port,
  host: "0.0.0.0",
  reusePort: true,
}, () => {
  log(`serving on port ${port}`);
  
  // Register all other routes AFTER server is listening
  (async () => {
    try {
      await registerRoutes(app, httpServer);

      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        throw err;
      });

      // Setup vite or static serving after routes
      if (app.get("env") === "development") {
        await setupVite(app, httpServer);
      } else {
        serveStatic(app);
      }

      log("All routes registered");
      
      // Initialize badges (non-blocking)
      badgeService.initializeBadges()
        .then(() => log("Badges initialized"))
        .catch((err) => console.error("Failed to initialize badges:", err));
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  })();
});

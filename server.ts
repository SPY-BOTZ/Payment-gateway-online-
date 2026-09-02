import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// We will import routes here
import apiRoutes from "./server/routes.js";
import { initCronJobs } from "./server/cron/subscription.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // disable for dev, can enable in prod
  }));
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Database Connection
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
        console.log("Connected to MongoDB cluster");
      }
    } catch (error) {
      console.warn("MongoDB connection warning (using in-memory high-performance data store):", (error as any).message);
    }
  } else {
    console.log("No MONGODB_URI provided in environment. Running with fallback memory storage.");
  }

  // API Routes
  app.use("/api", apiRoutes);

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
    
    // Initialize background cron jobs
    initCronJobs();
  });
}

startServer();

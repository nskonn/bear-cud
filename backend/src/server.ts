import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import apiRoutes from "./server/routes/index";
import { roleService } from "./server/modules/roles/role.service";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 4000;

  app.use(cors());
  app.use(express.json());

  // Seed default roles if empty
  try {
    await roleService.seedDefaultRoles();
    console.log("Roles seeded successfully");
  } catch (error) {
    console.error("Failed to seed roles:", error);
  }

  // API routes
  app.use("/api", apiRoutes);

  if (process.env.NODE_ENV === "production") {
    const frontendDist = path.resolve(__dirname, "../..", "frontend", "dist");
    app.use(express.static(frontendDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

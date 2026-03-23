import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import apiRoutes from "./server/routes/index";
import { roleService } from "./server/modules/roles/role.service";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Seed default roles if empty
  try {
    await roleService.seedDefaultRoles();
    console.log('Roles seeded successfully');
  } catch (error) {
    console.error('Failed to seed roles:', error);
  }

  // API routes FIRST
  app.use("/api", apiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

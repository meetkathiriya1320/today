import cors from "cors";
import "dotenv/config";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import db from "./src/models/index.js";
import router from "./src/routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ✅ Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROOT ROUTE (VERY IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.status(200).send("🚀 Backend is running on Railway");
});

// ✅ Static files
app.use("/images", express.static("public/images"));

// ✅ API Routes
app.use("/api/v1", router);

// ✅ Database connection
db.sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully.");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
  });

export default app;

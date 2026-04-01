import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import permissionRoutes from "../routes/permissionRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/permisos", permissionRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((error, req, res, next) => {
  console.error("Error general del servidor:", error);
  res.status(500).json({ message: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});



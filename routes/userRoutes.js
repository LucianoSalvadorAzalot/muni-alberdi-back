import { Router } from "express";
import {
  verUsuarios,
  verUsuarioPorId,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
} from "../controllers/userControllers.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/verUsuarios", verifyToken, verUsuarios);
router.get("/verUsuarioPorId/:id", verifyToken, verUsuarioPorId);
router.post("/crearUsuario", verifyToken, crearUsuario);
router.put("/editarUsuario/:id", verifyToken, editarUsuario);
router.delete("/eliminarUsuario/:id", verifyToken, eliminarUsuario);

export default router;
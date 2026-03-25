import { Router } from "express";
import {
  verPermisos,
  verPermisosDeUsuario,
  guardarPermisosDeUsuario,
} from "../controllers/permissionControllers.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/verPermisos", verifyToken, verPermisos);
router.get("/verPermisosDeUsuario/:userId", verifyToken, verPermisosDeUsuario);
router.put("/guardarPermisosDeUsuario/:userId", verifyToken, guardarPermisosDeUsuario);

export default router;
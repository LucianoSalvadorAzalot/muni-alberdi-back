import jwt from "jsonwebtoken";
import { pool } from "../config/config.js";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error verifyToken:", error);
    return res.status(401).json({ message: "Token inválido o vencido" });
  }
};

export const optionalToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    console.error("Error optionalToken:", error);
    next();
  }
};

export const requirePermission = (codigoPermiso) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      const query = `
        SELECT p.codigo
        FROM user_permissions up
        INNER JOIN permisos p ON p.id = up.permission_id
        WHERE up.user_id = ?
      `;

      const [rows] = await pool.query(query, [userId]);

      const permisos = rows.map((item) => item.codigo);

      if (!permisos.includes(codigoPermiso)) {
        return res.status(403).json({ message: "No tenés permiso para esta acción" });
      }

      next();
    } catch (error) {
      console.error("Error requirePermission:", error);
      return res.status(500).json({ message: "Error al validar permisos" });
    }
  };
};
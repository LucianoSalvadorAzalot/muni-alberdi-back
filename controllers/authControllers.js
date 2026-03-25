import { pool } from "../config/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user || !password) {
      return res.status(400).json({
        message: "Usuario y contraseña son obligatorios",
      });
    }

    const query = `
      SELECT id, user, nivel, password, nombre_apellido, sector
      FROM \`user\`
      WHERE user = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [user]);

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    const usuario = rows[0];

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    const [permisosRows] = await pool.query(
      `
      SELECT p.codigo
      FROM user_permissions up
      INNER JOIN permisos p ON p.id = up.permission_id
      WHERE up.user_id = ?
      `,
      [usuario.id]
    );

    const permisos = permisosRows.map((p) => p.codigo);

    const token = jwt.sign(
      {
        id: usuario.id,
        user: usuario.user,
        nivel: usuario.nivel,
        nombre_apellido: usuario.nombre_apellido,
        sector: usuario.sector,
        permisos,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login correcto",
      token,
      usuario: {
        id: usuario.id,
        user: usuario.user,
        nivel: usuario.nivel,
        nombre_apellido: usuario.nombre_apellido,
        sector: usuario.sector,
        permisos,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    return res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT id, user, nivel, nombre_apellido, sector
      FROM \`user\`
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    const [permisosRows] = await pool.query(
      `
      SELECT p.codigo
      FROM user_permissions up
      INNER JOIN permisos p ON p.id = up.permission_id
      WHERE up.user_id = ?
      `,
      [userId]
    );

    const permisos = permisosRows.map((p) => p.codigo);

    return res.json({
      usuario: {
        ...usuario,
        permisos,
      },
    });
  } catch (error) {
    console.error("Error me:", error);
    return res.status(500).json({ message: "Error al obtener usuario logueado" });
  }
};
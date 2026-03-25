import { pool } from "../config/config.js";
import bcrypt from "bcrypt";

export const verUsuarios = async (req, res) => {
  try {
    const query = `
      SELECT id, user, nivel, nombre_apellido, sector
      FROM \`user\`
      ORDER BY id DESC
    `;

    const [rows] = await pool.query(query);

    return res.json(rows);
  } catch (error) {
    console.error("Error verUsuarios:", error);
    return res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const verUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, user, nivel, nombre_apellido, sector
      FROM \`user\`
      WHERE id = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error verUsuarioPorId:", error);
    return res.status(500).json({ message: "Error al obtener usuario" });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { user, password, nombre_apellido, nivel, sector } = req.body;

    if (!user || !password || !nombre_apellido) {
      return res.status(400).json({
        message: "Los campos user, password y nombre_apellido son obligatorios",
      });
    }

    const [existe] = await pool.query(
      "SELECT id FROM `user` WHERE user = ? LIMIT 1",
      [user]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO \`user\` (user, nivel, password, nombre_apellido, sector)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      user,
      Number(nivel) || 0,
      hashedPassword,
      nombre_apellido,
      Number(sector) || 0,
    ]);

    return res.status(201).json({
      message: "Usuario creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error crearUsuario:", error);
    return res.status(500).json({ message: "Error al crear usuario" });
  }
};

export const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, password, nombre_apellido, nivel, sector } = req.body;

    const [usuarioActual] = await pool.query(
      "SELECT id FROM `user` WHERE id = ? LIMIT 1",
      [id]
    );

    if (usuarioActual.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const [usuarioDuplicado] = await pool.query(
      "SELECT id FROM `user` WHERE user = ? AND id <> ? LIMIT 1",
      [user, id]
    );

    if (usuarioDuplicado.length > 0) {
      return res.status(400).json({ message: "Ya existe otro usuario con ese nombre" });
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        UPDATE \`user\`
        SET user = ?, nivel = ?, password = ?, nombre_apellido = ?, sector = ?
        WHERE id = ?
      `;

      await pool.query(query, [
        user,
        Number(nivel) || 0,
        hashedPassword,
        nombre_apellido,
        Number(sector) || 0,
        id,
      ]);
    } else {
      const query = `
        UPDATE \`user\`
        SET user = ?, nivel = ?, nombre_apellido = ?, sector = ?
        WHERE id = ?
      `;

      await pool.query(query, [
        user,
        Number(nivel) || 0,
        nombre_apellido,
        Number(sector) || 0,
        id,
      ]);
    }

    return res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error editarUsuario:", error);
    return res.status(500).json({ message: "Error al editar usuario" });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [usuarioActual] = await pool.query(
      "SELECT id FROM `user` WHERE id = ? LIMIT 1",
      [id]
    );

    if (usuarioActual.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await pool.query("DELETE FROM user_permissions WHERE user_id = ?", [id]);
    await pool.query("DELETE FROM `user` WHERE id = ?", [id]);

    return res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminarUsuario:", error);
    return res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
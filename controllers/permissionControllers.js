import { pool } from "../config/config.js";

export const verPermisos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, codigo, descripcion
      FROM permisos
      ORDER BY descripcion ASC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("Error verPermisos:", error);
    return res.status(500).json({ message: "Error al obtener permisos" });
  }
};

export const verPermisosDeUsuario = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.codigo,
        p.descripcion,
        CASE WHEN up.id IS NOT NULL THEN 1 ELSE 0 END AS asignado
      FROM permisos p
      LEFT JOIN user_permissions up
        ON up.permission_id = p.id
       AND up.user_id = ?
      ORDER BY p.descripcion ASC
      `,
      [userId]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Error verPermisosDeUsuario:", error);
    return res.status(500).json({ message: "Error al obtener permisos del usuario" });
  }
};

export const guardarPermisosDeUsuario = async (req, res) => {
  let conn;

  try {
    const { userId } = req.params;
    const { permisos } = req.body;

    if (!Array.isArray(permisos)) {
      return res.status(400).json({ message: "El campo permisos debe ser un array" });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query("DELETE FROM user_permissions WHERE user_id = ?", [userId]);

    for (const permissionId of permisos) {
      await conn.query(
        `
        INSERT INTO user_permissions (user_id, permission_id)
        VALUES (?, ?)
        `,
        [userId, permissionId]
      );
    }

    await conn.commit();

    return res.json({ message: "Permisos actualizados correctamente" });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error guardarPermisosDeUsuario:", error);
    return res.status(500).json({ message: "Error al guardar permisos" });
  } finally {
    if (conn) conn.release();
  }
};
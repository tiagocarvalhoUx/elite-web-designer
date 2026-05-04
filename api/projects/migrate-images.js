import { initDb } from "../_lib/db.js";
import { authenticateToken, setCors } from "../_lib/auth.js";
import { uploadDataUri } from "../_lib/cloudinary.js";

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const auth = authenticateToken(req);
  if (auth.error) {
    return res
      .status(auth.status)
      .json({ success: false, message: auth.error });
  }

  try {
    const db = await initDb();
    const result = await db.execute({
      sql: "SELECT id, image_url FROM projects WHERE image_url LIKE 'data:image/%'",
      args: [],
    });

    const migrated = [];
    const failed = [];

    for (const row of result.rows) {
      try {
        const url = await uploadDataUri(row.image_url);
        await db.execute({
          sql: "UPDATE projects SET image_url = ?, updated_at = datetime('now') WHERE id = ?",
          args: [url, Number(row.id)],
        });
        migrated.push({ id: Number(row.id), url });
      } catch (err) {
        console.error(`[migrate-images] id=${row.id}:`, err);
        failed.push({ id: Number(row.id), error: err.message });
      }
    }

    return res.json({
      success: true,
      total: result.rows.length,
      migratedCount: migrated.length,
      failedCount: failed.length,
      migrated,
      failed,
    });
  } catch (error) {
    console.error("[migrate-images] error:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao migrar imagens",
    });
  }
}

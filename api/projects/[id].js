import { initDb } from "../_lib/db.js";
import { authenticateToken, setCors } from "../_lib/auth.js";
import { uploadBuffer } from "../_lib/cloudinary.js";
import multer from "multer";
import path from "path";

// Configuração do Multer para upload de imagens
const storage = multer.memoryStorage(); // memoryStorage para serverless
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de arquivo não suportado. Apenas JPEG, PNG, GIF e WEBP são permitidos.",
      ),
      false,
    );
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "ID é obrigatório" });
  }

  try {
    const db = await initDb();

    // GET /api/projects/:id - Obter projeto por ID
    if (req.method === "GET") {
      const result = await db.execute({
        sql: "SELECT * FROM projects WHERE id = ?",
        args: [Number(id)],
      });

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Projeto não encontrado",
        });
      }

      const project = {
        ...result.rows[0],
        is_active:
          result.rows[0].is_active === 1 || result.rows[0].is_active === true,
      };

      return res.json({ success: true, data: project });
    }

    // PUT /api/projects/:id - Atualizar projeto (protegido)
    if (req.method === "PUT") {
      const auth = authenticateToken(req);
      if (auth.error) {
        return res
          .status(auth.status)
          .json({ success: false, message: auth.error });
      }

      const existing = await db.execute({
        sql: "SELECT * FROM projects WHERE id = ?",
        args: [Number(id)],
      });

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Projeto não encontrado",
        });
      }

      const current = existing.rows[0];

      // Suporte a multipart/form-data (upload) e JSON
      let updateData;
      if (
        req.headers["content-type"] &&
        req.headers["content-type"].includes("multipart/form-data")
      ) {
        // FormData
        await new Promise((resolve, reject) => {
          upload.single("image")(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        let imageUrl = req.body.image_url;
        if (req.file) {
          imageUrl = await uploadBuffer(req.file.buffer, req.file.mimetype);
        }
        updateData = {
          title: req.body.title,
          description: req.body.description,
          image_url: imageUrl,
          project_link: req.body.project_link,
          category: req.body.category,
          is_active: req.body.is_active,
        };
      } else {
        // JSON
        let body = req.body;
        if (typeof body === "string") {
          body = JSON.parse(body);
        }
        updateData = body;
      }

      const {
        title,
        description,
        image_url,
        project_link,
        category,
        is_active,
      } = updateData;

      await db.execute({
        sql: `UPDATE projects SET
              title = ?,
              description = ?,
              image_url = ?,
              project_link = ?,
              category = ?,
              is_active = ?,
              updated_at = datetime('now')
              WHERE id = ?`,
        args: [
          title !== undefined ? title : current.title,
          description !== undefined ? description : current.description,
          image_url !== undefined ? image_url : current.image_url,
          project_link !== undefined ? project_link : current.project_link,
          category !== undefined ? category : current.category,
          is_active !== undefined
            ? is_active === "true" || is_active === true
              ? 1
              : 0
            : current.is_active,
          Number(id),
        ],
      });

      const updated = await db.execute({
        sql: "SELECT * FROM projects WHERE id = ?",
        args: [Number(id)],
      });

      const project = {
        ...updated.rows[0],
        is_active:
          updated.rows[0].is_active === 1 || updated.rows[0].is_active === true,
      };

      return res.json({
        success: true,
        message: "Projeto atualizado com sucesso",
        data: project,
      });
    }

    // DELETE /api/projects/:id - Deletar projeto (protegido)
    if (req.method === "DELETE") {
      const auth = authenticateToken(req);
      if (auth.error) {
        return res
          .status(auth.status)
          .json({ success: false, message: auth.error });
      }

      const existing = await db.execute({
        sql: "SELECT * FROM projects WHERE id = ?",
        args: [Number(id)],
      });

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Projeto não encontrado",
        });
      }

      await db.execute({
        sql: "DELETE FROM projects WHERE id = ?",
        args: [Number(id)],
      });

      return res.json({
        success: true,
        message: "Projeto deletado com sucesso",
      });
    }

    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Erro em /api/projects/[id]:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

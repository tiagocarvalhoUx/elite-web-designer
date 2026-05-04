import { initDb } from "../_lib/db.js";
import { authenticateToken, setCors } from "../_lib/auth.js";
import { uploadBuffer } from "../_lib/cloudinary.js";
import multer from "multer";
import path from "path";

// Configuração do Multer para upload de imagens
const storage = multer.memoryStorage(); // Usar memory para Vercel serverless

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
    fileSize: 10 * 1024 * 1024,
  },
});

// Projetos padrão para popular o banco na primeira vez
const DEFAULT_PROJECTS = [
  {
    title: "MRV House",
    description:
      "Site imobiliário moderno com busca avançada de imóveis e interface elegante",
    image_url:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    project_link: "https://mrv-house.vercel.app/",
    category: "Imobiliário",
  },
  {
    title: "Pet Shop",
    description:
      "E-commerce completo para pet shop com agendamento e catálogo de produtos",
    image_url:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800",
    project_link: "https://petshop-chi.vercel.app/",
    category: "E-commerce",
  },
  {
    title: "Coffee Web",
    description:
      "Landing page elegante para cafeteria artesanal com cardápio digital",
    image_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
    project_link: "https://coffe-web-henna.vercel.app/",
    category: "Landing Page",
  },
  {
    title: "Marcenaria",
    description:
      "Site institucional para marcenaria com galeria de trabalhos e orçamentos",
    image_url:
      "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800",
    project_link: "https://marcenaria-vue.vercel.app/",
    category: "Institucional",
  },
  {
    title: "Reza Vela",
    description:
      "E-commerce de velas artesanais com aromaterapia e produtos premium",
    image_url:
      "https://images.unsplash.com/photo-1602607688655-94e4730c5f2e?w=800",
    project_link: "https://reza-vela.vercel.app/",
    category: "E-commerce",
  },
  {
    title: "Caetano Hidráulica",
    description:
      "Site corporativo para empresa de serviços hidráulicos com contato direto",
    image_url:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800",
    project_link: "https://caetano-hidraulica.vercel.app/",
    category: "Serviços",
  },
  {
    title: "Burger Layout",
    description:
      "Cardápio digital para hamburgueria com design moderno e pedidos online",
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    project_link: "https://cardapio-hambuguer-three.vercel.app/",
    category: "Food & Drink",
  },
  {
    title: "Barbearia",
    description:
      "Site institucional para barbearia com agendamento de horários e serviços",
    image_url:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800",
    project_link: "https://barbearia-react-eight.vercel.app/",
    category: "Beleza",
  },
  {
    title: "Faster Food",
    description:
      "Delivery de comidas rápidas com cardápio interativo e promoções",
    image_url:
      "https://images.unsplash.com/photo-1561758033-d9a63f80764a?w=800",
    project_link: "https://faster-food-omega.vercel.app/",
    category: "Food & Drink",
  },
];

async function seedIfEmpty(db) {
  const count = await db.execute("SELECT COUNT(*) as cnt FROM projects");
  if (count.rows[0].cnt === 0) {
    for (const p of DEFAULT_PROJECTS) {
      await db.execute({
        sql: `INSERT INTO projects (title, description, image_url, project_link, category, is_active)
              VALUES (?, ?, ?, ?, ?, 1)`,
        args: [p.title, p.description, p.image_url, p.project_link, p.category],
      });
    }
  }
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const db = await initDb();
    await seedIfEmpty(db);

    // GET /api/projects - Listar todos
    if (req.method === "GET") {
      const { category, active, search } = req.query;

      let sql = "SELECT * FROM projects WHERE 1=1";
      const args = [];

      if (active !== "false") {
        sql += " AND is_active = 1";
      }

      if (category) {
        sql += " AND category = ?";
        args.push(category);
      }

      if (search) {
        sql += " AND (title LIKE ? OR description LIKE ?)";
        args.push(`%${search}%`, `%${search}%`);
      }

      sql += " ORDER BY created_at DESC";

      const result = await db.execute({ sql, args });

      // Converter is_active de 0/1 para boolean
      const projects = result.rows.map((row) => ({
        ...row,
        is_active: row.is_active === 1 || row.is_active === true,
      }));

      return res.json({
        success: true,
        count: projects.length,
        data: projects,
      });
    }

    // POST /api/projects - Criar projeto (protegido)
    if (req.method === "POST") {
      const auth = authenticateToken(req);
      if (auth.error) {
        return res
          .status(auth.status)
          .json({ success: false, message: auth.error });
      }

      let projectData;

      // Verificar se é FormData (upload) ou JSON
      if (
        req.headers["content-type"] &&
        req.headers["content-type"].includes("multipart/form-data")
      ) {
        // Usar multer para FormData
        try {
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
          projectData = {
            title: req.body.title,
            description: req.body.description,
            image_url: imageUrl,
            project_link: req.body.project_link,
            category: req.body.category,
            is_active: req.body.is_active,
          };
        } catch (uploadErr) {
          console.error("[POST /api/projects] upload error:", uploadErr);
          return res.status(400).json({
            success: false,
            message: "Erro no upload da imagem",
          });
        }
      } else {
        // JSON
        let body = req.body;
        if (typeof body === "string") {
          body = JSON.parse(body);
        }
        projectData = body;
      }

      const {
        title,
        description,
        image_url,
        project_link,
        category,
        is_active,
      } = projectData;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Título é obrigatório",
        });
      }

      const result = await db.execute({
        sql: `INSERT INTO projects (title, description, image_url, project_link, category, is_active)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          title,
          description || null,
          image_url || null,
          project_link || null,
          category || null,
          is_active !== false && is_active !== "false" ? 1 : 0,
        ],
      });

      const newProject = await db.execute({
        sql: "SELECT * FROM projects WHERE id = ?",
        args: [Number(result.lastInsertRowid)],
      });

      const project = {
        ...newProject.rows[0],
        is_active:
          newProject.rows[0].is_active === 1 ||
          newProject.rows[0].is_active === true,
      };

      return res.status(201).json({
        success: true,
        message: "Projeto criado com sucesso",
        data: project,
      });
    }

    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Erro em /api/projects:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}

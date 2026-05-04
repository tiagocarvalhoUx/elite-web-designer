import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

// Normaliza a URL da API
const rawApiUrl = import.meta.env.VITE_API_URL || "/api";
// Remove trailing slashes e garante que começa com / se não for http
let API_URL = rawApiUrl.replace(/\/+$/, "");
if (!API_URL.startsWith("http") && !API_URL.startsWith("/")) {
  API_URL = "/" + API_URL;
}
const API_BASE_URL = API_URL.replace(/\/api\/?$/, "");
const REQUEST_TIMEOUT_MS = 12000;
const FETCH_CACHE_TTL_MS = 5 * 60 * 1000;
const PROJECTS_CACHE_PREFIX = "elite-projects-cache:";

console.log("[Projects] API_URL:", API_URL); // Debug - remover depois
const PLACEHOLDER_IMAGE_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
      '<rect width="800" height="600" fill="#11131a"/>' +
      '<rect x="40" y="40" width="720" height="520" rx="24" ry="24" fill="#1a1d28" stroke="#2c3142" stroke-width="2"/>' +
      '<text x="400" y="315" font-family="Arial, sans-serif" font-size="28" fill="#8a94b2" text-anchor="middle">Sem imagem</text>' +
      "</svg>",
  );

export interface Project {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  project_link: string;
  category: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Hidratação síncrona do cache no boot — projetos aparecem antes do primeiro paint
const readInitialCache = (): Project[] => {
  try {
    const raw = typeof localStorage !== "undefined"
      ? localStorage.getItem(`${PROJECTS_CACHE_PREFIX}{}`)
      : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useProjectsStore = defineStore("projects", () => {
  // State
  const projects = ref<Project[]>(readInitialCache());
  const currentProject = ref<Project | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastFetchKey = ref(projects.value.length > 0 ? "{}" : "");
  const lastFetchedAt = ref(0);

  // Getters
  const activeProjects = computed(() =>
    projects.value.filter((p) => p.is_active),
  );

  const projectsByCategory = computed(() => {
    const grouped: Record<string, Project[]> = {};
    activeProjects.value.forEach((project) => {
      if (!grouped[project.category]) {
        grouped[project.category] = [];
      }
      grouped[project.category].push(project);
    });
    return grouped;
  });

  const categories = computed(() => {
    const cats = new Set(projects.value.map((p) => p.category));
    return Array.from(cats).filter(Boolean);
  });

  // Actions
  const fetchProjects = async (filters?: {
    category?: string;
    search?: string;
    active?: boolean;
  }, options?: { force?: boolean }): Promise<void> => {
    const cacheKey = JSON.stringify(filters || {});
    const storageKey = `${PROJECTS_CACHE_PREFIX}${cacheKey}`;

    // Hidrata UI instantaneamente com cache local (SWR)
    const cachedProjects = getCachedProjects(storageKey);
    if (cachedProjects.length > 0 && projects.value.length === 0) {
      projects.value = cachedProjects;
      lastFetchKey.value = cacheKey;
    }

    // Se cache em memória ainda fresco, evita request
    if (
      projects.value.length > 0 &&
      !options?.force &&
      lastFetchKey.value === cacheKey &&
      Date.now() - lastFetchedAt.value < FETCH_CACHE_TTL_MS
    ) {
      return;
    }

    // Não bloqueia UI com loading=true se já temos dados em cache
    loading.value = projects.value.length === 0;
    error.value = null;

    try {
      let url = `${API_URL}/projects`;
      const params = new URLSearchParams();

      if (filters?.category) params.append("category", filters.category);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.active === false) params.append("active", "false");

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });

      if (response.data.success) {
        projects.value = response.data.data;
        setCachedProjects(storageKey, response.data.data);
        lastFetchKey.value = cacheKey;
        lastFetchedAt.value = Date.now();
      }
    } catch (err: any) {
      if (cachedProjects.length > 0) {
        projects.value = cachedProjects;
        lastFetchKey.value = cacheKey;
        lastFetchedAt.value = Date.now();
        return;
      }

      if (err.code === "ECONNABORTED") {
        error.value = "A API demorou para responder. Tente novamente.";
      } else if (!err.response) {
        error.value = "NÃ£o foi possÃ­vel conectar Ã  API de projetos.";
      } else {
        error.value = err.response?.data?.message || "Erro ao carregar projetos";
      }
    } finally {
      loading.value = false;
    }
  };

  const getProject = async (id: number): Promise<Project | null> => {
    const cachedProject = projects.value.find((p) => p.id === id);
    if (cachedProject) {
      currentProject.value = cachedProject;
      return cachedProject;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_URL}/projects/${id}`, {
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (response.data.success) {
        currentProject.value = response.data.data;
        const index = projects.value.findIndex((p) => p.id === id);
        if (index !== -1) {
          projects.value[index] = response.data.data;
        }
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Erro ao carregar projeto";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (
    projectData: FormData | Record<string, any>,
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      // Não precisa definir headers - axios usa defaults (inclui Authorization)
      // Para FormData, axios detecta automaticamente o Content-Type
      const response = await axios.post(`${API_URL}/projects`, projectData, {
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (response.data.success) {
        projects.value.unshift(response.data.data);
        lastFetchedAt.value = Date.now();
        return true;
      }
      return false;
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        error.value = "Sessão expirada. Faça login novamente.";
      } else {
        error.value = err.response?.data?.message || "Erro ao criar projeto";
      }
      console.error("[createProject] Erro:", err.response?.data || err.message);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateProject = async (
    id: number,
    projectData: FormData | Record<string, any>,
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      // Não precisa definir headers - axios usa defaults (inclui Authorization)
      const response = await axios.put(
        `${API_URL}/projects/${id}`,
        projectData,
        { timeout: REQUEST_TIMEOUT_MS },
      );

      if (response.data.success) {
        const index = projects.value.findIndex((p) => p.id === id);
        if (index !== -1) {
          projects.value[index] = response.data.data;
        }
        currentProject.value = response.data.data;
        lastFetchedAt.value = Date.now();
        return true;
      }
      return false;
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        error.value = "Sessão expirada. Faça login novamente.";
      } else {
        error.value = err.response?.data?.message || "Erro ao atualizar projeto";
      }
      console.error("[updateProject] Erro:", err.response?.data || err.message);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteProject = async (id: number): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.delete(`${API_URL}/projects/${id}`, {
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (response.data.success) {
        projects.value = projects.value.filter((p) => p.id !== id);
        if (currentProject.value?.id === id) {
          currentProject.value = null;
        }
        lastFetchedAt.value = Date.now();
        return true;
      }
      return false;
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        error.value = "SessÃ£o expirada. FaÃ§a login novamente.";
      } else {
        error.value = err.response?.data?.message || "Erro ao deletar projeto";
      }
      console.error("[deleteProject] Erro:", err.response?.data || err.message);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const toggleProjectStatus = async (id: number): Promise<boolean> => {
    const project = projects.value.find((p) => p.id === id);
    if (!project) return false;

    const formData = new FormData();
    formData.append("title", project.title);
    formData.append("description", project.description);
    formData.append("project_link", project.project_link);
    formData.append("category", project.category);
    formData.append("is_active", String(!project.is_active));

    return updateProject(id, formData);
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentProject = () => {
    currentProject.value = null;
  };

  const getCachedProjects = (key: string): Project[] => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const setCachedProjects = (key: string, value: Project[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Cache indisponivel ou cheio; a API continua sendo a fonte principal.
    }
  };

  const getImageUrl = (imageUrl?: string, width = 800): string => {
    if (!imageUrl) return PLACEHOLDER_IMAGE_URL;

    // Cloudinary: injeta transformações para entrega otimizada (WebP/AVIF, qualidade adaptativa, resize)
    const cloudinaryMatch = imageUrl.match(
      /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/,
    );
    if (cloudinaryMatch) {
      const [, prefix, rest] = cloudinaryMatch;
      // Evita duplicar transformações se já existirem
      if (/^(v\d+\/|[a-z]_[^/]+\/)/.test(rest) && !rest.startsWith("v")) {
        return imageUrl;
      }
      return `${prefix}f_auto,q_auto,w_${width},c_fill,dpr_auto/${rest}`;
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("data:image/")) {
      return imageUrl;
    }

    const normalized = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

    if (normalized.startsWith("/uploads/")) {
      return `${API_BASE_URL}${normalized}`;
    }

    if (normalized.startsWith("/public/")) {
      return normalized.replace("/public", "");
    }

    return `${API_BASE_URL}/uploads${normalized}`;
  };

  return {
    projects,
    currentProject,
    loading,
    error,
    activeProjects,
    projectsByCategory,
    categories,
    fetchProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectStatus,
    clearError,
    clearCurrentProject,
    getImageUrl,
  };
});

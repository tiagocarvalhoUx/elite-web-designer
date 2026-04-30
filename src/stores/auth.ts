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
const REQUEST_TIMEOUT_MS = 10000;
const AUTH_CACHE_TTL_MS = 60000;

console.log("[Auth] API_URL:", API_URL); // Debug - remover depois

interface User {
  id: number;
  username: string;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastVerifiedAt = ref(0);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => !!user.value);

  // Actions
  const setAuthHeader = () => {
    if (token.value) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      if (response.data.success) {
        const authData = response.data.data;
        token.value = authData?.token || null;
        user.value = authData?.user || null;
        if (token.value) {
          localStorage.setItem("token", token.value);
          lastVerifiedAt.value = Date.now();
        } else {
          localStorage.removeItem("token");
          lastVerifiedAt.value = 0;
        }
        setAuthHeader();
        return true;
      }
      return false;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Erro ao fazer login";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        password,
      });

      return response.data.success;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Erro ao registrar";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    lastVerifiedAt.value = 0;
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const checkAuth = async (): Promise<boolean> => {
    if (!token.value) return false;

    setAuthHeader();

    if (
      lastVerifiedAt.value &&
      Date.now() - lastVerifiedAt.value < AUTH_CACHE_TTL_MS
    ) {
      return true;
    }

    try {
      // Verificar token fazendo uma requisição protegida
      const response = await axios.get(`${API_URL}/auth/verify`, {
        timeout: REQUEST_TIMEOUT_MS,
      });
      if (response.data.success) {
        user.value = response.data.data?.user || user.value;
        lastVerifiedAt.value = Date.now();
        return true;
      }
      return false;
    } catch {
      logout();
      return false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Inicializar header se já tiver token
  setAuthHeader();

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };
});

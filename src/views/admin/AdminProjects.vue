<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gradient">Projetos</h1>
        <p class="text-gray-400 mt-1">Gerencie todos os seus projetos</p>
      </div>
      <NeonButton to="/admin/projects/new" variant="primary">
        <template #icon>
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </template>
        Novo Projeto
      </NeonButton>
    </div>

    <!-- Filters -->
    <GlassCard variant="dark" :animated="true">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar projetos..."
              class="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-500"
            />
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <select
          v-model="selectedCategory"
          class="px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white"
        >
          <option value="">Todas categorias</option>
          <option
            v-for="cat in projectsStore.categories"
            :key="cat"
            :value="cat"
          >
            {{ cat }}
          </option>
        </select>
        <select
          v-model="statusFilter"
          class="px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white"
        >
          <option value="">Todos status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
    </GlassCard>

    <!-- Projects Grid -->
    <div
      v-if="projectsStore.loading"
      class="flex items-center justify-center py-12"
    >
      <div
        class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div v-else-if="projectsStore.error" class="text-center py-12">
      <GlassCard variant="dark">
        <p class="text-red-400 mb-4">{{ projectsStore.error }}</p>
        <NeonButton @click="loadProjects(true)" variant="secondary" size="sm">
          Tentar novamente
        </NeonButton>
      </GlassCard>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="text-center py-12">
      <GlassCard variant="dark">
        <div
          class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <p class="text-gray-400 mb-4">Nenhum projeto encontrado</p>
        <NeonButton @click="clearFilters" variant="secondary" size="sm">
          Limpar filtros
        </NeonButton>
      </GlassCard>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GlassCard
        v-for="(project, index) in filteredProjects"
        :key="project.id"
        variant="dark"
        :animated="true"
        :delay="index * 50"
        class="group overflow-hidden"
      >
        <!-- Image -->
        <div class="relative aspect-video -mx-6 -mt-6 mb-4 overflow-hidden">
          <img
            :src="projectsStore.getImageUrl(project.image_url)"
            :alt="project.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            @error="handleImageError"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent"
          ></div>

          <!-- Status Badge -->
          <div class="absolute top-3 right-3">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
              :class="
                project.is_active
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              "
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="
                  project.is_active
                    ? 'bg-green-400 animate-pulse'
                    : 'bg-gray-400'
                "
              ></span>
              {{ project.is_active ? "Ativo" : "Inativo" }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-3">
          <div>
            <TechBadge :label="project.category" size="sm" class="mb-2" />
            <h3 class="font-semibold text-white text-lg line-clamp-1">
              {{ project.title }}
            </h3>
            <p class="text-gray-400 text-sm line-clamp-2 mt-1">
              {{ project.description }}
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs text-gray-500">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ formatDate(project.created_at) }}
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-3 border-t border-white/10">
            <button
              @click="toggleStatus(project)"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              :class="
                project.is_active
                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
              "
            >
              <svg
                v-if="project.is_active"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              {{ project.is_active ? "Ativo" : "Inativo" }}
            </button>

            <a
              :href="project.project_link"
              target="_blank"
              class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              title="Ver projeto"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            <router-link
              :to="`/admin/projects/edit/${project.id}`"
              class="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
              title="Editar"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </router-link>

            <button
              @click="confirmDelete(project)"
              class="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              title="Excluir"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <GlassCard variant="neon" class="w-full max-w-md">
            <div class="text-center">
              <div
                class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center"
              >
                <svg
                  class="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">
                Confirmar Exclusão
              </h3>
              <p class="text-gray-400 mb-6">
                Tem certeza que deseja excluir o projeto
                <strong class="text-white">{{ projectToDelete?.title }}</strong
                >? Esta ação não pode ser desfeita.
              </p>
              <p v-if="projectsStore.error" class="text-red-400 text-sm mb-4">
                {{ projectsStore.error }}
              </p>
              <div class="flex gap-3 justify-center">
                <NeonButton
                  @click="showDeleteModal = false"
                  variant="ghost"
                  :disabled="projectsStore.loading"
                >
                  Cancelar
                </NeonButton>
                <NeonButton
                  @click="deleteProject"
                  variant="accent"
                  :loading="projectsStore.loading"
                >
                  Excluir
                </NeonButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useProjectsStore, type Project } from "../../stores";
import GlassCard from "../../components/ui/GlassCard.vue";
import NeonButton from "../../components/ui/NeonButton.vue";
import TechBadge from "../../components/ui/TechBadge.vue";

const projectsStore = useProjectsStore();

// Filters
const searchQuery = ref("");
const selectedCategory = ref("");
const statusFilter = ref("");

const filteredProjects = computed(() => {
  let filtered = projectsStore.projects;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query),
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((p) => p.category === selectedCategory.value);
  }

  if (statusFilter.value) {
    filtered = filtered.filter((p) =>
      statusFilter.value === "active" ? p.is_active : !p.is_active,
    );
  }

  return filtered;
});

const clearFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "";
  statusFilter.value = "";
};

// Delete modal
const showDeleteModal = ref(false);
const projectToDelete = ref<Project | null>(null);

const confirmDelete = (project: Project) => {
  projectsStore.clearError();
  projectToDelete.value = project;
  showDeleteModal.value = true;
};

const deleteProject = async () => {
  if (!projectToDelete.value?.id) return;

  const success = await projectsStore.deleteProject(projectToDelete.value.id);

  if (success) {
    showDeleteModal.value = false;
    projectToDelete.value = null;
  }
};

const toggleStatus = async (project: Project) => {
  if (!project.id) return;
  await projectsStore.toggleProjectStatus(project.id);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = projectsStore.getImageUrl();
};

const loadProjects = (force = false) => {
  projectsStore.fetchProjects({ active: false }, { force });
};

onMounted(loadProjects);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

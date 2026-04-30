<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gradient">Dashboard</h1>
        <p class="text-gray-400 mt-1">Visão geral do seu portfólio</p>
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

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <GlassCard
        v-for="(stat, index) in stats"
        :key="stat.label"
        variant="dark"
        :animated="true"
        :delay="index * 100"
        class="group"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm mb-1">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-white">{{ stat.value }}</p>
          </div>
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            :class="stat.bgClass"
          >
            <component
              :is="stat.icon"
              class="w-6 h-6"
              :class="stat.iconClass"
            />
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2">
          <span
            :class="stat.trend >= 0 ? 'text-green-400' : 'text-red-400'"
            class="text-sm font-medium"
          >
            {{ stat.trend >= 0 ? "+" : "" }}{{ stat.trend }}%
          </span>
          <span class="text-gray-500 text-sm">vs mês anterior</span>
        </div>
      </GlassCard>
    </div>

    <!-- Recent Projects -->
    <GlassCard
      variant="dark"
      title="Projetos Recentes"
      :animated="true"
      :delay="400"
    >
      <div
        v-if="projectsStore.loading"
        class="flex items-center justify-center py-12"
      >
        <div
          class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>

      <div v-else-if="recentProjects.length === 0" class="text-center py-12">
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
        <p class="text-gray-400 mb-4">Nenhum projeto cadastrado ainda</p>
        <NeonButton to="/admin/projects/new" variant="secondary" size="sm">
          Criar primeiro projeto
        </NeonButton>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/10">
              <th class="text-left py-4 px-4 text-gray-400 font-medium">
                Projeto
              </th>
              <th class="text-left py-4 px-4 text-gray-400 font-medium">
                Categoria
              </th>
              <th class="text-left py-4 px-4 text-gray-400 font-medium">
                Status
              </th>
              <th class="text-left py-4 px-4 text-gray-400 font-medium">
                Data
              </th>
              <th class="text-right py-4 px-4 text-gray-400 font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="project in recentProjects"
              :key="project.id"
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="projectsStore.getImageUrl(project.image_url)"
                    :alt="project.title"
                    class="w-10 h-10 rounded-lg object-cover"
                    @error="handleImageError"
                  />
                  <span class="font-medium text-white">{{
                    project.title
                  }}</span>
                </div>
              </td>
              <td class="py-4 px-4">
                <TechBadge :label="project.category" size="sm" />
              </td>
              <td class="py-4 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="
                    project.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="project.is_active ? 'bg-green-400' : 'bg-gray-400'"
                  ></span>
                  {{ project.is_active ? "Ativo" : "Inativo" }}
                </span>
              </td>
              <td class="py-4 px-4 text-gray-400">
                {{ formatDate(project.created_at) }}
              </td>
              <td class="py-4 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="toggleStatus(project)"
                    class="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    :title="project.is_active ? 'Desativar' : 'Ativar'"
                  >
                    <svg
                      v-if="project.is_active"
                      class="w-4 h-4 text-green-400"
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
                      class="w-4 h-4 text-gray-400"
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
                  </button>
                  <router-link
                    :to="`/admin/projects/edit/${project.id}`"
                    class="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Editar"
                  >
                    <svg
                      class="w-4 h-4 text-blue-400"
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
                    class="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Excluir"
                  >
                    <svg
                      class="w-4 h-4 text-red-400"
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="recentProjects.length > 0" class="mt-6 text-center">
        <NeonButton to="/admin/projects" variant="ghost" size="sm">
          Ver todos os projetos
          <svg
            class="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NeonButton>
      </div>
    </GlassCard>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard variant="neon" :animated="true" :delay="500">
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-1">Adicionar Projeto</h3>
            <p class="text-gray-400 text-sm mb-4">
              Adicione um novo projeto ao seu portfólio com imagem e descrição.
            </p>
            <router-link
              to="/admin/projects/new"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all"
            >
              Criar projeto
            </router-link>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="neon" :animated="true" :delay="600">
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-6 h-6 text-blue-400"
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
          </div>
          <div>
            <h3 class="font-semibold text-white mb-1">Ver Portfólio</h3>
            <p class="text-gray-400 text-sm mb-4">
              Visualize como seu portfólio aparece para os visitantes.
            </p>
            <a
              href="/"
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 transition-all"
            >
              Ver site
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
import { ref, computed, onMounted, h } from "vue";
import { useProjectsStore, type Project } from "../../stores";
import GlassCard from "../../components/ui/GlassCard.vue";
import NeonButton from "../../components/ui/NeonButton.vue";
import TechBadge from "../../components/ui/TechBadge.vue";

const projectsStore = useProjectsStore();

// Icons como componentes
const ProjectsIcon = () =>
  h(
    "svg",
    {
      class: "w-6 h-6",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
    },
    [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      }),
    ],
  );

const ActiveIcon = () =>
  h(
    "svg",
    {
      class: "w-6 h-6",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
    },
    [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      }),
    ],
  );

const CategoriesIcon = () =>
  h(
    "svg",
    {
      class: "w-6 h-6",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
    },
    [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
      }),
    ],
  );

const ViewsIcon = () =>
  h(
    "svg",
    {
      class: "w-6 h-6",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
    },
    [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
      }),
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
      }),
    ],
  );

// Stats
const stats = computed(() => [
  {
    label: "Total de Projetos",
    value: projectsStore.projects.length,
    trend: 12,
    icon: ProjectsIcon,
    bgClass: "bg-purple-500/20",
    iconClass: "text-purple-400",
  },
  {
    label: "Projetos Ativos",
    value: projectsStore.activeProjects.length,
    trend: 8,
    icon: ActiveIcon,
    bgClass: "bg-green-500/20",
    iconClass: "text-green-400",
  },
  {
    label: "Categorias",
    value: projectsStore.categories.length,
    trend: 2,
    icon: CategoriesIcon,
    bgClass: "bg-blue-500/20",
    iconClass: "text-blue-400",
  },
  {
    label: "Visualizações",
    value: "1.2K",
    trend: 24,
    icon: ViewsIcon,
    bgClass: "bg-orange-500/20",
    iconClass: "text-orange-400",
  },
]);

const recentProjects = computed(() => [...projectsStore.projects].slice(0, 5));

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

onMounted(() => {
  projectsStore.fetchProjects({ active: false });
});
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

<template>
  <section id="projects" class="py-20 sm:py-28 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-dots opacity-30"></div>
    <div
      class="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
    ></div>

    <div class="container-futuristic relative z-10">
      <!-- Header -->
      <div class="text-center mb-16">
        <TechBadge label="Portfólio" variant="neon" class="mb-4" data-aos="zoom-in" />
        <h2 class="heading-futuristic heading-lg text-gradient-animated mb-4" data-aos="fade-up">
          Projetos em Destaque
        </h2>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
          Explore nossa coleção de projetos inovadores que transformaram ideias
          em realidade digital
        </p>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="(project, index) in projects"
          :key="project.link || project.alt"
          :href="project.link"
          target="_blank"
          rel="noopener noreferrer"
          class="project-card group block rounded-xl overflow-hidden glass-card hover:border-purple-500/50 transition-all duration-300"
          data-aos="fade-up"
          :data-aos-duration="400"
          :data-aos-delay="index * 80"
        >
          <div class="relative overflow-hidden">
            <img
              class="w-full h-[200px] object-cover transform group-hover:scale-110 transition-transform duration-500"
              :src="project.src"
              :alt="project.alt"
              :loading="index < 3 ? 'eager' : 'lazy'"
              :fetchpriority="index < 3 ? 'high' : 'low'"
              decoding="async"
              @error="handleImageError"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60"
            ></div>

            <!-- Hover overlay -->
            <div
              class="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
            >
              <span
                class="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium"
              >
                Ver projeto
              </span>
            </div>
          </div>

          <div class="p-4">
            <h3
              class="text-white font-semibold group-hover:text-purple-400 transition-colors"
            >
              {{ project.alt }}
            </h3>
          </div>
        </a>
      </div>

      <!-- CTA -->
      <div class="text-center mt-16" data-aos="zoom-in" data-aos-delay="300">
        <NeonButton :href="whatsappLink" external variant="gradient" size="lg">
          <template #icon>
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"
              />
            </svg>
          </template>
          Vamos criar seu projeto
        </NeonButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, nextTick } from "vue";
import NeonButton from "../ui/NeonButton.vue";
import TechBadge from "../ui/TechBadge.vue";
import { useProjectsStore } from "../../stores";
import AOS from "aos";

// Imports das imagens dos projetos originais
// ...existing code...

const projectsStore = useProjectsStore();

interface Project {
  src: string;
  alt: string;
  link: string;
}

const fallbackProjects: Project[] = [
  {
    src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    alt: "Mrv Imobiliaria",
    link: "https://mrv-house.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800",
    alt: "Pet Shop",
    link: "https://petshop-chi.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
    alt: "Cafe Pulse",
    link: "https://coffe-web-henna.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800",
    alt: "Marcenaria",
    link: "https://marcenaria-vue.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1602607688655-94e4730c5f2e?w=800",
    alt: "Reza Vela",
    link: "https://reza-vela.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800",
    alt: "Caetano Hidraulica",
    link: "https://caetano-hidraulica.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    alt: "Hamburgueria",
    link: "https://cardapio-hambuguer-three.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800",
    alt: "Barbearia Prime",
    link: "https://barbearia-react-eight.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1561758033-d9a63f80764a?w=800",
    alt: "Faster Food",
    link: "https://faster-food-omega.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800",
    alt: "Pomodoro IA",
    link: "https://pomodoroai.vercel.app/",
  },
  {
    src: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800",
    alt: "Imperio Bebidas",
    link: "https://imperio-bebidas.vercel.app/tabs",
  },
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    alt: "Sistema Para Vendas - Claro",
    link: "https://sistema-de-vendas-claro.vercel.app/",
  },
];

// Busca projetos cadastrados no admin
onMounted(() => {
  projectsStore.fetchProjects();
});

// Atualiza animações AOS quando os projetos da API chegam
watch(
  () => projectsStore.activeProjects,
  async () => {
    await nextTick();
    AOS.refresh();
  },
  { deep: true },
);

// Usa dados do banco; se a API não retornou nada, mostra a lista fixa
const projects = computed(() => {
  if (projectsStore.activeProjects.length > 0) {
    return projectsStore.activeProjects.map((p) => ({
      src: projectsStore.getImageUrl(p.image_url),
      alt: p.title,
      link: p.project_link,
    }));
  }
  return fallbackProjects;
});

// Handler para erro de imagem
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = projectsStore.getImageUrl();
};

const whatsappLink = computed(() => {
  const message =
    "Olá! Gostaria de iniciar um projeto com vocês. Vi o portfólio no site e me interessei pelos serviços.";
  return `https://wa.me/5518981142927?text=${encodeURIComponent(message)}`;
});
</script>

<style scoped>
.project-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(124, 58, 237, 0.2);
}
</style>

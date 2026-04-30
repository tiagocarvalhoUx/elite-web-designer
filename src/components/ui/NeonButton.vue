<template>
  <component
    :is="componentTag"
    :class="[
      'neon-button',
      `variant-${variant}`,
      `size-${size}`,
      {
        'is-block': block,
        'is-loading': loading,
        'is-disabled': disabled,
        'has-icon': hasIcon,
        'icon-only': iconOnly
      }
    ]"
    :disabled="disabled || loading"
    v-bind="linkProps"
    @click="handleClick"
  >
    <!-- Background Glow -->
    <span class="button-glow"></span>
    
    <!-- Ripple Container -->
    <span ref="rippleContainer" class="ripple-container"></span>
    
    <!-- Loading Spinner -->
    <span v-if="loading" class="loading-spinner">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.3"/>
        <path d="M12 2C6.48 2 2 6.48 2 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </span>
    
    <!-- Content -->
    <span class="button-content" :class="{ 'opacity-0': loading }">
      <!-- Left Icon -->
      <span v-if="$slots.icon" class="icon icon-left">
        <slot name="icon"></slot>
      </span>

      <span v-else-if="iconLeft" class="icon icon-left">
        <component :is="iconLeft" />
      </span>
      
      <!-- Default Icon (for icon-only) -->
      <span v-else-if="icon && iconOnly" class="icon">
        <component :is="icon" />
      </span>
      
      <!-- Label -->
      <span v-if="!iconOnly" class="button-label">
        <slot>{{ label }}</slot>
      </span>
      
      <!-- Right Icon -->
      <span v-if="iconRight" class="icon icon-right">
        <component :is="iconRight" />
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, type Component } from 'vue'

interface Props {
  /** Tag HTML ou componente a ser renderizado */
  tag?: string | Component
  /** Rota para navegação (se for link) */
  to?: string
  href?: string
  /** Texto do botão */
  label?: string
  /** Variante visual */
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'gradient'
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Ícone à esquerda */
  iconLeft?: Component
  /** Ícone à direita */
  iconRight?: Component
  /** Ícone único (para botão apenas com ícone) */
  icon?: Component
  /** Botão apenas com ícone */
  iconOnly?: boolean
  /** Ocupa largura total */
  block?: boolean
  /** Estado de carregamento */
  loading?: boolean
  /** Estado desabilitado */
  disabled?: boolean
  /** Tipo do botão */
  type?: 'button' | 'submit' | 'reset'
  /** Abre link em nova aba */
  external?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'button',
  to: '',
  href: '',
  label: '',
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  block: false,
  loading: false,
  disabled: false,
  type: 'button',
  external: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const rippleContainer = ref<HTMLElement>()
const slots = useSlots()

const hasIcon = computed(() => !!slots.icon || !!props.iconLeft || !!props.iconRight || !!props.icon)

const componentTag = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return props.tag
})

const linkProps = computed(() => {
  if (props.to) {
    return {
      to: props.to,
      target: props.external ? '_blank' : undefined,
      rel: props.external ? 'noopener noreferrer' : undefined
    }
  }
  if (props.href) {
    return {
      href: props.href,
      target: props.external ? '_blank' : undefined,
      rel: props.external ? 'noopener noreferrer' : undefined
    }
  }
  return { type: props.type }
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  
  // Criar ripple effect
  createRipple(event)
  
  emit('click', event)
}

const createRipple = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const ripple = document.createElement('span')
  ripple.className = 'ripple-effect'
  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 20px;
    height: 20px;
    margin-left: -10px;
    margin-top: -10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    pointer-events: none;
    animation: ripple-animation 0.6s ease-out forwards;
  `
  
  rippleContainer.value?.appendChild(ripple)
  
  setTimeout(() => {
    ripple.remove()
  }, 600)
}
</script>

<style scoped>
/* ========================================
   BASE DO BOTÃO
   ======================================== */
.neon-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  isolation: isolate;
}

.neon-button:focus {
  outline: none;
}

.neon-button:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 2px;
}

/* ========================================
   VARIANTES
   ======================================== */

/* Primary - Roxo Neon */
.variant-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: #ffffff;
  box-shadow: 
    0 4px 15px rgba(124, 58, 237, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.variant-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 
    0 8px 25px rgba(124, 58, 237, 0.6),
    0 0 30px rgba(124, 58, 237, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.variant-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 
    0 4px 15px rgba(124, 58, 237, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Secondary - Azul Neon */
.variant-secondary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 
    0 4px 15px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.variant-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.6),
    0 0 30px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Accent - Cyan Neon */
.variant-accent {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: #ffffff;
  box-shadow: 
    0 4px 15px rgba(6, 182, 212, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.variant-accent:hover:not(:disabled) {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  box-shadow: 
    0 8px 25px rgba(6, 182, 212, 0.6),
    0 0 30px rgba(34, 211, 238, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Ghost - Transparente com borda */
.variant-ghost {
  background: transparent;
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.variant-ghost:hover:not(:disabled) {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(167, 139, 250, 0.6);
  box-shadow: 
    0 0 20px rgba(124, 58, 237, 0.2),
    inset 0 0 20px rgba(124, 58, 237, 0.05);
  color: #c4b5fd;
}

/* Gradient - Gradiente Arco-íris */
.variant-gradient {
  background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #22d3ee 100%);
  background-size: 200% 200%;
  color: #ffffff;
  box-shadow: 
    0 4px 15px rgba(124, 58, 237, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: gradient-shift 3s ease infinite;
}

.variant-gradient:hover:not(:disabled) {
  box-shadow: 
    0 8px 25px rgba(124, 58, 237, 0.6),
    0 0 30px rgba(59, 130, 246, 0.4),
    0 0 50px rgba(34, 211, 238, 0.3);
  transform: translateY(-2px);
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* ========================================
   TAMANHOS
   ======================================== */
.size-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 8px;
}

.size-sm.icon-only {
  padding: 0.5rem;
}

.size-md {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
}

.size-md.icon-only {
  padding: 0.75rem;
}

.size-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.size-lg.icon-only {
  padding: 1rem;
}

.size-xl {
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
  border-radius: 16px;
}

.size-xl.icon-only {
  padding: 1.25rem;
}

/* ========================================
   GLOW BACKGROUND
   ======================================== */
.button-glow {
  position: absolute;
  inset: -2px;
  background: inherit;
  border-radius: inherit;
  filter: blur(15px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.neon-button:hover:not(:disabled) .button-glow {
  opacity: 0.6;
}

/* ========================================
   RIPPLE EFFECT
   ======================================== */
.ripple-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

:global(.ripple-effect) {
  animation: ripple-animation 0.6s ease-out forwards;
}

@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20);
    opacity: 0;
  }
}

/* ========================================
   LOADING STATE
   ======================================== */
.loading-spinner {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner svg {
  width: 1.25em;
  height: 1.25em;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ========================================
   CONTENT
   ======================================== */
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.2s ease;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon svg {
  width: 1.25em;
  height: 1.25em;
}

.size-lg .icon svg,
.size-xl .icon svg {
  width: 1.5em;
  height: 1.5em;
}

/* ========================================
   MODIFICADORES
   ======================================== */
.is-block {
  width: 100%;
}

.is-disabled,
.is-loading {
  cursor: not-allowed;
  opacity: 0.7;
}

.opacity-0 {
  opacity: 0;
}

/* ========================================
   RESPONSIVIDADE
   ======================================== */
@media (max-width: 768px) {
  .size-xl {
    padding: 1rem 2rem;
    font-size: 1rem;
  }
}
</style>

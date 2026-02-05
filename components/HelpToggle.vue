<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <span class="help-toggle-wrapper">
    <button type="button" class="help-btn" @click.stop="toggle" :class="{ active: isOpen }">
      <i class="pi pi-info-circle" />
    </button>
    <div v-if="isOpen" class="help-content">
      <p>{{ text }}</p>
    </div>
  </span>
</template>

<style scoped>
.help-toggle-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.help-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--p-text-muted-color);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.help-btn:hover,
.help-btn.active {
  color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.help-btn i {
  font-size: 0.875rem;
}

.help-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  min-width: 250px;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--p-surface-800);
  color: white;
  border-radius: 6px;
  font-size: 0.8rem;
  line-height: 1.5;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.help-content::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 12px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--p-surface-800);
}

.help-content p {
  margin: 0;
}
</style>

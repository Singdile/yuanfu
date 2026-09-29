<template>
  <section class="disinfection-grid" aria-label="消杀管理">
    <DisinfectionConfig @configure="$emit('configure')" />
    <SolutionLevels />
    <DisinfectionLogs />
  </section>
</template>
<script setup lang="ts">
import DisinfectionConfig from './DisinfectionConfig.vue'
import SolutionLevels from './SolutionLevels.vue'
import DisinfectionLogs from './DisinfectionLogs.vue'
defineEmits<{ (event: 'configure'): void }>()
</script>
<style scoped lang="scss">
.disinfection-grid { display: grid; grid-template-columns: minmax(245px, 1fr) minmax(0, 2.8fr) minmax(290px, 1.15fr); gap: 14px; min-height: 0; }
.disinfection-grid :deep(.panel) { min-width: 0; min-height: 0; }
@media (min-width: 1700px) { .disinfection-grid { grid-template-columns: minmax(300px, 1fr) minmax(0, 2.8fr) minmax(340px, 1.15fr); } }
@media (max-width: 1100px) { .disinfection-grid { grid-template-columns: 225px minmax(0, 1fr) 265px; } }
@media (max-width: 1000px) { .disinfection-grid { grid-template-columns: minmax(0, 1fr) 300px; grid-template-rows: auto 440px; } .disinfection-grid > :first-child { grid-column: 1 / -1; } }
@media (max-width: 680px) { .disinfection-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto auto; } }
</style>

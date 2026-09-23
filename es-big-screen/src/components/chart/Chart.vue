<template>
  <div ref="chartRef" class="es-chart"></div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import type { PropType } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsCoreOption } from 'echarts'
const props = defineProps({
  option: { type: Object as PropType<EChartsCoreOption>, required: true },
  loading: Boolean
})
const chartRef = shallowRef<HTMLElement | null>(null)
const chart = shallowRef<ECharts | null>(null)
let observer: ResizeObserver | undefined
function setOption(option: EChartsCoreOption, notMerge = true, lazyUpdate = false) {
  chart.value?.setOption(option, notMerge, lazyUpdate)
}
function resize() { chart.value?.resize() }
function updateLoading() {
  if (props.loading) chart.value?.showLoading()
  else chart.value?.hideLoading()
}
watch(() => props.option, option => setOption(option), { deep: true })
watch(() => props.loading, updateLoading)
onMounted(() => {
  if (!chartRef.value) return
  chart.value = echarts.init(chartRef.value)
  setOption(props.option)
  updateLoading()
  observer = new ResizeObserver(resize)
  observer.observe(chartRef.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  chart.value?.dispose()
  chart.value = null
})
defineExpose({ chart, setOption, resize })
</script>
<style scoped>
.es-chart { width: 100%; height: 100%; }
</style>


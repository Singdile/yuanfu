<template>
  <section id="statistics" ref="statisticsRef" class="statistics-grid" aria-label="统计分析" tabindex="-1">
    <article v-for="item in charts" :key="item.title" class="panel statistic-panel">
      <div class="panel-heading"><h2>{{ item.title }}</h2><span>{{ item.subtitle }}</span></div>
      <div class="chart-summary"><strong>{{ item.summary }}<small>{{ item.unit }}</small></strong><span>{{ item.note }}</span></div>
      <div class="chart-body" role="img" :aria-label="item.description"><Chart :option="item.option" /></div>
    </article>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import type { EChartsOption } from 'echarts'
import Chart from '@/components/chart/Chart.vue'
import { eventTypes, onlineRate, overview, statistics, todayEvents } from '../data'

const statisticsRef = ref<HTMLElement>()
defineExpose({ focus: () => { statisticsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); statisticsRef.value?.focus({ preventScroll: true }) } })
const days = Array.from({ length: 7 }, (_, index) => dayjs().subtract(6 - index, 'day').format('MM/DD'))
const axisLabel = { color: '#728ca5', fontSize: 10 }
const splitLine = { lineStyle: { color: '#20384e', type: 'dashed' as const } }
const base: EChartsOption = {
  animationDuration: 450,
  textStyle: { fontFamily: 'Microsoft YaHei, sans-serif' },
  tooltip: { trigger: 'axis', backgroundColor: '#142b40', borderColor: '#355970', textStyle: { color: '#d9e9f7', fontSize: 12 }, confine: true },
  grid: { left: 4, right: 10, top: 14, bottom: 4, containLabel: true }
}
const categoryAxis = { type: 'category' as const, data: days, boundaryGap: false, axisLine: { lineStyle: { color: '#294258' } }, axisTick: { show: false }, axisLabel }
const charts: { title: string; subtitle: string; summary: string | number; unit: string; note: string; description: string; option: EChartsOption }[] = [
  {
    title: '异常趋势', subtitle: '近 7 日', summary: todayEvents, unit: '起', note: '今日累计异常',
    description: '近七日异常数量：' + statistics.trend.join('、') + ' 起。',
    option: { ...base, xAxis: categoryAxis, yAxis: { type: 'value', minInterval: 1, axisLabel, splitLine },
      series: [{ name: '异常事件', type: 'line', data: statistics.trend, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 2, color: '#50cee1' }, itemStyle: { color: '#50cee1' }, areaStyle: { color: '#3bb3d126' } }] }
  },
  {
    title: '类型分布', subtitle: '今日', summary: eventTypes.length, unit: '类', note: '智能识别异常',
    description: eventTypes.map(item => item.name + item.value + ' 起').join('，'),
    option: {
      ...base, tooltip: { trigger: 'item', formatter: '{b}：{c} 起（{d}%）', confine: true },
      color: eventTypes.map(item => item.color),
      legend: { orient: 'vertical', right: 0, top: 'middle', itemWidth: 7, itemHeight: 7, itemGap: 12, icon: 'circle', textStyle: { color: '#97adc1', fontSize: 10 },
        formatter: (name: string) => name + '  ' + eventTypes.find(item => item.name === name)?.value },
      series: [{ name: '异常类型', type: 'pie', radius: ['49%', '72%'], center: ['29%', '50%'], avoidLabelOverlap: true, label: { show: false }, itemStyle: { borderColor: '#101f31', borderWidth: 3 }, data: eventTypes }]
    }
  },
  {
    title: '响应时间', subtitle: '今日 · 分钟', summary: (statistics.responseMinutes.reduce((sum, value) => sum + value, 0) / statistics.responseMinutes.length).toFixed(1), unit: '分钟', note: '各类型平均值',
    description: eventTypes.map((item, index) => item.name + '平均响应' + statistics.responseMinutes[index] + '分钟').join('，'),
    option: {
      ...base, grid: { left: 4, right: 10, top: 14, bottom: 4, containLabel: true },
      xAxis: { type: 'category', data: ['人员倒地', '异常滞留', '设备离线', '电动车'], axisLabel: { ...axisLabel, fontSize: 9, interval: 0 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#294258' } } },
      yAxis: { type: 'value', axisLabel, splitLine },
      series: [{ name: '平均响应（分钟）', type: 'bar', barWidth: 18, data: statistics.responseMinutes.map((value, index) => ({ value, itemStyle: { color: ['#50cee1', '#4ba5c7', '#547dab', '#59678f'][index], borderRadius: [3, 3, 0, 0] } })) }]
    }
  },
  {
    title: '在线率', subtitle: '近 7 日', summary: onlineRate, unit: '%', note: '当前设备在线率',
    description: '当前' + overview.cameras + '路摄像头中' + overview.online + '路在线。近七日在线率：' + statistics.onlineRates.join('%、') + '%。',
    option: { ...base, xAxis: categoryAxis, yAxis: { type: 'value', min: 95, max: 100, interval: 2.5, axisLabel: { ...axisLabel, formatter: '{value}%' }, splitLine },
      series: [{ name: '摄像头在线率（%）', type: 'line', data: statistics.onlineRates, smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#58d6b4' }, itemStyle: { color: '#58d6b4' }, areaStyle: { color: '#58d6b415' } }] }
  }
]
</script>
<style scoped lang="scss">
.statistics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; min-height: 0; border-radius: 4px; }
.statistic-panel { display: flex; flex-direction: column; min-width: 0; }
.chart-summary { display: flex; align-items: baseline; gap: 10px; margin-top: 2px; strong { font-size: 25px; line-height: 1.2; font-weight: 500; font-variant-numeric: tabular-nums; color: #d7ebf8; } small { margin-left: 5px; font-size: 11px; color: #87a1b9; font-weight: 400; } span { font-size: 10px; color: #6f88a1; } }
.chart-body { min-height: 0; flex: 1; margin-top: 7px; }
@media (max-width: 1000px) { .statistics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .statistic-panel { height: 240px; } }
@media (max-width: 600px) { .statistics-grid { grid-template-columns: 1fr; } }
</style>

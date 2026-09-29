<template>
  <section class="panel solution-panel" aria-labelledby="solution-heading">
    <div class="panel-heading"><h2 id="solution-heading">溶液余量</h2><span>{{ warningCount }} 台设备余量预警</span></div>

    <div class="solution-summary">
      <div class="solution-figure">
        <strong>{{ solutionSummary.overallLevel }}<small>%</small></strong>
        <span>溶液总量</span>
      </div>
      <div class="solution-bar-wrap">
        <div class="level-bar" role="img" :aria-label="'整体溶液余量 ' + solutionSummary.overallLevel + '%'">
          <div class="level-fill" :class="{ warn: solutionSummary.overallLevel < solutionSummary.warnThreshold }" :style="{ width: solutionSummary.overallLevel + '%' }"></div>
          <span class="threshold-marker" :style="{ left: solutionSummary.warnThreshold + '%' }" title="预警阈值"></span>
        </div>
        <div class="solution-meta">
          <span>预计可用 <b>{{ solutionSummary.estimateDays }}</b> 天</span>
          <span>今日耗液 <b>{{ solutionSummary.todayUsed }}</b> L</span>
          <span>预警阈值 {{ solutionSummary.warnThreshold }}%</span>
        </div>
      </div>
    </div>

    <h3 class="subheading">各设备余量 <span>按余量从低到高</span></h3>
    <ul class="device-list">
      <li v-for="device in sortedDevices" :key="device.id" class="device-row">
        <div class="device-top">
          <span class="device-name">{{ device.name }}</span>
          <span class="device-level" :class="device.status">{{ device.level }}%</span>
        </div>
        <div class="device-bar" role="img" :aria-label="device.name + '余量 ' + device.level + '%'">
          <div class="level-fill" :class="device.status" :style="{ width: device.level + '%' }"></div>
        </div>
        <div class="device-meta">
          <span :class="['device-status', device.status]">{{ statusLabels[device.status] }}</span>
          <span>容量 {{ device.capacity }}L · {{ device.lastRefill }}补液</span>
        </div>
      </li>
    </ul>

    <div class="solution-legend">
      <span><i class="normal"></i>正常</span>
      <span><i class="low"></i>偏低</span>
      <span><i class="warning"></i>预警</span>
      <span class="legend-note">余量低于 20% 触发预警</span>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { solutionDevices, solutionSummary, type SolutionDevice } from '../mock/disinfection'

const statusLabels: Record<SolutionDevice['status'], string> = { normal: '正常', low: '偏低', warning: '余量预警' }
const warningCount = solutionDevices.filter(device => device.status === 'warning').length
const sortedDevices = computed(() => [...solutionDevices].sort((left, right) => left.level - right.level))
</script>
<style scoped lang="scss">
.solution-panel { display: flex; flex-direction: column; min-height: 0; }
.solution-summary { display: flex; align-items: center; gap: 22px; padding: 4px 2px 16px; border-bottom: 1px solid #21364c; }
.solution-figure { flex: none; text-align: center; strong { display: block; font-size: clamp(38px, 4vw, 56px); font-weight: 600; line-height: 1; color: #59d6b3; font-variant-numeric: tabular-nums; small { font-size: 20px; color: #7b93a9; margin-left: 3px; } } span { display: block; margin-top: 8px; font-size: 11px; color: #7e94aa; } }
.solution-bar-wrap { flex: 1; min-width: 0; }
.level-bar { position: relative; height: 10px; border-radius: 5px; background: #14283d; border: 1px solid #2a4257; overflow: hidden; }
.level-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #3f97ad, #54cbb9); transition: width .4s;
  &.warn { background: linear-gradient(90deg, #ff9a5c, #ff647c); }
  &.low { background: linear-gradient(90deg, #f5b86e, #ffbf69); }
  &.warning { background: linear-gradient(90deg, #ff9a5c, #ff647c); } }
.threshold-marker { position: absolute; top: -3px; bottom: -3px; width: 2px; background: #ffbf69; box-shadow: 0 0 4px #ffbf69aa; }
.solution-meta { display: flex; flex-wrap: wrap; gap: 6px 20px; margin-top: 12px; font-size: 10px; color: #6e859e; b { color: #c2d6e6; font-weight: 500; } }
.subheading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 15px 0 9px; color: #bcd0e0; font-size: 12px; font-weight: 500; > span { color: #607b96; font-size: 10px; font-weight: 400; } }
.device-list { min-height: 0; flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #385571 transparent; padding-right: 4px; }
.device-row { padding: 10px 2px; border-bottom: 1px solid #21364c; &:last-child { border-bottom: 0; } }
.device-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.device-name { font-size: 12px; color: #bccfe0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.device-level { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; color: #59d6b3; &.low { color: #ffbf69; } &.warning { color: #ff647c; } }
.device-bar { position: relative; height: 7px; margin-top: 9px; border-radius: 4px; background: #14283d; border: 1px solid #2a4257; overflow: hidden; }
.device-meta { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; font-size: 10px; color: #607b96; }
.device-status { &.normal { color: #54cbb9; } &.low { color: #ffbf69; } &.warning { color: #ff647c; } }
.solution-legend { display: flex; align-items: center; gap: 16px; border-top: 1px solid #263b4f; margin-top: 12px; padding-top: 11px; font-size: 10px; color: #8b9fb4; span { display: flex; align-items: center; gap: 6px; } i { width: 6px; height: 6px; border-radius: 50%; &.normal { background: #54cbb9; } &.low { background: #ffbf69; } &.warning { background: #ff647c; } } .legend-note { color: #607b96; margin-left: auto; } }
@media (max-width: 600px) { .solution-summary { flex-direction: column; gap: 14px; align-items: stretch; text-align: center; } }
</style>

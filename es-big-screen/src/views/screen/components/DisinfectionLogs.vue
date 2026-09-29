<template>
  <section class="panel logs-panel" aria-labelledby="logs-heading">
    <div class="panel-heading"><h2 id="logs-heading">运行日志</h2><span>消杀开始 / 结束 · 余量预警</span></div>

    <div class="log-filters" aria-label="筛选日志类型">
      <button type="button" :class="{ selected: !filter }" @click="filter = ''">全部</button>
      <button type="button" :class="{ selected: filter === 'start' }" @click="filter = 'start'">消杀开始</button>
      <button type="button" :class="{ selected: filter === 'end' }" @click="filter = 'end'">消杀结束</button>
      <button type="button" :class="{ selected: filter === 'warning' }" @click="filter = 'warning'">余量预警</button>
    </div>

    <ul class="log-list">
      <li v-for="log in filteredLogs" :key="log.id" class="log-item">
        <span class="log-mark" :class="log.kind"></span>
        <div class="log-body">
          <div class="log-top">
            <span class="log-kind" :class="log.kind">{{ kindLabels[log.kind] }}</span>
            <time>{{ log.time }}</time>
          </div>
          <div class="log-location">{{ log.location }}</div>
          <div class="log-detail">{{ log.detail }}</div>
        </div>
      </li>
    </ul>

    <div class="logs-footer">今日共 {{ logs.length }} 条<span>展示最近 {{ filteredLogs.length }} 条 · 演示数据</span></div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { disinfectionLogs, type DisinfectionLogKind } from '../mock/disinfection'

const filter = ref<DisinfectionLogKind | ''>('')
const logs = disinfectionLogs
const kindLabels: Record<DisinfectionLogKind, string> = { start: '消杀开始', end: '消杀结束', warning: '余量预警' }
const filteredLogs = computed(() => logs.filter(log => !filter.value || log.kind === filter.value))
</script>
<style scoped lang="scss">
.logs-panel { display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.log-filters { display: flex; flex-wrap: wrap; gap: 5px; margin: 3px 0 10px; button { background: #14283d; border: 1px solid #233d53; color: #91a9be; border-radius: 3px; padding: 4px 7px; font: inherit; font-size: 10px; cursor: pointer; } .selected, button:hover { color: #67d9e8; border-color: #388597; background: #163647; } }
.log-list { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #385571 transparent; padding: 2px 4px 2px 2px; }
.log-item { position: relative; display: flex; gap: 12px; padding: 12px 2px; border-bottom: 1px solid #21364c;
  &:last-child { border-bottom: 0; }
  &::before { content: ''; position: absolute; left: 6px; top: 26px; bottom: -13px; width: 1px; background: #263b4f; }
  &:last-child::before { display: none; } }
.log-mark { flex: none; position: relative; z-index: 1; width: 13px; height: 13px; margin-top: 3px; border-radius: 50%; box-sizing: border-box;
  &.start { background: #54cbb9; box-shadow: 0 0 0 3px #54cbb91f; }
  &.end { background: #50cee1; box-shadow: 0 0 0 3px #50cee11f; }
  &.warning { background: #ff647c; box-shadow: 0 0 0 3px #ff647c26; } }
.log-body { min-width: 0; }
.log-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; time { color: #68839d; font-size: 10px; font-variant-numeric: tabular-nums; } }
.log-kind { font-size: 12px; font-weight: 500;
  &.start { color: #54cbb9; } &.end { color: #6bd0e2; } &.warning { color: #ff7c8f; } }
.log-location { margin: 6px 0 3px; font-size: 11px; color: #c2d4e4; }
.log-detail { font-size: 10px; color: #7e94aa; line-height: 1.6; }
.logs-footer { display: flex; justify-content: space-between; gap: 5px; border-top: 1px solid #263b4f; margin-top: 10px; padding-top: 11px; font-size: 10px; color: #8b9fb4; span { color: #607b96; } }
</style>

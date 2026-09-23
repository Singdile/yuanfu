<template>
  <section class="panel overview-panel" aria-labelledby="overview-heading">
    <div class="panel-heading"><h2 id="overview-heading">接入概况</h2><span>全县汇总</span></div>
    <div class="metric-list">
      <div v-for="(item, index) in metrics" :key="item.label" class="metric-row" :style="{ '--metric-color': item.color }">
        <span class="metric-index">0{{ index + 1 }}</span>
        <div class="metric-info"><span>{{ item.label }}</span><small>{{ item.note }}</small></div>
        <div class="metric-value">{{ item.value }}<small>{{ item.unit }}</small></div>
      </div>
    </div>
    <div class="overview-note"><span class="status-dot"></span>覆盖 {{ overview.communities }} 个小区 · {{ overview.elevators }} 部电梯</div>
  </section>
</template>
<script setup lang="ts">
import { overview, onlineRate, todayEvents, recentEvents } from '../data'
const metrics = [
  { label: '接入小区数', value: overview.communities, unit: '个', note: '平台服务范围', color: '#76d7ed' },
  { label: '接入电梯数', value: overview.elevators, unit: '部', note: '纳入监控的电梯', color: '#76d7ed' },
  { label: '在线摄像头', value: overview.online, unit: '路', note: '共 ' + overview.cameras + ' 路设备', color: '#76d7ed' },
  { label: '摄像头在线率', value: onlineRate, unit: '%', note: '离线 ' + (overview.cameras - overview.online) + ' 路', color: '#59d6b3' },
  { label: '今日异常', value: todayEvents, unit: '起', note: '今日累计识别', color: '#ffbf69' },
  { label: '待处理事件', value: recentEvents.filter(item => item.status === '待处理').length, unit: '起', note: '另有 ' + recentEvents.filter(item => item.status === '处理中').length + ' 起处理中', color: '#ff7c8f' }
]
</script>
<style scoped lang="scss">
.overview-panel { display: flex; flex-direction: column; }
.metric-list { flex: 1; display: grid; grid-template-rows: repeat(6, 1fr); min-height: 0; }
.metric-row { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #21354b; min-height: 47px; padding: 7px 0; }
.metric-row:last-child { border-bottom: 0; }
.metric-index { font-size: 10px; color: #5b7590; font-variant-numeric: tabular-nums; border-left: 2px solid var(--metric-color); padding-left: 7px; }
.metric-info { flex: 1; font-size: 13px; white-space: nowrap; color: #b9cada; small { display: block; font-size: 10px; margin-top: 5px; color: #6e859e; } }
.metric-value { color: var(--metric-color); font-size: clamp(24px, 2vw, 34px); font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -1px; small { font-size: 11px; font-weight: 400; color: #8a9fb5; margin-left: 4px; letter-spacing: 0; } }
.overview-note { padding-top: 12px; margin-top: 5px; border-top: 1px solid #21354b; color: #7e94aa; font-size: 10px; }
@media (max-width: 1100px) and (min-width: 1001px) { .metric-index { display: none; } .metric-value { font-size: 25px; } }
@media (max-width: 1000px) { .metric-list { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, auto); gap: 8px 20px; } .metric-index { display: none; } .metric-value { font-size: 26px; } .overview-note { display: none; } }
@media (max-width: 600px) { .metric-list { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, auto); gap: 5px 16px; } .metric-info { font-size: 11px; } .metric-value { font-size: 23px; } .metric-info small { font-size: 9px; } }
</style>

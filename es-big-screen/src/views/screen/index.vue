<template>
  <div class="platform-screen">
    <Header :active-tab="activeTab" @navigate="navigate" />
    <main id="overview" class="overview-grid" aria-label="综合态势">
      <OverviewMetrics />
      <CountyMap />
      <LiveEvents @select="showEvent" />
    </main>
    <Statistics ref="statisticsRef" />
    <footer class="platform-footer"><span>电梯安全监测 · 县域综合态势</span><span>演示数据 / 未连接监控设备与业务接口</span></footer>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="min(760px, 92vw)" class="platform-dialog" :close-on-click-modal="false" @closed="closeDialog">
      <template v-if="selectedEvent">
        <div class="event-detail"><span class="detail-status">{{ selectedEvent.status }}</span><h3>{{ selectedEvent.type }}</h3><p>{{ selectedEvent.description }}</p></div>
        <dl class="detail-grid"><dt>事件编号</dt><dd>{{ selectedEvent.id }}</dd><dt>发生位置</dt><dd>{{ selectedEvent.location }}</dd><dt>触发时间</dt><dd>今日 {{ selectedEvent.time }}</dd></dl>
        <p class="dialog-note">演示事件，未接入真实视频与事件处置接口。</p>
      </template>
      <template v-else-if="activeTab === 'monitor'">
        <p class="dialog-intro">重点小区设备接入概况</p>
        <div class="table-scroll"><table><thead><tr><th>小区</th><th>接入电梯</th><th>在线摄像头</th><th>设备状态</th></tr></thead><tbody><tr v-for="item in communities" :key="item.name"><td>{{ item.name }}</td><td>{{ item.elevators }} 部</td><td>{{ item.online }} / {{ item.elevators }}</td><td :class="{ 'warning-text': item.online < item.elevators }">{{ item.online < item.elevators ? '部分离线' : '全部在线' }}</td></tr></tbody></table></div>
        <p class="dialog-note">演示设备信息；接入真实视频流后可扩展电梯实时画面。</p>
      </template>
      <template v-else-if="activeTab === 'events'">
        <p class="dialog-intro">最近异常事件 · 点击记录查看详情</p>
        <div class="table-scroll"><table><thead><tr><th>异常类型</th><th>发生位置</th><th>时间</th><th>状态</th></tr></thead><tbody><tr v-for="item in recentEvents" :key="item.id"><td><button class="table-link" type="button" @click="selectedEvent = item">{{ item.type }}</button></td><td>{{ item.location }}</td><td>{{ item.time }}</td><td>{{ item.status }}</td></tr></tbody></table></div>
        <p class="dialog-note">演示记录；右侧实时异常面板支持按类型筛选。</p>
      </template>
      <template v-else-if="activeTab === 'disinfection'">
        <p class="dialog-intro">今日消杀计划与执行记录</p>
        <div class="table-scroll"><table><thead><tr><th>消杀位置</th><th>计划时间</th><th>执行人员</th><th>状态</th></tr></thead><tbody><tr v-for="item in disinfectionRecords" :key="item.location"><td>{{ item.location }}</td><td>{{ item.time }}</td><td>{{ item.operator }}</td><td :class="{ 'warning-text': item.status === '待执行' }">{{ item.status }}</td></tr></tbody></table></div>
        <p class="dialog-note">演示记录，未连接消杀设备与工单系统。</p>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElDialog } from 'element-plus'
import Header from './components/Header.vue'
import OverviewMetrics from './components/OverviewMetrics.vue'
import CountyMap from './components/CountyMap.vue'
import LiveEvents from './components/LiveEvents.vue'
import Statistics from './components/Statistics.vue'
import { communities, disinfectionRecords, navigation, recentEvents, type ElevatorEvent, type NavigationTab } from './data'

const activeTab = ref<NavigationTab>('overview')
const dialogVisible = ref(false)
const selectedEvent = ref<ElevatorEvent | null>(null)
const statisticsRef = ref<InstanceType<typeof Statistics>>()
const dialogTitle = computed(() => selectedEvent.value ? '异常事件详情' : navigation.find(item => item.id === activeTab.value)?.label)
function navigate(tab: NavigationTab) {
  activeTab.value = tab
  if (tab === 'statistics') statisticsRef.value?.focus()
  else if (tab === 'overview') window.scrollTo({ top: 0, behavior: 'smooth' })
  else { selectedEvent.value = null; dialogVisible.value = true }
}
function showEvent(event: ElevatorEvent) {
  selectedEvent.value = event
  dialogVisible.value = true
}
function closeDialog() { selectedEvent.value = null; activeTab.value = 'overview' }
</script>

<style lang="scss" scoped>
.platform-screen {
  --es-screen-text-color: #deebf6;
  display: grid;
  grid-template-rows: auto minmax(340px, 1fr) clamp(215px, 24vh, 270px) auto;
  gap: 14px;
  width: 100%;
  height: 100vh;
  min-height: 760px;
  padding: 12px 24px 14px;
  background: radial-gradient(ellipse at 50% 0%, #162e46 0%, #0a1728 48%, #091525 100%);
  color: #deebf6;
}
.overview-grid { display: grid; grid-template-columns: minmax(245px, 1fr) minmax(0, 2.8fr) minmax(290px, 1.15fr); gap: 14px; min-height: 0; }
.platform-screen :deep(.panel) { min-width: 0; min-height: 0; padding: 16px 18px; background: #101f31; border: 1px solid #23394e; border-radius: 4px; }
.platform-screen :deep(.panel-heading) { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px;
  h2 { position: relative; padding-left: 10px; font-size: 14px; font-weight: 500; letter-spacing: 1px; white-space: nowrap; &::before { position: absolute; content: ''; left: 0; top: 3px; bottom: 3px; width: 2px; background: #59cadd; } }
  > span { font-size: 10px; color: #7791ab; white-space: nowrap; }
}
.platform-screen :deep(.status-dot) { display: inline-block; width: 5px; height: 5px; border-radius: 50%; margin-right: 7px; background: #54cbb9; }
.platform-screen :deep(button:focus-visible), .platform-screen :deep([tabindex]:focus-visible) { outline: 2px solid #66e0e9; outline-offset: 3px; }
.platform-footer { display: flex; justify-content: space-between; gap: 10px; font-size: 10px; letter-spacing: 1px; color: #607b96; }
@media (min-width: 1700px) { .overview-grid { grid-template-columns: minmax(300px, 1fr) minmax(0, 2.8fr) minmax(340px, 1.15fr); } .platform-screen :deep(.panel-heading h2) { font-size: 16px; } }
@media (max-width: 1100px) { .platform-screen { padding-right: 16px; padding-left: 16px; } .overview-grid { grid-template-columns: 225px minmax(0, 1fr) 265px; } .platform-screen :deep(.panel) { padding: 14px; } }
@media (max-width: 1000px) { .platform-screen { height: auto; min-height: 100vh; grid-template-rows: auto auto auto auto; } .overview-grid { grid-template-columns: minmax(0, 1fr) 300px; grid-template-rows: auto 440px; } .overview-grid > :first-child { grid-column: 1 / -1; } }
@media (max-width: 680px) { .platform-screen { padding: 0 12px 14px; } .overview-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto 370px 430px; } .platform-footer { flex-direction: column; font-size: 9px; gap: 6px; } }
</style>
<style lang="scss">
.platform-dialog {
  --el-dialog-bg-color: #12263b;
  --el-text-color-primary: #e0edf8;
  --el-text-color-regular: #a9bfd1;
  --el-color-primary: #55cadc;
  border: 1px solid #35536b;
  border-radius: 8px;
  .el-dialog__header { border-bottom: 1px solid #2b4258; padding-bottom: 18px; margin-right: 0; }
  .el-dialog__title { font-size: 18px; }
  .el-dialog__body { padding-top: 20px; }
  .dialog-intro { margin-bottom: 18px; color: #bad0e0; font-size: 13px; }
  .table-scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; white-space: nowrap; }
  th { color: #789bb6; font-weight: 500; background: #172e44; }
  td, th { padding: 14px 10px; border-bottom: 1px solid #294056; }
  .warning-text, .detail-status { color: #ffbd7d; }
  .table-link { background: none; border: 0; color: #66d8e4; font: inherit; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  .dialog-note { margin-top: 20px; font-size: 11px; color: #7f9ab2; line-height: 1.8; }
  .event-detail { h3 { font-size: 21px; color: #e1eff7; margin-bottom: 12px; } p { line-height: 1.8; } }
  .detail-status { float: right; padding: 4px 8px; background: #ffbf6915; border: 1px solid #a47a4944; font-size: 12px; }
  .detail-grid { display: grid; grid-template-columns: 80px 1fr; gap: 18px; margin-top: 26px; font-size: 13px; dt { color: #7797af; } dd { color: #c0d3e2; } }
  button:focus-visible { outline: 2px solid #66e0e9; outline-offset: 3px; }
}
@media (prefers-reduced-motion: reduce) { .platform-screen *, .platform-dialog * { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
</style>

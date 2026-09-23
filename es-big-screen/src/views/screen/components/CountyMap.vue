<template>
  <section id="monitor-map" class="panel map-panel" aria-labelledby="map-heading">
    <div class="panel-heading"><h2 id="map-heading">{{ countyName }}电梯监控分布</h2><span class="map-badge">县域示意</span></div>
    <div class="map-caption">重点小区监测点 <span>悬停查看概况 · 点击查看小区详情</span></div>
    <div class="map-canvas">
      <svg viewBox="0 0 820 470" role="group" aria-label="县域示意地图，展示六个重点小区，不代表真实行政区划">
        <defs>
          <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1d3b51" stroke-width=".5"/></pattern>
          <linearGradient id="county-fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#193c55"/><stop offset="1" stop-color="#102b41"/></linearGradient>
          <clipPath id="county-clip"><path :d="countyOutline"/></clipPath>
        </defs>
        <rect width="820" height="470" fill="url(#map-grid)" opacity=".55"/>
        <path :d="countyOutline" fill="#071524" stroke="#122f45" stroke-width="12" transform="translate(0 7)"/>
        <path :d="countyOutline" fill="url(#county-fill)" stroke="#4b8dac" stroke-width="1.5"/>
        <g clip-path="url(#county-clip)">
          <path d="M180 130L390 130L465 65M390 130L435 250L700 235M435 250L350 360L355 440M435 250L500 375L690 385M180 270L435 250" fill="none" stroke="#467088" stroke-dasharray="5 5" opacity=".6"/>
          <path d="M320 35C460 125 290 150 435 260S460 355 650 445" fill="none" stroke="#173249" stroke-width="22"/>
          <path d="M320 35C460 125 290 150 435 260S460 355 650 445" fill="none" stroke="#2d6684" stroke-width="12" opacity=".7"/>
          <path d="M120 235L685 175M245 80L290 390M540 80L560 420M155 340L650 290" fill="none" stroke="#527086" stroke-width="2" opacity=".25"/>
          <path d="M190 247L650 205M315 110L360 370M460 100L630 325" fill="none" stroke="#527086" stroke-width="1" opacity=".3"/>
        </g>
        <text x="270" y="120" class="area-label">西北片区</text><text x="520" y="95" class="area-label">北部片区</text>
        <text x="630" y="305" class="area-label">东部片区</text><text x="340" y="410" class="area-label">南部片区</text>
          <g v-for="item in communities" :key="item.id" :ref="element => setPointRef(item.id, element)"
            role="button" tabindex="0" class="map-point" :data-community-id="item.id"
            :aria-label="item.name + '，' + statusMeta[item.status].label + '，' + item.buildingCount + ' 栋楼，' + item.elevatorCount + ' 部电梯，点击查看小区详情'"
            @click="openCommunity(item.id)" @keydown.enter.prevent="openCommunity(item.id)" @keydown.space.prevent="openCommunity(item.id)">
            <circle :cx="item.x" :cy="item.y" :r="selectedCommunityId === item.id ? 22 : 15" :fill="statusMeta[item.status].color + '15'" :stroke="statusMeta[item.status].color + '55'"/>
            <circle :cx="item.x" :cy="item.y" r="6" :fill="statusMeta[item.status].color"/>
            <circle :cx="item.x" :cy="item.y" r="2" fill="#efffff"/>
            <text :x="item.x + 15" :y="item.y - 14" class="point-label">{{ item.name }}</text>
          </g>
        <g transform="translate(756 45)" class="compass"><path d="M0 22L8 0L16 22L8 16Z" fill="#7b9db6"/><text x="8" y="-9" text-anchor="middle">N</text></g>
        <text x="27" y="448" class="map-disclaimer">示意地图 · 非真实行政边界</text>
      </svg>
      <!-- 提示组件放在 SVG 外，通过点位引用定位，避免 HTML 内容继承 SVG 命名空间。 -->
      <ElTooltip v-for="item in communities" :key="item.id" placement="top" virtual-triggering :virtual-ref="pointRefs[item.id]"
        :trigger="['hover', 'focus']" :trigger-keys="[]" :show-after="120" :disabled="detailVisible"
        :popper-style="{ background: '#12263b', border: '1px solid #35536b', padding: '14px' }">
        <template #content>
          <div class="community-hover">
            <strong>{{ item.name }}</strong>
            <span class="community-status" :style="{ color: statusMeta[item.status].color }"><i></i>{{ statusMeta[item.status].label }}</span>
            <dl><dt>楼栋</dt><dd>{{ item.buildingCount }} 栋</dd><dt>电梯</dt><dd>{{ item.elevatorCount }} 部</dd><dt>在线摄像头</dt><dd>{{ item.onlineCount }} 路</dd><dt>当前异常</dt><dd>{{ item.alarmCount }} 起</dd><dt>今日事件</dt><dd>{{ item.todayEventCount }} 起</dd></dl>
            <small>演示数据 · 点击查看小区详情</small>
          </div>
        </template>
      </ElTooltip>
    </div>
    <div class="map-bottom">
      <div class="selected-point" aria-live="polite"><span class="status-dot" :style="{ background: statusMeta[selectedCommunity.status].color }"></span><strong>{{ selectedCommunity.name }}</strong><span>{{ selectedCommunity.elevatorCount }} 部电梯</span><span>在线 {{ selectedCommunity.onlineCount }}/{{ selectedCommunity.elevatorCount }}</span></div>
      <div class="map-legend"><span v-for="(meta, status) in statusMeta" :key="status"><i :style="{ background: meta.color }"></i>{{ meta.legend }}</span></div>
    </div>

    <ElDialog v-model="detailVisible" :title="(selectedElevator?.name ?? selectedBuilding?.name ?? selectedCommunity.name) + '详情'" width="min(760px, 92vw)"
      class="platform-dialog" append-to-body destroy-on-close :close-on-click-modal="false">
      <div ref="detailContentRef" class="community-detail" tabindex="-1">
        <template v-if="selectedElevator && selectedBuilding">
          <nav class="detail-breadcrumb" aria-label="小区下钻导航">
            <button type="button" @click="backToCommunity">{{ selectedCommunity.name }}</button><span aria-hidden="true">›</span>
            <button type="button" @click="backToBuilding">{{ selectedBuilding.name }}</button><span aria-hidden="true">›</span>
            <span aria-current="page">{{ selectedElevator.name }}</span>
          </nav>
          <ElevatorDetail :key="selectedElevator.id" :elevator="selectedElevator" :events="events" :active="detailVisible" />
        </template>
        <template v-else-if="selectedBuilding">
          <nav class="detail-breadcrumb" aria-label="小区下钻导航">
            <button type="button" @click="backToCommunity">{{ selectedCommunity.name }}</button>
            <span aria-hidden="true">›</span><span aria-current="page">{{ selectedBuilding.name }}</span>
          </nav>
          <div class="community-detail-heading"><span>楼栋编号：{{ selectedBuilding.id }}</span><span class="community-status" :style="{ color: statusMeta[selectedBuilding.status].color }"><i></i>{{ statusMeta[selectedBuilding.status].label }}</span></div>
          <dl class="community-summary building-summary">
            <div><dt>电梯总数</dt><dd>{{ buildingOverview.elevatorCount }}<small>部</small></dd></div>
            <div><dt>在线摄像头</dt><dd>{{ buildingOverview.onlineCount }}<small>路</small></dd></div>
            <div><dt>当前异常</dt><dd>{{ buildingOverview.alarmCount }}<small>起</small></dd></div>
          </dl>
          <h3 class="building-list-heading">电梯列表 <span>{{ selectedElevators.length }} 部</span></h3>
          <ul class="elevator-list">
            <li v-for="elevator in selectedElevators" :key="elevator.id">
              <button type="button" class="elevator-card" :data-elevator-id="elevator.id" :aria-label="selectedBuilding.name + '，' + elevator.name + '，查看电梯详情'" @click="openElevator(elevator.id)">
                <span class="building-card-heading"><strong>{{ elevator.name }}</strong><span class="community-status" :style="{ color: statusMeta[elevator.status].color }"><i></i>{{ statusMeta[elevator.status].label }}</span></span>
                <span class="elevator-card-line">摄像头：{{ elevator.cameraStatus === 'online' ? '在线' : '离线' }}<span class="person-count">当前人数：{{ elevator.personCount ?? '未知' }}</span></span>
                <span class="elevator-card-line" :class="{ 'current-alarm': elevator.currentEvent }">当前异常：{{ elevator.currentEvent ? (elevator.currentEvent.type === '人员倒地' ? '疑似人员倒地' : elevator.currentEvent.type) : '无' }}</span>
                <span v-if="elevator.currentEvent" class="elevator-card-line elevator-event-meta">{{ elevator.currentEvent.time.slice(11) }} · {{ eventStatusLabels[elevator.currentEvent.status] }}</span>
                <small>电梯 {{ elevator.id }} · 摄像头 {{ elevator.cameraId }}<span>查看详情 ›</span></small>
              </button>
            </li>
          </ul>
          <p v-if="!selectedElevators.length" class="community-demo-note">该楼栋暂无电梯数据。</p>
          <p class="community-demo-note">演示数据，展示该楼栋的电梯及当前异常。</p>
        </template>
        <template v-else>
        <div class="community-detail-heading"><span>小区编号：{{ selectedCommunity.id }}</span><span class="community-status" :style="{ color: statusMeta[selectedCommunity.status].color }"><i></i>{{ statusMeta[selectedCommunity.status].label }}</span></div>
        <dl class="community-summary">
          <div><dt>楼栋</dt><dd>{{ selectedCommunity.buildingCount }}<small>栋</small></dd></div>
          <div><dt>电梯</dt><dd>{{ selectedCommunity.elevatorCount }}<small>部</small></dd></div>
          <div><dt>在线摄像头</dt><dd>{{ selectedCommunity.onlineCount }}<small>路</small></dd></div>
          <div><dt>当前异常</dt><dd>{{ selectedCommunity.alarmCount }}<small>起</small></dd></div>
          <div><dt>今日事件</dt><dd>{{ selectedCommunity.todayEventCount }}<small>起</small></dd></div>
        </dl>
        <h3 class="building-list-heading">楼栋列表 <span>{{ selectedBuildings.length }} 栋</span></h3>
        <ul class="building-list">
          <li v-for="building in selectedBuildings" :key="building.id">
            <button type="button" class="building-card" :data-building-id="building.id" :aria-label="selectedCommunity.name + '，' + building.name + '，查看电梯列表'" @click="openBuilding(building.id)">
              <span class="building-card-heading"><strong>{{ building.name }}</strong><span class="community-status" :style="{ color: statusMeta[building.status].color }"><i></i>{{ statusMeta[building.status].label }}</span></span>
              <span class="building-card-line">电梯 {{ building.elevatorCount }} 部 · 在线摄像头 {{ building.onlineCount }} 路</span>
              <span class="building-card-line">当前异常 {{ building.alarmCount }} 起 · 今日事件 {{ building.todayEventCount }} 起</span>
              <small>{{ building.id }}<span>查看电梯 ›</span></small>
            </button>
          </li>
        </ul>
        <p class="community-demo-note">演示数据，仅展示重点小区的接入概况与楼栋信息。</p>
        </template>
      </div>
    </ElDialog>
  </section>
</template>
<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { ElDialog, ElTooltip } from 'element-plus'
import { countyName } from '../data'
import { createElevatorMocks } from '../mock/elevators'
import { createEventMocks, eventStatusLabels } from '../mock/events'
import ElevatorDetail from './ElevatorDetail.vue'

type BusinessStatus = 'normal' | 'warning' | 'danger' | 'offline'
interface Building {
  id: string
  communityId: string
  name: string
  elevatorCount: number
  onlineCount: number
  alarmCount: number
  todayEventCount: number
  status: BusinessStatus
}
interface Community {
  id: string
  name: string
  lng: number
  lat: number
  x: number
  y: number
  buildingCount: number
  elevatorCount: number
  onlineCount: number
  alarmCount: number
  todayEventCount: number
  status: BusinessStatus
}
const statusMeta: Record<BusinessStatus, { label: string; legend: string; color: string }> = {
  normal: { label: '正常', legend: '正常', color: '#5be1de' },
  warning: { label: '一般异常', legend: '一般异常', color: '#ffbf69' },
  danger: { label: '紧急异常', legend: '紧急异常', color: '#ff647c' },
  offline: { label: '设备离线', legend: '离线', color: '#8395bd' }
}

// 小区与楼栋 Mock 暂放这里，电梯 Mock 已单独保存在 mock/elevators.ts。
// ID 显式固定，关系使用 communityId；lng/lat 为模拟经纬度，x/y 仅用于当前 SVG 示意图。
const communitySeeds: Pick<Community, 'id' | 'name' | 'lng' | 'lat' | 'x' | 'y'>[] = [
  { id: 'C001', name: '阳光花园', lng: 120.123, lat: 30.123, x: 370, y: 175 },
  { id: 'C002', name: '滨河雅苑', lng: 120.135, lat: 30.118, x: 595, y: 245 },
  { id: 'C003', name: '金桂家园', lng: 120.116, lat: 30.110, x: 285, y: 320 },
  { id: 'C004', name: '幸福里', lng: 120.128, lat: 30.105, x: 500, y: 375 },
  { id: 'C005', name: '中央公馆', lng: 120.138, lat: 30.130, x: 595, y: 130 },
  { id: 'C006', name: '书香名邸', lng: 120.110, lat: 30.121, x: 230, y: 200 }
]
// 元组字段：楼栋 ID、小区 ID、名称、电梯数、在线数、当前异常数、今日事件数、状态。
const buildingSeeds: [string, string, string, number, number, number, number, BusinessStatus][] = [
  ['B001', 'C001', '1号楼', 3, 3, 0, 0, 'normal'],
  ['B002', 'C001', '2号楼', 3, 3, 0, 0, 'normal'],
  ['B003', 'C001', '3号楼', 3, 3, 1, 6, 'danger'],
  ['B004', 'C001', '4号楼', 3, 3, 0, 0, 'normal'],
  ['B005', 'C002', '1号楼', 2, 2, 0, 1, 'normal'],
  ['B006', 'C002', '2号楼', 2, 2, 1, 4, 'warning'],
  ['B007', 'C002', '3号楼', 2, 2, 0, 0, 'normal'],
  ['B008', 'C002', '4号楼', 2, 2, 0, 0, 'normal'],
  ['B009', 'C003', '1号楼', 2, 2, 0, 0, 'normal'],
  ['B010', 'C003', '2号楼', 2, 2, 0, 0, 'normal'],
  ['B011', 'C003', '3号楼', 2, 2, 0, 0, 'normal'],
  ['B012', 'C003', '4号楼', 2, 2, 0, 1, 'normal'],
  ['B013', 'C003', '5号楼', 2, 2, 1, 3, 'warning'],
  ['B014', 'C004', '1号楼', 2, 0, 1, 3, 'offline'],
  ['B015', 'C004', '2号楼', 2, 1, 0, 0, 'offline'],
  ['B016', 'C004', '3号楼', 2, 2, 0, 0, 'normal'],
  ['B017', 'C005', '1号楼', 2, 2, 0, 1, 'normal'],
  ['B018', 'C005', '2号楼', 2, 2, 0, 0, 'normal'],
  ['B019', 'C005', '3号楼', 2, 2, 0, 0, 'normal'],
  ['B020', 'C005', '4号楼', 2, 2, 0, 0, 'normal'],
  ['B021', 'C005', '5号楼', 2, 2, 0, 0, 'normal'],
  ['B022', 'C005', '6号楼', 2, 2, 1, 3, 'warning'],
  ['B023', 'C005', '7号楼', 2, 2, 0, 0, 'normal'],
  ['B024', 'C005', '8号楼', 2, 2, 0, 0, 'normal'],
  ['B025', 'C006', '1号楼', 2, 2, 0, 0, 'normal'],
  ['B026', 'C006', '2号楼', 2, 2, 1, 2, 'warning'],
  ['B027', 'C006', '3号楼', 2, 2, 0, 0, 'normal'],
  ['B028', 'C006', '4号楼', 2, 2, 0, 0, 'normal']
]
const buildings: Building[] = buildingSeeds.map(([id, communityId, name, elevatorCount, onlineCount, alarmCount, todayEventCount, status]) => ({
  id, communityId, name, elevatorCount, onlineCount, alarmCount, todayEventCount, status
}))
// 汇总优先级：紧急异常 > 一般异常 > 设备离线 > 正常；在线数同时保留离线信息。
const statusPriority: BusinessStatus[] = ['danger', 'warning', 'offline', 'normal']
const communities: Community[] = communitySeeds.map(community => {
  const children = buildings.filter(building => building.communityId === community.id)
  return {
    ...community,
    buildingCount: children.length,
    elevatorCount: children.reduce((sum, building) => sum + building.elevatorCount, 0),
    onlineCount: children.reduce((sum, building) => sum + building.onlineCount, 0),
    alarmCount: children.reduce((sum, building) => sum + building.alarmCount, 0),
    todayEventCount: children.reduce((sum, building) => sum + building.todayEventCount, 0),
    status: statusPriority.find(status => children.some(building => building.status === status)) ?? 'normal'
  }
})

const emit = defineEmits<{ (event: 'community-select', communityId: string): void }>()
const pointRefs = ref<Record<string, SVGElement>>({})
function setPointRef(communityId: string, element: unknown) {
  if (element instanceof SVGElement) pointRefs.value[communityId] = element
  else delete pointRefs.value[communityId]
}
const selectedCommunityId = ref(communities[0].id)
const selectedBuildingId = ref<string | null>(null)
const selectedElevatorId = ref<string | null>(null)
const detailVisible = ref(false)
const detailContentRef = ref<HTMLElement | null>(null)
const selectedCommunity = computed(() => communities.find(item => item.id === selectedCommunityId.value) ?? communities[0])
const selectedBuildings = computed(() => buildings.filter(item => item.communityId === selectedCommunityId.value))
const selectedBuilding = computed(() => selectedBuildings.value.find(item => item.id === selectedBuildingId.value) ?? null)
const elevators = createElevatorMocks(buildings)
const events = createEventMocks(elevators)
const selectedElevators = computed(() => selectedBuilding.value ? elevators
  .filter(item => item.buildingId === selectedBuilding.value!.id)
  .map(elevator => ({ ...elevator, currentEvent: events.find(event => event.id === elevator.currentEventId && event.elevatorId === elevator.id) ?? null })) : [])
const selectedElevator = computed(() => selectedElevators.value.find(item => item.id === selectedElevatorId.value) ?? null)
const buildingOverview = computed(() => ({
  elevatorCount: selectedElevators.value.length,
  onlineCount: selectedElevators.value.filter(item => item.cameraStatus === 'online').length,
  alarmCount: selectedElevators.value.filter(item => item.currentEvent !== null).length
}))
function resetDetailPosition() {
  nextTick(() => {
    detailContentRef.value?.scrollTo({ top: 0 })
    detailContentRef.value?.focus({ preventScroll: true })
  })
}
function openBuilding(buildingId: string) {
  if (!detailVisible.value || !selectedBuildings.value.some(item => item.id === buildingId)) return
  selectedBuildingId.value = buildingId
  selectedElevatorId.value = null
  resetDetailPosition()
}
function openElevator(elevatorId: string) {
  if (!detailVisible.value || !selectedElevators.value.some(item => item.id === elevatorId)) return
  selectedElevatorId.value = elevatorId
  resetDetailPosition()
}
function backToBuilding() {
  selectedElevatorId.value = null
  resetDetailPosition()
}
function backToCommunity() {
  selectedElevatorId.value = null
  selectedBuildingId.value = null
  resetDetailPosition()
}
function openCommunity(communityId: string) {
  if (!communities.some(item => item.id === communityId)) return
  selectedCommunityId.value = communityId
  selectedBuildingId.value = null
  detailVisible.value = true
  selectedElevatorId.value = null
  emit('community-select', communityId)
}
// 可替换为目标县 GeoJSON 或高德地图；此轮先提供无密钥依赖的县域示意。
const countyOutline = 'M220 80L305 60L355 85L435 43L498 75L545 63L598 85L620 132L680 154L659 198L705 244L669 277L681 331L626 353L614 399L550 418L488 400L439 435L391 410L323 426L285 390L221 383L230 342L180 315L202 272L154 243L181 196L162 150L205 132Z'
</script>
<style scoped lang="scss">
.map-panel { display: flex; flex-direction: column; background: radial-gradient(ellipse at 50% 48%, #143047 0%, #0c1c2d 70%) !important; overflow: hidden; }
.map-caption { display: flex; justify-content: space-between; gap: 8px; color: #809bb2; font-size: 11px; padding-top: 3px; span { color: #607c96; } }
.map-badge { padding: 3px 7px; border: 1px solid #2b596c; color: #6fcbd9 !important; font-size: 10px !important; }
.map-canvas { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; svg { width: 100%; height: 100%; min-height: 240px; } }
.area-label { fill: #6c91a8; font-size: 12px; letter-spacing: 3px; }
.point-label { fill: #d3e9f5; font-size: 12px; paint-order: stroke; stroke: #10293f; stroke-width: 4px; }
.map-point { cursor: pointer; &:hover circle:first-child, &:focus circle:first-child { stroke: #e3faff; stroke-width: 2; } }
.compass text { fill: #8daabd; font-size: 11px; }
.map-disclaimer { fill: #67849c; font-size: 11px; }
.map-bottom { display: flex; justify-content: space-between; align-items: center; gap: 12px; border-top: 1px solid #244054; padding-top: 12px; font-size: 11px; color: #93afc4; }
.selected-point { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; strong { color: #d0e4f2; font-weight: 500; } .status-dot { margin: 0; } }
.map-legend { display: flex; flex-wrap: wrap; gap: 8px; white-space: nowrap; font-size: 10px; span { display: flex; align-items: center; gap: 5px; } i { width: 5px; height: 5px; border-radius: 50%; } }
.community-status { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; white-space: nowrap; i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; } }
.community-hover {
  width: 200px; max-width: calc(100vw - 60px); color: #bfd3e3; font-size: 12px;
  strong { display: block; margin-bottom: 6px; font-size: 15px; color: #e1eff8; }
  dl { display: grid; grid-template-columns: 1fr auto; gap: 6px 16px; margin: 12px 0; }
  dt { color: #8fa9be; } dd { margin: 0; font-variant-numeric: tabular-nums; }
  small { font-size: 10px; color: #88a1b6; }
}
.community-detail { max-height: 65vh; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; scrollbar-color: #385571 transparent; }
.community-detail-heading { display: flex; justify-content: space-between; gap: 12px; align-items: center; font-size: 12px; color: #8fa9be; }
.community-summary {
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 20px 0 24px;
  > div { padding: 12px 10px; background: #172e44; border: 1px solid #29465e; border-radius: 4px; }
  dt { color: #8fa9be; font-size: 11px; }
  dd { margin: 8px 0 0; color: #d9edf7; font-size: 25px; font-variant-numeric: tabular-nums; }
  small { margin-left: 4px; color: #8fa9be; font-size: 11px; }
}
.building-list-heading { display: flex; justify-content: space-between; margin-bottom: 12px; color: #c7dce9; font-size: 14px; font-weight: 500; span { color: #8fa9be; font-size: 12px; } }
.building-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.building-card { display: block; width: 100%; height: 100%; padding: 14px; border: 1px solid #2a465d; border-radius: 4px; background: #102338; text-align: left; font: inherit; cursor: pointer;
  &:hover { border-color: #4d8ba6; background: #163047; }
  > small { display: flex; justify-content: space-between; gap: 8px; margin-top: 9px; color: #6f8aa2; font-size: 10px; span { color: #71cbd8; } }
}
.building-card-line { display: block; margin-top: 10px; color: #9eb6c9; font-size: 12px; line-height: 1.6; }
.building-card-heading { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; strong { color: #d4e6f1; font-size: 14px; font-weight: 500; } }
.detail-breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 18px; color: #a7bfd2; font-size: 13px;
  button { padding: 2px 0; border: 0; background: none; color: #67d9e6; font: inherit; cursor: pointer; &:hover { text-decoration: underline; } }
}
.building-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.elevator-list { display: grid; gap: 12px; }
.elevator-card { display: block; width: 100%; padding: 14px; border: 1px solid #2a465d; border-radius: 4px; background: #102338; text-align: left; font: inherit; cursor: pointer;
  &:hover { border-color: #4d8ba6; background: #163047; }
  .elevator-card-line { display: block; margin-top: 10px; color: #9eb6c9; font-size: 12px; line-height: 1.6; }
  .person-count { display: inline-block; margin-left: 22px; }
  .current-alarm { color: #ffbf83; }
  .elevator-event-meta { font-size: 11px; color: #8fa9be; }
  > small { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 10px; color: #6f8aa2; font-size: 10px; overflow-wrap: anywhere; span { color: #71cbd8; } }
}
.building-card:focus-visible, .elevator-card:focus-visible, .detail-breadcrumb button:focus-visible { outline: 2px solid #66e0e9; outline-offset: 3px; }
.community-demo-note { margin-top: 18px; font-size: 11px; color: #7f9ab2; line-height: 1.8; }
@media (max-width: 1200px) { .map-bottom { flex-wrap: wrap; padding-top: 7px; gap: 7px; } }
@media (max-width: 600px) { .community-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); } .building-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); } .building-list { grid-template-columns: 1fr; } .map-caption { flex-wrap: wrap; } }
</style>

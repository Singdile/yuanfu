<template>
  <section class="elevator-detail" :aria-label="elevator.name + '详情'">
    <div class="device-identity"><span>电梯编号：{{ elevator.id }}</span><span>摄像头：{{ elevator.cameraId }}</span></div>
    <div class="video-heading"><h3>视频监控画面</h3><span>本地演示视频</span></div>
    <p v-if="elevator.cameraStatus === 'offline'" class="offline-note">摄像头离线，以下仅播放本地演示素材。</p>
    <video ref="videoRef" class="elevator-video" :src="demoVideoUrl" controls autoplay muted loop playsinline preload="metadata"
      :aria-label="elevator.name + '本地演示视频'" @error="videoLoadError = true" @loadeddata="videoLoadError = false" @play="guardPlayback">
      您的浏览器不支持视频播放。
    </video>
    <div v-if="videoLoadError" class="video-error" role="alert"><span>视频加载失败，请重试。</span><button type="button" @click="retryVideo">重新加载</button></div>
    <p class="video-note">所有电梯共用演示素材，人数、AI 状态和事件均为演示数据，未执行视频识别。</p>
    <dl class="device-facts">
      <div><dt>摄像头状态</dt><dd :class="{ offline: elevator.cameraStatus === 'offline' }">{{ elevator.cameraStatus === 'online' ? '在线' : '离线' }}</dd></div>
      <div><dt>AI 检测</dt><dd>{{ elevator.aiStatus === 'running' ? '运行中（演示）' : '暂停（演示）' }}</dd></div>
      <div><dt>当前人数</dt><dd>{{ elevator.personCount === null ? '未知' : elevator.personCount + ' 人' }}</dd></div>
      <div><dt>当前异常</dt><dd :class="{ alarm: currentEvent }">{{ currentEvent ? (currentEvent.type === '人员倒地' ? '疑似人员倒地' : currentEvent.type) : '无' }}</dd></div>
    </dl>
    <div v-if="currentEvent" class="current-event" aria-label="当前异常事件">
      <div class="current-event-heading"><strong>{{ currentEvent.type }}</strong><span>{{ eventLevelLabels[currentEvent.level] }} · {{ eventStatusLabels[currentEvent.status] }}</span></div>
      <p>事件编号：{{ currentEvent.id }}</p><p>发生时间：{{ currentEvent.time }}</p>
    </div>
    <h3 class="recent-heading">最近异常事件 <span>{{ recentEvents.length }} 条</span></h3>
    <div v-if="recentEvents.length" class="table-scroll">
      <table aria-label="本电梯最近异常事件">
        <thead><tr><th>发生时间</th><th>事件类型</th><th>等级</th><th>状态</th></tr></thead>
        <tbody><tr v-for="event in recentEvents" :key="event.id" :class="{ 'active-event-row': event.id === currentEvent?.id }" :data-event-id="event.id">
          <td>{{ event.time }}</td><td>{{ event.type }}</td><td>{{ eventLevelLabels[event.level] }}</td><td>{{ eventStatusLabels[event.status] }}</td>
        </tr></tbody>
      </table>
    </div>
    <p v-else class="empty-events">该电梯暂无异常记录。</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ElevatorMock } from '../mock/elevators'
import { eventLevelLabels, eventStatusLabels, type ElevatorEventMock } from '../mock/events'

const props = defineProps<{ elevator: ElevatorMock; events: ElevatorEventMock[]; active: boolean }>()
const demoVideoUrl = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'videos/elevator-demo.mp4'
const videoRef = ref<HTMLVideoElement | null>(null)
const videoLoadError = ref(false)
const recentEvents = computed(() => props.events
  .filter(event => event.elevatorId === props.elevator.id)
  .sort((left, right) => right.time.localeCompare(left.time)))
const currentEvent = computed(() => recentEvents.value.find(event => event.id === props.elevator.currentEventId) ?? null)

function guardPlayback() {
  if (!props.active) videoRef.value?.pause()
}
function retryVideo() {
  videoLoadError.value = false
  videoRef.value?.load()
}
watch(() => props.active, guardPlayback)
onBeforeUnmount(() => videoRef.value?.pause())
</script>

<style scoped lang="scss">
.device-identity { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-bottom: 16px; font-size: 12px; color: #8fa9be; overflow-wrap: anywhere; }
.video-heading, .recent-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; color: #d4e6f1; font-size: 14px; font-weight: 500; h3 { font-size: 14px; font-weight: 500; } > span { color: #80a9bf; font-size: 11px; } }
.elevator-video { display: block; width: 100%; aspect-ratio: 16 / 9; max-height: 360px; object-fit: contain; background: #050d16; border: 1px solid #2a465d; border-radius: 4px; }
.video-note { margin: 9px 0 18px; color: #7f9ab2; font-size: 10px; line-height: 1.8; }
.offline-note { margin-bottom: 10px; color: #ffbf83; font-size: 12px; }
.device-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0 0 20px;
  > div { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px; padding: 13px; background: #172e44; border: 1px solid #29465e; border-radius: 4px; }
  dt { color: #8fa9be; font-size: 12px; } dd { margin: 0; color: #d9edf7; font-size: 13px; } .alarm { color: #ffbf83; } .offline { color: #93a7bb; }
}
.current-event { padding: 14px; margin-bottom: 20px; border: 1px solid #6f4a41; background: #302c301f; border-radius: 4px; p { margin-top: 9px; color: #9eb6c9; font-size: 11px; } }
.current-event-heading { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; color: #ffbf83; strong { font-weight: 500; font-size: 14px; } span { font-size: 11px; } }
.active-event-row { background: #ffbf690b; }
.empty-events { color: #8fa9be; padding: 15px 0; font-size: 12px; }
.video-error { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 0; color: #ffbf83; font-size: 12px; button { padding: 6px 10px; background: #163047; border: 1px solid #497c94; border-radius: 3px; color: #94dce5; cursor: pointer; font: inherit; } }
@media (max-width: 480px) { .device-facts { grid-template-columns: 1fr; } }
</style>

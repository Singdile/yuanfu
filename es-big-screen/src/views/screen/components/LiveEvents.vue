<template>
  <section id="live-events" class="panel events-panel" aria-labelledby="events-heading">
    <div class="panel-heading"><h2 id="events-heading">实时异常</h2><span class="event-count">{{ pending }} 起待处理</span></div>
    <div class="event-filters" aria-label="筛选异常类型">
      <button type="button" :class="{ selected: !filter }" @click="filter = ''">全部</button>
      <button v-for="item in eventTypes" :key="item.name" type="button" :class="{ selected: filter === item.name }" :aria-pressed="filter === item.name" @click="filter = filter === item.name ? '' : item.name">{{ item.name }}</button>
    </div>
    <div class="event-list">
      <button v-for="item in filteredEvents" :key="item.id" type="button" class="event-item" @click="$emit('select', item)">
        <div class="event-top"><span class="event-type" :style="{ color: eventTypes.find(type => type.name === item.type)?.color }"><i></i>{{ item.type }}</span><time>{{ item.time }}</time></div>
        <div class="event-location">{{ item.location }}</div>
        <div class="event-meta"><span :class="{ processing: item.status === '处理中' }">{{ item.status }}</span><span>查看详情 <b>›</b></span></div>
      </button>
    </div>
    <div class="events-footer">今日累计 {{ todayEvents }} 起<span>展示最近 {{ filteredEvents.length }} 条 · 演示</span></div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { eventTypes, recentEvents, todayEvents, type ElevatorEvent } from '../data'
defineEmits<{ (event: 'select', item: ElevatorEvent): void }>()
const filter = ref('')
const pending = recentEvents.filter(item => item.status === '待处理').length
const filteredEvents = computed(() => recentEvents.filter(item => !filter.value || item.type === filter.value))
</script>
<style scoped lang="scss">
.events-panel { display: flex; flex-direction: column; overflow: hidden; }
.event-count { color: #ffbd80 !important; }
.event-filters { display: flex; flex-wrap: wrap; gap: 5px; margin: 3px 0 10px; button { background: #14283d; border: 1px solid #233d53; color: #91a9be; border-radius: 3px; padding: 4px 6px; font: inherit; font-size: 10px; cursor: pointer; } .selected, button:hover { color: #67d9e8; border-color: #388597; background: #163647; } }
.event-list { min-height: 0; overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: #385571 transparent; }
.event-item { width: 100%; display: block; border: 0; border-bottom: 1px solid #21364c; background: transparent; text-align: left; padding: 13px 2px; color: #adbed1; font: inherit; cursor: pointer; &:hover { background: #153047; } }
.event-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; time { color: #68839d; font-size: 10px; font-variant-numeric: tabular-nums; } }
.event-type { display: flex; align-items: center; gap: 7px; font-size: 13px; i { width: 5px; height: 5px; background: currentColor; border-radius: 50%; } }
.event-location { margin: 7px 0; font-size: 11px; color: #adc0d1; }
.event-meta { display: flex; justify-content: space-between; font-size: 10px; color: #6c91aa; span:first-child { color: #ffbe7e; } .processing:first-child { color: #65c5db; } b { padding-left: 4px; font-size: 13px; } }
.events-footer { display: flex; justify-content: space-between; gap: 5px; border-top: 1px solid #263b4f; margin-top: 10px; padding-top: 11px; font-size: 10px; color: #8b9fb4; span { color: #607b96; } }
</style>

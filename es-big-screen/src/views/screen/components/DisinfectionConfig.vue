<template>
  <section class="panel config-panel" aria-labelledby="config-heading">
    <div class="panel-heading"><h2 id="config-heading">消杀配置</h2><span>消毒时段 · 消毒强度</span></div>

    <h3 class="subheading">消毒时段 <span>{{ enabledPeriods }}/{{ store.periods.length }} 已开启</span></h3>
    <ul class="period-list">
      <li v-for="(period, index) in store.periods" :key="period.id" class="period-row" :class="{ disabled: !period.enabled }">
        <div class="period-info">
          <strong>{{ period.name }}</strong>
          <span>{{ period.start }} - {{ period.end }} · {{ period.repeat }}</span>
        </div>
        <button type="button" class="toggle" :class="{ on: period.enabled }" :aria-pressed="period.enabled" :aria-label="period.name" @click="store.periods[index].enabled = !store.periods[index].enabled">
          <i></i>
        </button>
      </li>
    </ul>

    <h3 class="subheading">消毒强度</h3>
    <div class="intensity-list" role="radiogroup" aria-label="消毒强度">
      <button v-for="option in intensityOptions" :key="option.id" type="button" class="intensity-card" :class="{ selected: store.intensity === option.id }"
        :aria-checked="store.intensity === option.id" role="radio" @click="store.intensity = option.id">
        <span class="intensity-radio"></span>
        <span class="intensity-text"><strong>{{ option.name }}</strong><small>{{ option.desc }}</small><em>{{ option.usage }}</em></span>
      </button>
    </div>

    <p v-if="store.savedAt" class="saved-text">已于 {{ store.savedAt }} 保存（演示）</p>
    <button type="button" class="configure-button" @click="$emit('configure')">进入配置页面 ›</button>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useDisinfectionStore } from '@/store'
import { intensityOptions } from '../mock/disinfection'

const store = useDisinfectionStore()
const enabledPeriods = computed(() => store.periods.filter(period => period.enabled).length)
defineEmits<{ (event: 'configure'): void }>()
</script>
<style scoped lang="scss">
.config-panel { display: flex; flex-direction: column; min-height: 0; }
.subheading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 15px 0 8px; color: #bcd0e0; font-size: 12px; font-weight: 500;
  > span { color: #607b96; font-size: 10px; font-weight: 400; } }
.period-list { min-height: 0; }
.period-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 2px; border-bottom: 1px solid #21364c;
  &.disabled { opacity: .55; } &:last-child { border-bottom: 0; } }
.period-info { display: flex; flex-direction: column; gap: 5px; min-width: 0; strong { font-size: 13px; font-weight: 500; color: #c8dcec; } span { font-size: 10px; color: #6e859e; font-variant-numeric: tabular-nums; white-space: nowrap; } }
.toggle { position: relative; flex: none; width: 36px; height: 20px; border-radius: 10px; border: 1px solid #35536b; background: #14283d; cursor: pointer; transition: background .2s, border-color .2s;
  i { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #6c86a1; transition: left .2s, background .2s; }
  &.on { border-color: #3f8da0; background: #123f4d;
    i { left: 18px; background: #66d8e4; box-shadow: 0 0 6px #66d8e466; } }
  &:focus-visible { outline: 2px solid #66e0e9; outline-offset: 3px; } }
.intensity-list { display: flex; flex-direction: column; gap: 8px; }
.intensity-card { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 11px 12px; text-align: left; background: #14283d; border: 1px solid #233d53; border-radius: 4px; color: #adbed1; font: inherit; cursor: pointer; transition: border-color .2s, background .2s;
  &.selected { border-color: #3f97ad; background: #163647; }
  &:hover { border-color: #388597; }
  &:focus-visible { outline: 2px solid #66e0e9; outline-offset: 3px; } }
.intensity-radio { flex: none; width: 10px; height: 10px; margin-top: 3px; border: 1px solid #4a647e; border-radius: 50%; transition: border-color .2s, box-shadow .2s;
  .selected & { border-color: #66d8e4; box-shadow: inset 0 0 0 3px #163647, 0 0 0 1px #66d8e4; } }
.intensity-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; strong { font-size: 13px; font-weight: 500; color: #d3e6f3; } small { font-size: 10px; color: #8ba3ba; } em { font-size: 10px; color: #607b96; font-style: normal; } }
.saved-text { margin: 10px 0; color: #54cbb9; font-size: 10px; }
.configure-button { width: 100%; padding: 10px 0; border: 1px solid #3f8da0; background: linear-gradient(90deg, #123f4d, #14586b); color: #9fe6ee; font: inherit; font-size: 12px; letter-spacing: 2px; border-radius: 4px; cursor: pointer; transition: filter .2s;
  &:hover { filter: brightness(1.15); }
  &:focus-visible { outline: 2px solid #66e0e9; outline-offset: 3px; } }
</style>

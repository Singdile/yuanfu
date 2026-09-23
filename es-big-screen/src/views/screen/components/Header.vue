<template>
  <header class="platform-header">
    <div class="heading-row">
      <div class="platform-mark"><span class="mark-icon" aria-hidden="true">⇅</span><div>智慧电梯<span>INTELLIGENT ELEVATOR</span></div></div>
      <h1>{{ platformTitle }}</h1>
      <div class="clock"><time>{{ currentTime }}</time><span><i></i>演示模式</span></div>
    </div>
    <nav aria-label="平台主导航">
      <button v-for="item in navigation" :key="item.id" type="button" :class="{ active: activeTab === item.id }"
        :aria-current="activeTab === item.id ? 'page' : undefined" @click="$emit('navigate', item.id)">
        {{ item.label }}
      </button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import dayjs from 'dayjs'
import { navigation, platformTitle, type NavigationTab } from '../data'
defineProps<{ activeTab: NavigationTab }>()
defineEmits<{ (event: 'navigate', tab: NavigationTab): void }>()
const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const timer = window.setInterval(() => { currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss') }, 1000)
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<style scoped lang="scss">
.platform-header { min-width: 0; }
.heading-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; min-height: 60px; gap: 16px; }
h1 { font-size: clamp(23px, 2vw, 34px); font-weight: 600; letter-spacing: 4px; color: #e7f5ff; }
.platform-mark { display: flex; align-items: center; gap: 10px; font-size: 17px; letter-spacing: 2px; color: #c4d9ed;
  .mark-icon { display: grid; place-items: center; width: 35px; height: 39px; border: 1px solid #3698be; color: #64e3f0; font-size: 28px; border-radius: 5px; }
  div span { display: block; margin-top: 4px; color: #6c86a1; font-size: 8px; letter-spacing: 1.5px; }
}
.clock { text-align: right; font-size: 13px; color: #a0b3c9; font-variant-numeric: tabular-nums;
  span { display: block; margin-top: 6px; color: #7391aa; font-size: 11px; }
  i { display: inline-block; width: 5px; height: 5px; margin-right: 6px; background: #51d2c4; border-radius: 50%; }
}
nav { display: flex; justify-content: center; gap: 24px; border-bottom: 1px solid #21384e; }
button { position: relative; min-width: 108px; padding: 13px 20px; border: 0; background: transparent; color: #97abc0; font: inherit; font-size: 14px; cursor: pointer; transition: color .2s, background .2s;
  &:hover, &.active { color: #67e1ee; background: linear-gradient(0deg, #35bacd18, transparent); }
  &.active::after { content: ''; position: absolute; bottom: -1px; height: 2px; left: 20px; right: 20px; background: #57d8eb; box-shadow: 0 0 12px #57d8eb66; }
}
@media (max-width: 1100px) { .platform-mark div { display: none; } h1 { letter-spacing: 2px; } nav { gap: 10px; } }
@media (max-width: 680px) { .heading-row { grid-template-columns: 1fr; text-align: center; padding: 14px 0; } .platform-mark, .clock { display: none; } h1 { font-size: 20px; letter-spacing: 1px; } nav { gap: 0; } button { min-width: 0; flex: 1; padding: 13px 3px; font-size: 12px; } }
</style>

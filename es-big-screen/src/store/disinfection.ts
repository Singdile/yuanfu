import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { disinfectionPeriods, type DisinfectionIntensity, type DisinfectionPeriod } from '../views/screen/mock/disinfection'

// 消杀配置在“消杀管理”展示页与“消杀配置”表单页之间共享，
// 保存仅写入内存（演示），刷新页面后恢复 mock 初始值。
export const useDisinfectionStore = defineStore({
  id: 'disinfection',
  state: () => ({
    periods: disinfectionPeriods.map(period => ({ ...period })),
    intensity: 'standard' as DisinfectionIntensity,
    savedAt: ''
  }),
  actions: {
    save() {
      this.savedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    reset() {
      this.periods = disinfectionPeriods.map(period => ({ ...period }))
      this.intensity = 'standard'
      this.savedAt = ''
    }
  }
})

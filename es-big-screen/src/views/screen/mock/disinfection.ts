// 消杀工具演示数据：消毒时段、消毒强度、溶液余量、运行日志。
// 当前均为演示数据，接入接口时在这里统一替换。

export type DisinfectionIntensity = 'standard' | 'enhanced' | 'quick'

export interface DisinfectionIntensityOption {
  id: DisinfectionIntensity
  name: string
  desc: string
  usage: string
}

export interface DisinfectionPeriod {
  id: string
  name: string
  start: string
  end: string
  repeat: string
  enabled: boolean
}

export interface SolutionDevice {
  id: string
  name: string
  level: number
  capacity: number
  status: 'normal' | 'low' | 'warning'
  lastRefill: string
}

export type DisinfectionLogKind = 'start' | 'end' | 'warning'

export interface DisinfectionLog {
  id: string
  time: string
  kind: DisinfectionLogKind
  location: string
  detail: string
}

export const intensityOptions: DisinfectionIntensityOption[] = [
  { id: 'standard', name: '标准消杀', desc: '常规浓度 · 轿厢全覆盖', usage: '默认推荐，满足日常消杀需求' },
  { id: 'enhanced', name: '深度消杀', desc: '高浓度 · 重点部位加强', usage: '适合高峰后或异常事件后加强消毒' },
  { id: 'quick', name: '快速消杀', desc: '短时雾化 · 仅扶手与门板', usage: '低峰时段快速维持，耗液较低' }
]

export const disinfectionPeriods: DisinfectionPeriod[] = [
  { id: 'early', name: '早间消杀', start: '05:30', end: '06:30', repeat: '每日', enabled: true },
  { id: 'noon', name: '午间消杀', start: '13:00', end: '14:00', repeat: '每日', enabled: true },
  { id: 'night', name: '夜间消杀', start: '21:30', end: '22:30', repeat: '每日', enabled: true },
  { id: 'offpeak', name: '低谷补消', start: '03:00', end: '04:00', repeat: '工作日', enabled: false }
]

export const solutionSummary = {
  overallLevel: 62,
  capacity: 20,
  warnThreshold: 20,
  estimateDays: 3,
  todayUsed: 3.1
}

export const solutionDevices: SolutionDevice[] = [
  { id: 'DEV-01', name: '阳光花园 · 3 栋 1 号梯', level: 78, capacity: 2, status: 'normal', lastRefill: '昨日' },
  { id: 'DEV-02', name: '阳光花园 · 3 栋 2 号梯', level: 64, capacity: 2, status: 'normal', lastRefill: '前日' },
  { id: 'DEV-03', name: '滨河雅苑 · 2 栋 2 号梯', level: 42, capacity: 1, status: 'low', lastRefill: '3 天前' },
  { id: 'DEV-04', name: '金桂家园 · 5 栋 1 号梯', level: 12, capacity: 2, status: 'warning', lastRefill: '5 天前' },
  { id: 'DEV-05', name: '幸福里 · 1 栋 1 号梯', level: 86, capacity: 1, status: 'normal', lastRefill: '昨日' },
  { id: 'DEV-06', name: '中央公馆 · 6 栋 2 号梯', level: 18, capacity: 2, status: 'warning', lastRefill: '4 天前' }
]

export const disinfectionLogs: DisinfectionLog[] = [
  { id: 'LOG-001', time: '05:30:15', kind: 'start', location: '阳光花园 · 3 栋 1 号梯', detail: '早间消杀开始 · 标准强度' },
  { id: 'LOG-002', time: '05:46:22', kind: 'end', location: '阳光花园 · 3 栋 1 号梯', detail: '消杀结束 · 用时 16 分钟 · 耗液 0.8L' },
  { id: 'LOG-003', time: '06:05:41', kind: 'start', location: '滨河雅苑 · 2 栋 2 号梯', detail: '早间消杀开始 · 标准强度' },
  { id: 'LOG-004', time: '06:21:18', kind: 'end', location: '滨河雅苑 · 2 栋 2 号梯', detail: '消杀结束 · 用时 15 分钟 · 耗液 0.7L' },
  { id: 'LOG-005', time: '09:47:03', kind: 'warning', location: '金桂家园 · 5 栋 1 号梯', detail: '溶液余量 12% · 低于预警阈值 20%' },
  { id: 'LOG-006', time: '10:12:55', kind: 'start', location: '幸福里 · 1 栋 1 号梯', detail: '快速消杀开始 · 低峰补消' },
  { id: 'LOG-007', time: '10:26:33', kind: 'end', location: '幸福里 · 1 栋 1 号梯', detail: '消杀结束 · 用时 13 分钟 · 耗液 0.4L' },
  { id: 'LOG-008', time: '12:58:20', kind: 'warning', location: '中央公馆 · 6 栋 2 号梯', detail: '溶液余量 18% · 低于预警阈值 20%' },
  { id: 'LOG-009', time: '13:00:04', kind: 'start', location: '阳光花园 · 3 栋 1 号梯', detail: '午间消杀开始 · 标准强度' },
  { id: 'LOG-010', time: '13:17:36', kind: 'end', location: '阳光花园 · 3 栋 1 号梯', detail: '消杀结束 · 用时 17 分钟 · 耗液 0.9L' }
]

// 当前均为演示数据。接入接口时在这里统一替换，保持指标与图表口径一致。
export const platformTitle = '老板驾驶舱'
export const countyName = '某县'
export type NavigationTab = 'overview' | 'monitor' | 'events' | 'disinfection' | 'config' | 'statistics'
export const navigation: { id: NavigationTab; label: string }[] = [
  { id: 'overview', label: '综合态势' }, { id: 'monitor', label: '电梯监控' },
  { id: 'events', label: '异常事件' }, { id: 'disinfection', label: '消杀管理' },
  { id: 'config', label: '消杀配置' }, { id: 'statistics', label: '统计分析' }
]
export const overview = { communities: 36, elevators: 128, cameras: 128, online: 125 }
export const onlineRate = Number((overview.online / overview.cameras * 100).toFixed(2))
export const eventTypes = [
  { name: '人员倒地', value: 3, color: '#ff647c' },
  { name: '异常滞留', value: 7, color: '#ffbf69' },
  { name: '摄像头离线', value: 5, color: '#8395bd' },
  { name: '电动车入梯', value: 9, color: '#43c9ef' }
]
export const todayEvents = eventTypes.reduce((sum, item) => sum + item.value, 0)
export interface ElevatorEvent {
  id: string
  type: string
  location: string
  time: string
  status: '待处理' | '处理中'
  description: string
}
export const recentEvents: ElevatorEvent[] = [
  { id: 'EV-2026-024', type: '人员倒地', location: '阳光花园 · 3 栋 1 号梯', time: '14:32:08', status: '待处理', description: '检测到轿厢内人员倒地，请及时核实现场情况。' },
  { id: 'EV-2026-023', type: '电动车入梯', location: '滨河雅苑 · 2 栋 2 号梯', time: '14:28:35', status: '待处理', description: '检测到疑似电动车进入轿厢，请联系物业核实。' },
  { id: 'EV-2026-022', type: '异常滞留', location: '金桂家园 · 5 栋 1 号梯', time: '14:21:16', status: '处理中', description: '人员在轿厢内停留超过演示规则阈值，物业正在核实。' },
  { id: 'EV-2026-021', type: '摄像头离线', location: '幸福里 · 1 栋 1 号梯', time: '14:16:42', status: '待处理', description: '摄像头连接中断，请检查设备供电和网络。' },
  { id: 'EV-2026-020', type: '异常滞留', location: '中央公馆 · 6 栋 2 号梯', time: '14:09:27', status: '处理中', description: '检测到长时间滞留，物业已接收事件。' },
  { id: 'EV-2026-019', type: '电动车入梯', location: '书香名邸 · 2 栋 1 号梯', time: '13:58:04', status: '待处理', description: '检测到疑似电动车入梯行为，等待人工核实。' }
]
export const communities = [
  { name: '阳光花园', x: 370, y: 175, elevators: 12, online: 12, abnormal: true },
  { name: '滨河雅苑', x: 595, y: 245, elevators: 8, online: 8, abnormal: true },
  { name: '金桂家园', x: 285, y: 320, elevators: 10, online: 10, abnormal: false },
  { name: '幸福里', x: 500, y: 375, elevators: 6, online: 3, abnormal: true },
  { name: '中央公馆', x: 595, y: 130, elevators: 16, online: 16, abnormal: false },
  { name: '书香名邸', x: 230, y: 200, elevators: 8, online: 8, abnormal: false }
]
export const statistics = {
  trend: [18, 23, 16, 29, 21, 19, todayEvents],
  responseMinutes: [1.5, 1.2, 2.4, 1.7],
  onlineRates: [96.88, 97.66, 98.44, 96.88, 99.22, 98.44, onlineRate]
}
export const disinfectionRecords = [
  { location: '阳光花园 · 3 栋 1 号梯', time: '09:30', operator: '物业一组', status: '已完成' },
  { location: '滨河雅苑 · 2 栋 2 号梯', time: '10:15', operator: '物业二组', status: '已完成' },
  { location: '金桂家园 · 5 栋 1 号梯', time: '15:00', operator: '物业一组', status: '待执行' }
]

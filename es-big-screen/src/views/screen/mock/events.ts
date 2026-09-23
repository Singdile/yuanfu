import dayjs from 'dayjs'
import type { ElevatorMock } from './elevators'

export type EventStatusMock = 'pending' | 'closed' | 'resolved'
export interface ElevatorEventMock {
  id: string
  elevatorId: string
  type: string
  level: 'urgent' | 'warning' | 'info'
  time: string
  status: EventStatusMock
  confidence: number | null
}

export const eventStatusLabels: Record<EventStatusMock, string> = {
  pending: '待复核', closed: '已关闭', resolved: '已恢复'
}
export const eventLevelLabels = { urgent: '紧急', warning: '一般', info: '提示' }

const currentEventSamples: Record<string, { type: string; time: string }> = {
  B003: { type: '人员倒地', time: '14:32:08' },
  B006: { type: '电动车入梯', time: '14:28:35' },
  B013: { type: '异常滞留', time: '14:21:16' },
  B014: { type: '摄像头离线', time: '14:16:42' },
  B022: { type: '异常滞留', time: '14:09:27' },
  B026: { type: '电动车入梯', time: '13:58:04' }
}

// 事件独立保存，用 elevatorId 关联电梯；当前异常仅保存事件 ID。
// 历史演示记录放在前两日，不改变首页已有的今日异常统计口径。
export function createEventMocks(elevators: ElevatorMock[]): ElevatorEventMock[] {
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  const previousDay = dayjs().subtract(2, 'day').format('YYYY-MM-DD')
  return elevators.flatMap(elevator => {
    const history: ElevatorEventMock[] = [
      { id: 'HIST-' + elevator.id + '-01', elevatorId: elevator.id, type: '异常滞留', level: 'warning', time: yesterday + ' 11:25:16', status: 'closed', confidence: 0.87 },
      { id: 'HIST-' + elevator.id + '-02', elevatorId: elevator.id, type: '摄像头离线', level: 'info', time: previousDay + ' 18:12:00', status: 'resolved', confidence: null }
    ]
    if (!elevator.currentEventId) return history
    const sample = currentEventSamples[elevator.buildingId] ?? { type: '异常待核实', time: '14:00:00' }
    return [
      { id: elevator.currentEventId, elevatorId: elevator.id, type: sample.type, level: elevator.status === 'danger' ? 'urgent' : 'warning',
        time: today + ' ' + sample.time, status: 'pending', confidence: elevator.cameraStatus === 'offline' ? null : 0.91 },
      ...history
    ] as ElevatorEventMock[]
  })
}

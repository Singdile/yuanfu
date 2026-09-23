export type ElevatorStatus = 'normal' | 'warning' | 'danger' | 'offline'

export interface ElevatorMock {
  id: string
  buildingId: string
  name: string
  cameraId: string
  cameraStatus: 'online' | 'offline'
  personCount: number | null
  aiStatus: 'running' | 'offline'
  status: ElevatorStatus
  currentEventId: string | null
}

interface BuildingSource {
  id: string
  elevatorCount: number
  onlineCount: number
  alarmCount: number
  status: ElevatorStatus
}

// 阳光花园 / 3号楼：固定 ID，供后续视频详情与异常联动使用。
export const buildingB003Elevators: ElevatorMock[] = [
  { id: 'E001', buildingId: 'B003', name: '1号梯', cameraId: 'CAM001', cameraStatus: 'online', personCount: 1, aiStatus: 'running', status: 'normal', currentEventId: null },
  { id: 'E002', buildingId: 'B003', name: '2号梯', cameraId: 'CAM002', cameraStatus: 'online', personCount: 1, aiStatus: 'running', status: 'danger', currentEventId: 'EVT001' },
  { id: 'E003', buildingId: 'B003', name: '3号梯', cameraId: 'CAM003', cameraStatus: 'online', personCount: 0, aiStatus: 'running', status: 'normal', currentEventId: null }
]

// 其他楼栋按现有设备数量补齐演示电梯，避免点击后出现不属于该楼栋的数据。
// ID 由楼栋 ID 和固定梯号组成，不依赖楼栋数组的排序。后续可用接口响应替换返回值。
export function createElevatorMocks(buildings: BuildingSource[]): ElevatorMock[] {
  return buildings.flatMap(building => {
    if (building.id === 'B003') {
      return buildingB003Elevators.map(elevator => ({ ...elevator }))
    }
    return Array.from({ length: building.elevatorCount }, (_, index): ElevatorMock => {
      const cameraStatus = index < building.onlineCount ? 'online' : 'offline'
      const hasEvent = building.status === 'offline'
        ? index >= building.onlineCount && index < building.onlineCount + building.alarmCount
        : index < building.alarmCount
      const suffix = building.id + '-' + String(index + 1).padStart(2, '0')
      return {
        id: 'E-' + suffix,
        buildingId: building.id,
        name: String(index + 1) + '号梯',
        cameraId: 'CAM-' + suffix,
        cameraStatus,
        personCount: cameraStatus === 'online' ? (index % 2 === 0 ? 1 : 0) : null,
        aiStatus: cameraStatus === 'online' ? 'running' : 'offline',
        status: cameraStatus === 'offline' ? 'offline' : hasEvent ? building.status : 'normal',
        currentEventId: hasEvent ? 'EVT-' + suffix : null
      }
    })
  })
}

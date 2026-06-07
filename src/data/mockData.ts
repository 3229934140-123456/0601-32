import type {
  OverviewStats,
  KeyMetric,
  TopologyNode,
  RiskItem,
  Resource,
  Alert,
  Event,
  InspectionTemplate,
  InspectionRecord,
  ReportMetric,
  ChartDataPoint,
  DutyRecord
} from '@/types';

export const overviewStats: OverviewStats = {
  serviceHealth: 98.5,
  totalResources: 156,
  activeAlerts: 12,
  todayRisks: 3
};

export const keyMetrics: KeyMetric[] = [
  { id: '1', name: 'CPU 使用率', value: '42.6', unit: '%', trend: 'down', trendValue: '3.2%', status: 'normal' },
  { id: '2', name: '内存使用率', value: '68.3', unit: '%', trend: 'up', trendValue: '5.1%', status: 'warning' },
  { id: '3', name: '磁盘使用率', value: '55.8', unit: '%', trend: 'stable', trendValue: '0.2%', status: 'normal' },
  { id: '4', name: '网络流量', value: '128.5', unit: 'MB/s', trend: 'up', trendValue: '12.3%', status: 'normal' }
];

export const topologyNodes: TopologyNode[] = [
  { id: '1', name: '核心交换机', type: 'network', status: 'running' },
  { id: '2', name: 'Web 服务集群', type: 'host', status: 'running' },
  { id: '3', name: '数据库集群', type: 'host', status: 'warning' },
  { id: '4', name: '缓存服务', type: 'container', status: 'running' },
  { id: '5', name: '存储阵列', type: 'storage', status: 'running' }
];

export const todayRisks: RiskItem[] = [
  { id: '1', title: '数据库连接池即将耗尽', level: 'major', description: '主库连接池使用率达到 85%', time: '10:32' },
  { id: '2', title: 'Web 节点响应超时增加', level: 'minor', description: '近 1 小时 5xx 错误增加', time: '09:15' },
  { id: '3', title: '存储使用率超过预警线', level: 'warning', description: 'NAS-01 使用率达到 82%', time: '08:45' }
];

export const resources: Resource[] = [
  { id: 'h1', name: 'web-server-01', type: 'host', status: 'running', ip: '10.0.1.101', cpu: 45, memory: 62, region: '北京-可用区A' },
  { id: 'h2', name: 'web-server-02', type: 'host', status: 'running', ip: '10.0.1.102', cpu: 38, memory: 55, region: '北京-可用区A' },
  { id: 'h3', name: 'db-master-01', type: 'host', status: 'warning', ip: '10.0.2.101', cpu: 72, memory: 85, region: '北京-可用区B' },
  { id: 'h4', name: 'db-slave-01', type: 'host', status: 'running', ip: '10.0.2.102', cpu: 35, memory: 70, region: '北京-可用区B' },
  { id: 'h5', name: 'cache-node-01', type: 'host', status: 'running', ip: '10.0.3.101', cpu: 28, memory: 45, region: '北京-可用区A' },
  { id: 'c1', name: 'app-container-01', type: 'container', status: 'running', cpu: 32, memory: 48, region: '北京-可用区A' },
  { id: 'c2', name: 'app-container-02', type: 'container', status: 'running', cpu: 29, memory: 52, region: '北京-可用区A' },
  { id: 'c3', name: 'app-container-03', type: 'container', status: 'error', cpu: 0, memory: 0, region: '北京-可用区B' },
  { id: 'c4', name: 'job-worker-01', type: 'container', status: 'running', cpu: 55, memory: 60, region: '北京-可用区B' },
  { id: 'n1', name: 'core-switch-01', type: 'network', status: 'running', ip: '10.0.0.1', region: '北京-可用区A' },
  { id: 'n2', name: 'firewall-01', type: 'network', status: 'running', ip: '10.0.0.2', region: '北京-可用区A' },
  { id: 'n3', name: 'load-balancer-01', type: 'network', status: 'warning', ip: '10.0.0.3', region: '北京-可用区B' },
  { id: 's1', name: 'nas-storage-01', type: 'storage', status: 'running', disk: 82, region: '北京-可用区A' },
  { id: 's2', name: 'san-storage-01', type: 'storage', status: 'running', disk: 65, region: '北京-可用区B' },
  { id: 's3', name: 'backup-storage-01', type: 'storage', status: 'warning', disk: 88, region: '北京-可用区C' }
];

export const alerts: Alert[] = [
  { id: 'a1', title: 'CPU 使用率超过 90%', level: 'critical', status: 'active', resource: 'db-master-01', description: '数据库主节点 CPU 持续高于 90%，持续时间 5 分钟', createdAt: '2024-01-15 10:32:15' },
  { id: 'a2', title: '内存使用率超过 80%', level: 'major', status: 'acknowledged', resource: 'web-server-01', description: 'Web 服务器内存使用率达到 85%', createdAt: '2024-01-15 09:45:22', acknowledgedBy: '张工', acknowledgedAt: '2024-01-15 09:50:00' },
  { id: 'a3', title: '磁盘空间不足 20%', level: 'major', status: 'active', resource: 'nas-storage-01', description: 'NAS 存储可用空间不足 20%', createdAt: '2024-01-15 08:20:10' },
  { id: 'a4', title: '服务响应时间超过阈值', level: 'minor', status: 'suppressed', resource: 'app-container-02', description: 'API 平均响应时间超过 500ms', createdAt: '2024-01-15 07:30:45', suppressedUntil: '2024-01-16 07:30:00' },
  { id: 'a5', title: '容器重启次数过多', level: 'warning', status: 'active', resource: 'job-worker-01', description: '近 24 小时内容器重启 3 次', createdAt: '2024-01-15 06:15:33' },
  { id: 'a6', title: '网络丢包率过高', level: 'minor', status: 'resolved', resource: 'core-switch-01', description: '网络接口丢包率超过 1%', createdAt: '2024-01-14 22:10:05' },
  { id: 'a7', title: '证书即将过期', level: 'info', status: 'active', resource: 'api.example.com', description: 'SSL 证书将在 30 天后过期', createdAt: '2024-01-15 00:00:00' },
  { id: 'a8', title: '数据库慢查询增加', level: 'minor', status: 'acknowledged', resource: 'db-master-01', description: '慢查询数量较昨日增加 50%', createdAt: '2024-01-15 10:05:18', acknowledgedBy: '李工', acknowledgedAt: '2024-01-15 10:10:00', note: '正在分析慢查询日志，预计 1 小时内解决' }
];

export const events: Event[] = [
  { id: 'e1', alertId: 'a1', title: '告警触发', type: 'incident', description: 'CPU 使用率超过 90% 阈值', operator: '系统', timestamp: '2024-01-15 10:32:15' },
  { id: 'e2', alertId: 'a1', title: '告警升级', type: 'action', description: '告警升级为严重级别，通知值班主管', operator: '系统', timestamp: '2024-01-15 10:35:00' },
  { id: 'e3', alertId: 'a1', title: '告警认领', type: 'action', description: '张工认领此告警，开始处理', operator: '张工', timestamp: '2024-01-15 10:36:20' },
  { id: 'e4', alertId: 'a1', title: '添加备注', type: 'note', description: '排查发现是慢查询导致 CPU 飙升，已联系 DBA 协助', operator: '张工', timestamp: '2024-01-15 10:42:10' },
  { id: 'e5', alertId: 'a1', title: '执行操作', type: 'action', description: '杀掉 3 个占用 CPU 过高的慢查询进程', operator: '李工', timestamp: '2024-01-15 10:50:35' },
  { id: 'e6', alertId: 'a1', title: '状态恢复', type: 'incident', description: 'CPU 使用率已恢复正常水平（45%）', operator: '系统', timestamp: '2024-01-15 10:55:00' },
  { id: 'e7', alertId: 'a1', title: '告警恢复', type: 'action', description: '告警已恢复，关闭事件', operator: '张工', timestamp: '2024-01-15 11:00:00' }
];

export const inspectionTemplates: InspectionTemplate[] = [
  { id: 't1', name: '日常巡检-机房', description: '机房环境、设备状态、网络连通性检查', itemCount: 15, frequency: '每日' },
  { id: 't2', name: '系统健康检查', description: '服务器 CPU、内存、磁盘、服务状态检查', itemCount: 12, frequency: '每日' },
  { id: 't3', name: '数据库巡检', description: '数据库性能、备份、复制状态检查', itemCount: 10, frequency: '每周' },
  { id: 't4', name: '安全合规检查', description: '安全策略、补丁更新、访问日志审计', itemCount: 20, frequency: '每月' }
];

export const inspectionRecords: InspectionRecord[] = [
  { id: 'r1', templateId: 't1', templateName: '日常巡检-机房', status: 'completed', operator: '张工', startTime: '2024-01-15 08:30:00', endTime: '2024-01-15 09:15:00', itemsPassed: 15, itemsTotal: 15 },
  { id: 'r2', templateId: 't2', templateName: '系统健康检查', status: 'in_progress', operator: '李工', startTime: '2024-01-15 10:00:00', itemsPassed: 8, itemsTotal: 12 },
  { id: 'r3', templateId: 't1', templateName: '日常巡检-机房', status: 'completed', operator: '王工', startTime: '2024-01-14 08:25:00', endTime: '2024-01-14 09:10:00', itemsPassed: 14, itemsTotal: 15 },
  { id: 'r4', templateId: 't3', templateName: '数据库巡检', status: 'completed', operator: '赵工', startTime: '2024-01-12 14:00:00', endTime: '2024-01-12 15:30:00', itemsPassed: 10, itemsTotal: 10 },
  { id: 'r5', templateId: 't1', templateName: '日常巡检-机房', status: 'failed', operator: '张工', startTime: '2024-01-13 08:30:00', endTime: '2024-01-13 09:20:00', itemsPassed: 12, itemsTotal: 15 }
];

export const availabilityMetrics: ReportMetric[] = [
  { label: '整体可用率', value: 99.95, unit: '%', trend: '+0.02%' },
  { label: '核心业务', value: 99.99, unit: '%', trend: '+0.01%' },
  { label: '非核心业务', value: 99.8, unit: '%', trend: '+0.05%' }
];

export const responseTimeTrend: ChartDataPoint[] = [
  { label: '00:00', value: 120 },
  { label: '04:00', value: 80 },
  { label: '08:00', value: 200 },
  { label: '10:00', value: 280 },
  { label: '12:00', value: 350 },
  { label: '14:00', value: 320 },
  { label: '16:00', value: 380 },
  { label: '18:00', value: 250 },
  { label: '20:00', value: 180 },
  { label: '22:00', value: 150 }
];

export const alertTrend: ChartDataPoint[] = [
  { label: '周一', value: 45 },
  { label: '周二', value: 38 },
  { label: '周三', value: 52 },
  { label: '周四', value: 41 },
  { label: '周五', value: 36 },
  { label: '周六', value: 28 },
  { label: '周日', value: 32 }
];

export const alertLevelDistribution: ChartDataPoint[] = [
  { label: '严重', value: 5 },
  { label: '重要', value: 12 },
  { label: '次要', value: 25 },
  { label: '警告', value: 38 },
  { label: '信息', value: 20 }
];

export const dutyRecords: DutyRecord[] = [
  { date: '2024-01-15', name: '张工', alertsHandled: 8, avgResponseTime: 5 },
  { date: '2024-01-14', name: '李工', alertsHandled: 12, avgResponseTime: 8 },
  { date: '2024-01-13', name: '王工', alertsHandled: 6, avgResponseTime: 3 },
  { date: '2024-01-12', name: '赵工', alertsHandled: 9, avgResponseTime: 6 },
  { date: '2024-01-11', name: '张工', alertsHandled: 7, avgResponseTime: 4 }
];

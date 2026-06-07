import type {
  OverviewStats,
  KeyMetric,
  TopologyNode,
  RiskItem,
  Resource,
  Alert,
  AlertAction,
  Event,
  InspectionTemplate,
  InspectionRecord,
  ReportMetric,
  ChartDataPoint,
  DutyRecord,
  CheckedItem,
  ScreenshotItem,
  InspectionItem
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
  { id: 'h1', name: 'web-server-01', type: 'host', status: 'running', ip: '10.0.1.101', cpu: 45, memory: 62, region: '北京-可用区A', description: '主 Web 服务节点' },
  { id: 'h2', name: 'web-server-02', type: 'host', status: 'running', ip: '10.0.1.102', cpu: 38, memory: 55, region: '北京-可用区A', description: '备 Web 服务节点' },
  { id: 'h3', name: 'db-master-01', type: 'host', status: 'warning', ip: '10.0.2.101', cpu: 72, memory: 85, region: '北京-可用区B', description: 'MySQL 主库节点' },
  { id: 'h4', name: 'db-slave-01', type: 'host', status: 'running', ip: '10.0.2.102', cpu: 35, memory: 70, region: '北京-可用区B', description: 'MySQL 从库节点' },
  { id: 'h5', name: 'cache-node-01', type: 'host', status: 'running', ip: '10.0.3.101', cpu: 28, memory: 45, region: '北京-可用区A', description: 'Redis 缓存节点' },
  { id: 'c1', name: 'app-container-01', type: 'container', status: 'running', cpu: 32, memory: 48, region: '北京-可用区A', description: '应用容器 1 号' },
  { id: 'c2', name: 'app-container-02', type: 'container', status: 'running', cpu: 29, memory: 52, region: '北京-可用区A', description: '应用容器 2 号' },
  { id: 'c3', name: 'app-container-03', type: 'container', status: 'error', cpu: 0, memory: 0, region: '北京-可用区B', description: '应用容器 3 号' },
  { id: 'c4', name: 'job-worker-01', type: 'container', status: 'running', cpu: 55, memory: 60, region: '北京-可用区B', description: '任务处理容器' },
  { id: 'n1', name: 'core-switch-01', type: 'network', status: 'running', ip: '10.0.0.1', region: '北京-可用区A', description: '核心交换机' },
  { id: 'n2', name: 'firewall-01', type: 'network', status: 'running', ip: '10.0.0.2', region: '北京-可用区A', description: '边界防火墙' },
  { id: 'n3', name: 'load-balancer-01', type: 'network', status: 'warning', ip: '10.0.0.3', region: '北京-可用区B', description: '负载均衡器' },
  { id: 's1', name: 'nas-storage-01', type: 'storage', status: 'running', disk: 82, region: '北京-可用区A', description: 'NAS 文件存储' },
  { id: 's2', name: 'san-storage-01', type: 'storage', status: 'running', disk: 65, region: '北京-可用区B', description: 'SAN 块存储' },
  { id: 's3', name: 'backup-storage-01', type: 'storage', status: 'warning', disk: 88, region: '北京-可用区C', description: '备份存储' }
];

const now = Date.now();

const makeAction = (id: string, alertId: string, action: string, title: string, desc: string, minutesAgo: number, operator = '系统', extra?: Record<string, string>): AlertAction => ({
  id,
  alertId,
  action: action as any,
  title,
  description: desc,
  operator,
  timestamp: new Date(now - minutesAgo * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
  extra
});

export const alerts: Alert[] = [
  {
    id: 'a1',
    title: 'CPU 使用率超过 90%',
    level: 'critical',
    status: 'acknowledged',
    resource: 'db-master-01',
    description: '数据库主节点 CPU 持续高于 90%，持续时间 5 分钟',
    createdAt: new Date(now - 25 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    acknowledgedBy: '张工',
    acknowledgedAt: new Date(now - 22 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    note: '排查发现是慢查询导致 CPU 飙升，已联系 DBA 协助处理',
    actionHistory: [
      makeAction('a1-1', 'a1', 'create', '告警触发', 'CPU 使用率超过 90% 阈值（92.3%）', 25, '系统'),
      makeAction('a1-2', 'a1', 'acknowledge', '告警认领', '张工认领此告警，开始处理', 22, '张工'),
      makeAction('a1-3', 'a1', 'note', '添加备注', '初步判断为慢查询导致，正在联系 DBA', 18, '张工'),
      makeAction('a1-4', 'a1', 'escalate', '告警升级', '已升级给值班主管李工同步', 15, '张工'),
      makeAction('a1-5', 'a1', 'note', '添加备注', '杀掉 3 个慢查询进程，CPU 开始回落', 10, '李工')
    ]
  },
  {
    id: 'a2',
    title: '内存使用率超过 80%',
    level: 'major',
    status: 'suppressed',
    resource: 'web-server-01',
    description: 'Web 服务器内存使用率达到 85%',
    createdAt: new Date(now - 90 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    acknowledgedBy: '李工',
    acknowledgedAt: new Date(now - 85 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    suppressedUntil: new Date(now + 30 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    suppressedBy: '李工',
    actionHistory: [
      makeAction('a2-1', 'a2', 'create', '告警触发', '内存使用率达到 85%', 90, '系统'),
      makeAction('a2-2', 'a2', 'acknowledge', '告警认领', '李工认领此告警', 85, '李工'),
      makeAction('a2-3', 'a2', 'suppress', '告警静音', '业务高峰期间临时静音，时长 2 小时', 60, '李工', { duration: '2小时' })
    ]
  },
  {
    id: 'a3',
    title: '磁盘空间不足 20%',
    level: 'major',
    status: 'active',
    resource: 'nas-storage-01',
    description: 'NAS 存储可用空间不足 20%，剩余 180GB',
    createdAt: new Date(now - 180 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    actionHistory: [
      makeAction('a3-1', 'a3', 'create', '告警触发', '磁盘可用空间不足 20%', 180, '系统')
    ]
  },
  {
    id: 'a4',
    title: '服务响应时间超过阈值',
    level: 'warning',
    status: 'resolved',
    resource: 'app-container-02',
    description: 'API 平均响应时间超过 500ms，达到 680ms',
    createdAt: new Date(now - 300 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    resolvedBy: '王工',
    resolvedAt: new Date(now - 120 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    note: '扩容了 2 个实例，响应时间已恢复正常',
    actionHistory: [
      makeAction('a4-1', 'a4', 'create', '告警触发', 'API 平均响应时间达到 680ms', 300, '系统'),
      makeAction('a4-2', 'a4', 'acknowledge', '告警认领', '王工认领处理', 280, '王工'),
      makeAction('a4-3', 'a4', 'note', '添加备注', '准备扩容容器实例', 250, '王工'),
      makeAction('a4-4', 'a4', 'resolve', '告警恢复', '扩容完成，响应时间恢复到 180ms', 120, '王工')
    ]
  },
  {
    id: 'a5',
    title: '容器重启次数过多',
    level: 'warning',
    status: 'active',
    resource: 'job-worker-01',
    description: '近 24 小时内容器重启 3 次',
    createdAt: new Date(now - 240 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    actionHistory: [
      makeAction('a5-1', 'a5', 'create', '告警触发', '近 24 小时重启 3 次', 240, '系统')
    ]
  },
  {
    id: 'a6',
    title: '数据库慢查询增加',
    level: 'minor',
    status: 'acknowledged',
    resource: 'db-master-01',
    description: '慢查询数量较昨日增加 50%，当前 128 个/小时',
    createdAt: new Date(now - 150 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    acknowledgedBy: '赵工',
    acknowledgedAt: new Date(now - 140 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    note: '正在分析慢查询日志，预计 1 小时内给出优化方案',
    actionHistory: [
      makeAction('a6-1', 'a6', 'create', '告警触发', '慢查询数量达到 128 个/小时', 150, '系统'),
      makeAction('a6-2', 'a6', 'acknowledge', '告警认领', '赵工认领，开始分析慢查询', 140, '赵工'),
      makeAction('a6-3', 'a6', 'note', '添加备注', '发现 2 条未走索引的 SQL，正在优化', 60, '赵工')
    ]
  },
  {
    id: 'a7',
    title: '证书即将过期',
    level: 'info',
    status: 'active',
    resource: 'api.example.com',
    description: 'SSL 证书将在 30 天后过期',
    createdAt: new Date(now - 1440 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    actionHistory: [
      makeAction('a7-1', 'a7', 'create', '告警触发', 'SSL 证书剩余有效期 30 天', 1440, '系统')
    ]
  },
  {
    id: 'a8',
    title: '网络丢包率过高',
    level: 'minor',
    status: 'resolved',
    resource: 'core-switch-01',
    description: '网络接口丢包率超过 1%，达到 1.5%',
    createdAt: new Date(now - 600 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    resolvedBy: '张工',
    resolvedAt: new Date(now - 400 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    actionHistory: [
      makeAction('a8-1', 'a8', 'create', '告警触发', '丢包率达到 1.5%', 600, '系统'),
      makeAction('a8-2', 'a8', 'acknowledge', '告警认领', '张工认领排查', 580, '张工'),
      makeAction('a8-3', 'a8', 'resolve', '告警恢复', '更换网线后丢包率恢复 0.02%', 400, '张工')
    ]
  }
];

export const events: Event[] = [
  { id: 'e1', alertId: 'a1', title: '告警触发', type: 'incident', description: 'CPU 使用率超过 90% 阈值（92.3%）', operator: '系统', timestamp: new Date(now - 25 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') },
  { id: 'e2', alertId: 'a1', title: '告警升级', type: 'action', description: '告警升级为严重级别，通知值班主管', operator: '系统', timestamp: new Date(now - 23 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') },
  { id: 'e3', alertId: 'a1', title: '告警认领', type: 'action', description: '张工认领此告警，开始处理', operator: '张工', timestamp: new Date(now - 22 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') },
  { id: 'e4', alertId: 'a1', title: '添加备注', type: 'note', description: '排查发现是慢查询导致 CPU 飙升，已联系 DBA 协助', operator: '张工', timestamp: new Date(now - 18 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') },
  { id: 'e5', alertId: 'a1', title: '执行操作', type: 'action', description: '杀掉 3 个占用 CPU 过高的慢查询进程', operator: '李工', timestamp: new Date(now - 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') },
  { id: 'e6', alertId: 'a1', title: '状态更新', type: 'incident', description: 'CPU 使用率已下降到 65%，正在持续观察', operator: '系统', timestamp: new Date(now - 8 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') },
  { id: 'e7', alertId: 'a1', title: '添加备注', type: 'note', description: 'CPU 持续下降中，预计 5 分钟内完全恢复', operator: '张工', timestamp: new Date(now - 5 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') }
];

export const inspectionItems: InspectionItem[] = [
  { id: 'item1', name: '机房环境检查', description: '检查机房温度、湿度、空调运行状态', requireScreenshot: true, order: 1 },
  { id: 'item2', name: '设备电源状态', description: '检查所有设备电源指示灯、UPS 状态', requireScreenshot: false, order: 2 },
  { id: 'item3', name: '网络连通性', description: 'Ping 测试核心交换机、路由器、防火墙', requireScreenshot: true, order: 3 },
  { id: 'item4', name: '服务器状态', description: '检查服务器硬件指示灯、风扇状态', requireScreenshot: false, order: 4 },
  { id: 'item5', name: '存储设备状态', description: '检查磁盘阵列指示灯、硬盘状态', requireScreenshot: true, order: 5 },
  { id: 'item6', name: '消防设备检查', description: '检查灭火器、烟感器、消防通道', requireScreenshot: false, order: 6 },
  { id: 'item7', name: '监控系统检查', description: '检查监控摄像头、NVR 运行状态', requireScreenshot: true, order: 7 },
  { id: 'item8', name: '门禁系统检查', description: '检查门禁刷卡、人脸识别功能', requireScreenshot: false, order: 8 },
  { id: 'item9', name: '空调系统检查', description: '检查精密空调运行参数、过滤网状态', requireScreenshot: true, order: 9 },
  { id: 'item10', name: '配线架检查', description: '检查配线架标签、线缆整理情况', requireScreenshot: false, order: 10 },
  { id: 'item11', name: '应急照明检查', description: '测试应急照明、疏散指示灯', requireScreenshot: false, order: 11 },
  { id: 'item12', name: '巡检记录签字', description: '完成所有检查项后签字确认', requireScreenshot: true, order: 12 },
  { id: 'item13', name: '安全巡检', description: '检查机房安全防护、门禁记录', requireScreenshot: false, order: 13 },
  { id: 'item14', name: '环境卫生检查', description: '检查机房清洁度、防尘情况', requireScreenshot: true, order: 14 },
  { id: 'item15', name: '巡检总结', description: '记录本次巡检发现的问题和处理情况', requireScreenshot: false, order: 15 }
];

export const inspectionTemplates: InspectionTemplate[] = [
  { id: 't1', name: '日常巡检-机房', description: '机房环境、设备状态、网络连通性检查', itemCount: 15, frequency: '每日', items: inspectionItems.slice(0, 15) },
  { id: 't2', name: '系统健康检查', description: '服务器 CPU、内存、磁盘、服务状态检查', itemCount: 12, frequency: '每日', items: inspectionItems.slice(0, 12) },
  { id: 't3', name: '数据库巡检', description: '数据库性能、备份、复制状态检查', itemCount: 10, frequency: '每周', items: inspectionItems.slice(0, 10) },
  { id: 't4', name: '安全合规检查', description: '安全策略、补丁更新、访问日志审计', itemCount: 20, frequency: '每月', items: inspectionItems.concat(inspectionItems.slice(0, 5)).map((item, i) => ({ ...item, id: `item-s${i}`, order: i + 1 })) }
];

const demoScreenshots: ScreenshotItem[] = [
  { id: 's1', url: 'https://picsum.photos/id/1/400/300', name: '机房全景图.jpg', uploadAt: new Date(now - 30 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), itemId: 'item1' },
  { id: 's2', url: 'https://picsum.photos/id/2/400/300', name: '网络拓扑截图.png', uploadAt: new Date(now - 25 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), itemId: 'item3' },
  { id: 's3', url: 'https://picsum.photos/id/3/400/300', name: '存储状态图.jpg', uploadAt: new Date(now - 20 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), itemId: 'item5' },
  { id: 's4', url: 'https://picsum.photos/id/6/400/300', name: '监控画面.jpg', uploadAt: new Date(now - 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), itemId: 'item7' }
];

const makeCheckedItems = (count: number, total: number): CheckedItem[] => {
  return inspectionItems.slice(0, total).map((item, i) => ({
    itemId: item.id,
    itemName: item.name,
    checked: i < count,
    checkedAt: i < count ? new Date(now - (count - i) * 5 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') : undefined,
    passed: i < count,
    remark: i < count ? '检查正常' : ''
  }));
};

export const inspectionRecords: InspectionRecord[] = [
  {
    id: 'r1',
    templateId: 't1',
    templateName: '日常巡检-机房',
    status: 'completed',
    operator: '张工',
    startTime: new Date(now - 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    endTime: new Date(now - 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    itemsPassed: 15,
    itemsTotal: 15,
    checkItems: makeCheckedItems(15, 15),
    screenshots: demoScreenshots
  },
  {
    id: 'r2',
    templateId: 't2',
    templateName: '系统健康检查',
    status: 'in_progress',
    operator: '李工',
    startTime: new Date(now - 45 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    itemsPassed: 5,
    itemsTotal: 12,
    checkItems: makeCheckedItems(5, 12),
    screenshots: demoScreenshots.slice(0, 2)
  },
  {
    id: 'r3',
    templateId: 't1',
    templateName: '日常巡检-机房',
    status: 'completed',
    operator: '王工',
    startTime: new Date(now - 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    endTime: new Date(now - 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    itemsPassed: 14,
    itemsTotal: 15,
    checkItems: makeCheckedItems(14, 15).map((item, i) => i === 13 ? { ...item, passed: false, remark: '空调过滤网需更换' } : item),
    screenshots: demoScreenshots.slice(0, 3)
  },
  {
    id: 'r4',
    templateId: 't3',
    templateName: '数据库巡检',
    status: 'completed',
    operator: '赵工',
    startTime: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    endTime: new Date(now - 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    itemsPassed: 10,
    itemsTotal: 10,
    checkItems: makeCheckedItems(10, 10),
    screenshots: [demoScreenshots[1]]
  },
  {
    id: 'r5',
    templateId: 't1',
    templateName: '日常巡检-机房',
    status: 'failed',
    operator: '张工',
    startTime: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    endTime: new Date(now - 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    itemsPassed: 12,
    itemsTotal: 15,
    checkItems: makeCheckedItems(12, 15).map((item, i) => {
      if (i === 5) return { ...item, passed: false, remark: '灭火器压力不足' };
      if (i === 9) return { ...item, passed: false, remark: '配线架标签缺失' };
      if (i === 11) return { ...item, passed: false, remark: '应急照明故障' };
      return item;
    }),
    screenshots: demoScreenshots.slice(0, 2)
  }
];

export const availabilityMetrics: ReportMetric[] = [
  { label: '整体可用率', value: 99.95, unit: '%', trend: '+0.02%' },
  { label: '核心业务', value: 99.99, unit: '%', trend: '+0.01%' },
  { label: '非核心业务', value: 99.8, unit: '%', trend: '+0.05%' }
];

export const alertLevelDistribution: ChartDataPoint[] = [
  { label: '严重', value: 5 },
  { label: '重要', value: 12 },
  { label: '次要', value: 25 },
  { label: '警告', value: 38 },
  { label: '信息', value: 20 }
];

export const reportDataByPeriod: Record<string, {
  responseTime: ChartDataPoint[];
  alertTrend: ChartDataPoint[];
  dutyRecords: DutyRecord[];
}> = {
  day: {
    responseTime: [
      { label: '00:00', value: 120 },
      { label: '02:00', value: 80 },
      { label: '04:00', value: 65 },
      { label: '06:00', value: 100 },
      { label: '08:00', value: 200 },
      { label: '10:00', value: 280 },
      { label: '12:00', value: 350 },
      { label: '14:00', value: 320 },
      { label: '16:00', value: 380 },
      { label: '18:00', value: 250 },
      { label: '20:00', value: 180 },
      { label: '22:00', value: 150 }
    ],
    alertTrend: [
      { label: '00', value: 3 },
      { label: '02', value: 1 },
      { label: '04', value: 2 },
      { label: '06', value: 4 },
      { label: '08', value: 8 },
      { label: '10', value: 12 },
      { label: '12', value: 9 },
      { label: '14', value: 11 },
      { label: '16', value: 15 },
      { label: '18', value: 7 },
      { label: '20', value: 5 },
      { label: '22', value: 3 }
    ],
    dutyRecords: [
      { date: '今日', name: '张工', alertsHandled: 8, avgResponseTime: 5 }
    ]
  },
  week: {
    responseTime: [
      { label: '周一', value: 280 },
      { label: '周二', value: 320 },
      { label: '周三', value: 350 },
      { label: '周四', value: 300 },
      { label: '周五', value: 280 },
      { label: '周六', value: 150 },
      { label: '周日', value: 120 }
    ],
    alertTrend: [
      { label: '周一', value: 45 },
      { label: '周二', value: 38 },
      { label: '周三', value: 52 },
      { label: '周四', value: 41 },
      { label: '周五', value: 36 },
      { label: '周六', value: 28 },
      { label: '周日', value: 32 }
    ],
    dutyRecords: [
      { date: '06-08', name: '张工', alertsHandled: 8, avgResponseTime: 5 },
      { date: '06-07', name: '李工', alertsHandled: 12, avgResponseTime: 8 },
      { date: '06-06', name: '王工', alertsHandled: 6, avgResponseTime: 3 },
      { date: '06-05', name: '赵工', alertsHandled: 9, avgResponseTime: 6 },
      { date: '06-04', name: '张工', alertsHandled: 7, avgResponseTime: 4 },
      { date: '06-03', name: '李工', alertsHandled: 10, avgResponseTime: 7 },
      { date: '06-02', name: '王工', alertsHandled: 5, avgResponseTime: 5 }
    ]
  },
  month: {
    responseTime: [
      { label: '第1周', value: 260 },
      { label: '第2周', value: 290 },
      { label: '第3周', value: 310 },
      { label: '第4周', value: 280 }
    ],
    alertTrend: [
      { label: '第1周', value: 268 },
      { label: '第2周', value: 312 },
      { label: '第3周', value: 287 },
      { label: '第4周', value: 245 }
    ],
    dutyRecords: [
      { date: '第1周', name: '张工', alertsHandled: 45, avgResponseTime: 6 },
      { date: '第2周', name: '李工', alertsHandled: 52, avgResponseTime: 7 },
      { date: '第3周', name: '王工', alertsHandled: 38, avgResponseTime: 5 },
      { date: '第4周', name: '赵工', alertsHandled: 41, avgResponseTime: 4 }
    ]
  }
};

export const dutyRecords: DutyRecord[] = [
  { date: '2024-01-15', name: '张工', alertsHandled: 8, avgResponseTime: 5 },
  { date: '2024-01-14', name: '李工', alertsHandled: 12, avgResponseTime: 8 },
  { date: '2024-01-13', name: '王工', alertsHandled: 6, avgResponseTime: 3 },
  { date: '2024-01-12', name: '赵工', alertsHandled: 9, avgResponseTime: 6 },
  { date: '2024-01-11', name: '张工', alertsHandled: 7, avgResponseTime: 4 }
];

export type AlertLevel = 'critical' | 'major' | 'minor' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'suppressed' | 'resolved';
export type ResourceType = 'host' | 'container' | 'network' | 'storage';
export type ResourceStatus = 'running' | 'warning' | 'error' | 'stopped';
export type InspectionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface OverviewStats {
  serviceHealth: number;
  totalResources: number;
  activeAlerts: number;
  todayRisks: number;
}

export interface KeyMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  status: 'normal' | 'warning' | 'error';
}

export interface TopologyNode {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
}

export interface RiskItem {
  id: string;
  title: string;
  level: AlertLevel;
  description: string;
  time: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  ip?: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  region?: string;
  description?: string;
}

export interface Alert {
  id: string;
  title: string;
  level: AlertLevel;
  status: AlertStatus;
  resource: string;
  description: string;
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  note?: string;
  suppressedUntil?: string;
}

export interface Event {
  id: string;
  alertId?: string;
  title: string;
  type: 'incident' | 'action' | 'note';
  description: string;
  operator: string;
  timestamp: string;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  frequency: string;
}

export interface InspectionRecord {
  id: string;
  templateId: string;
  templateName: string;
  status: InspectionStatus;
  operator: string;
  startTime: string;
  endTime?: string;
  itemsPassed: number;
  itemsTotal: number;
}

export interface ReportMetric {
  label: string;
  value: number;
  unit: string;
  trend?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DutyRecord {
  date: string;
  name: string;
  alertsHandled: number;
  avgResponseTime: number;
}

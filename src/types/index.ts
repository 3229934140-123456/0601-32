export type AlertLevel = 'critical' | 'major' | 'minor' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'suppressed' | 'resolved';
export type ResourceType = 'host' | 'container' | 'network' | 'storage';
export type ResourceStatus = 'running' | 'warning' | 'error' | 'stopped';
export type InspectionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type ActionType = 'acknowledge' | 'suppress' | 'escalate' | 'note' | 'resolve' | 'create' | 'handover' | 'from_inspection';
export type HandoverStatus = 'pending' | 'confirmed';
export type SlaStatus = 'normal' | 'warning' | 'overdue';

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

export interface AlertSlaInfo {
  responseSlaMinutes: number;
  resolveSlaMinutes: number;
  responseStatus: SlaStatus;
  resolveStatus: SlaStatus;
  responseUsedMinutes?: number;
  resolveUsedMinutes?: number;
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
  suppressedBy?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  actionHistory?: AlertAction[];
  sla?: AlertSlaInfo;
  sourceInspectionId?: string;
}

export interface AlertAction {
  id: string;
  alertId: string;
  action: ActionType;
  title: string;
  description: string;
  operator: string;
  timestamp: string;
  extra?: Record<string, string>;
}

export interface Event {
  id: string;
  alertId?: string;
  title: string;
  type: 'incident' | 'action' | 'note';
  description: string;
  operator: string;
  timestamp: string;
  sourceInspectionId?: string;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  frequency: string;
  items: InspectionItem[];
}

export interface InspectionItem {
  id: string;
  name: string;
  description: string;
  requireScreenshot: boolean;
  order: number;
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
  checkItems: CheckedItem[];
  screenshots: ScreenshotItem[];
  report?: InspectionReport;
  relatedAlertIds?: string[];
  relatedEventIds?: string[];
}

export interface CheckedItem {
  itemId: string;
  itemName: string;
  checked: boolean;
  checkedAt?: string;
  passed?: boolean;
  remark?: string;
}

export interface ScreenshotItem {
  id: string;
  url: string;
  name: string;
  uploadAt: string;
  itemId?: string;
}

export interface InspectionReport {
  id: string;
  recordId: string;
  generatedAt: string;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  abnormalItems: CheckedItem[];
  suggestions: string[];
  screenshotCount: number;
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
  avgResolveTime: number;
  responseOverdueCount: number;
  resolveOverdueCount: number;
}

export interface SlaStats {
  responseOverdueCount: number;
  resolveOverdueCount: number;
  avgResponseTime: number;
  avgResolveTime: number;
  responseSlaCompliance: number;
  resolveSlaCompliance: number;
}

export interface ResourceDetail {
  resource: Resource;
  relatedAlerts: Alert[];
  recentEvents: Event[];
}

export interface HandoverRecord {
  id: string;
  shift: string;
  handoverPerson: string;
  takeoverPerson?: string;
  status: HandoverStatus;
  createdAt: string;
  confirmedAt?: string;
  note?: string;
  summary: {
    unresolvedAlerts: Alert[];
    suppressedAlerts: Alert[];
    inProgressEvents: Event[];
    pendingInspections: InspectionRecord[];
    todayRisks: RiskItem[];
  };
}

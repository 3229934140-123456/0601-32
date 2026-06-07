import { create } from 'zustand';
import dayjs from 'dayjs';
import type {
  Alert,
  AlertAction,
  ActionType,
  Event,
  InspectionRecord,
  HandoverRecord,
  AlertSlaInfo,
  SlaStatus
} from '@/types';
import {
  alerts as initialAlerts,
  events as initialEvents,
  inspectionRecords as initialRecords,
  todayRisks
} from '@/data/mockData';

interface AppState {
  alerts: Alert[];
  events: Event[];
  inspectionRecords: InspectionRecord[];
  handoverRecords: HandoverRecord[];

  addAlertAction: (alertId: string, action: AlertAction) => void;
  updateAlertStatus: (alertId: string, updates: Partial<Alert>) => void;
  getAlertById: (id: string) => Alert | undefined;
  getEventsByAlertId: (alertId: string) => Event[];

  addEventNote: (alertId: string, content: string, operator?: string) => void;
  resolveAlert: (alertId: string, operator?: string) => void;
  acknowledgeAlert: (alertId: string, operator?: string) => void;
  suppressAlert: (alertId: string, minutes: number, operator?: string) => void;
  escalateAlert: (alertId: string, operator?: string) => void;

  addInspectionRecord: (record: InspectionRecord) => void;
  updateInspectionRecord: (id: string, updates: Partial<InspectionRecord>) => void;
  getInspectionById: (id: string) => InspectionRecord | undefined;

  addHandoverRecord: (record: HandoverRecord) => void;
  confirmHandover: (recordId: string, takeoverPerson: string) => void;
  generateHandoverSummary: (handoverPerson: string) => HandoverRecord['summary'];

  alertActionToEvent: (action: AlertAction) => Event;
  calculateSla: (alert: Alert) => AlertSlaInfo;

  createAlertFromInspection: (inspectionId: string, title: string, description: string, level: string) => string;
  generateInspectionReport: (recordId: string) => void;

  getSlaStatsByPeriod: (period: 'day' | 'week' | 'month') => {
    responseOverdueCount: number;
    resolveOverdueCount: number;
    avgResolveTime: number;
    slaCompliance: number;
  };
  getDutyRankingByPeriod: (period: 'day' | 'week' | 'month') => {
    name: string;
    alertsHandled: number;
    avgResolveTime: number;
    overdueCount: number;
  }[];
}

const makeAction = (
  alertId: string,
  action: ActionType,
  title: string,
  desc: string,
  operator = '我'
): AlertAction => ({
  id: `${alertId}-${Date.now()}`,
  alertId,
  action,
  title,
  description: desc,
  operator,
  timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
});

const getSlaMinutesByLevel = (level: string): { response: number; resolve: number } => {
  switch (level) {
    case 'critical':
      return { response: 5, resolve: 30 };
    case 'major':
      return { response: 15, resolve: 60 };
    case 'minor':
      return { response: 30, resolve: 120 };
    case 'warning':
      return { response: 60, resolve: 240 };
    default:
      return { response: 120, resolve: 480 };
  }
};

const calculateSlaStatus = (usedMinutes: number, slaMinutes: number): SlaStatus => {
  if (usedMinutes >= slaMinutes) return 'overdue';
  if (usedMinutes >= slaMinutes * 0.8) return 'warning';
  return 'normal';
};

export const useAppStore = create<AppState>((set, get) => ({
  alerts: initialAlerts.map(alert => ({
    ...alert,
    sla: (() => {
      const { response, resolve: resolveSla } = getSlaMinutesByLevel(alert.level);
      const createdAt = dayjs(alert.createdAt);
      const now = dayjs();
      const responseUsed = alert.acknowledgedAt
        ? dayjs(alert.acknowledgedAt).diff(createdAt, 'minute')
        : now.diff(createdAt, 'minute');
      const resolveUsed = alert.resolvedAt
        ? dayjs(alert.resolvedAt).diff(createdAt, 'minute')
        : now.diff(createdAt, 'minute');
      return {
        responseSlaMinutes: response,
        resolveSlaMinutes: resolveSla,
        responseStatus: alert.status === 'resolved' || alert.acknowledgedAt
          ? calculateSlaStatus(responseUsed, response)
          : calculateSlaStatus(responseUsed, response),
        resolveStatus: alert.status === 'resolved'
          ? calculateSlaStatus(resolveUsed, resolveSla)
          : 'normal',
        responseUsedMinutes: responseUsed,
        resolveUsedMinutes: resolveUsed
      };
    })()
  })),

  events: initialEvents,

  inspectionRecords: initialRecords,

  handoverRecords: [
    {
      id: 'h1',
      shift: '白班',
      handoverPerson: '张工',
      takeoverPerson: '李工',
      status: 'confirmed',
      createdAt: dayjs().subtract(1, 'day').hour(18).minute(0).format('YYYY-MM-DD HH:mm:ss'),
      confirmedAt: dayjs().subtract(1, 'day').hour(18).minute(15).format('YYYY-MM-DD HH:mm:ss'),
      note: '注意数据库慢查询问题，已联系 DBA 处理中',
      summary: {
        unresolvedAlerts: [],
        suppressedAlerts: [],
        inProgressEvents: [],
        pendingInspections: [],
        todayRisks: []
      }
    },
    {
      id: 'h2',
      shift: '夜班',
      handoverPerson: '李工',
      takeoverPerson: '王工',
      status: 'confirmed',
      createdAt: dayjs().subtract(2, 'day').hour(8).minute(0).format('YYYY-MM-DD HH:mm:ss'),
      confirmedAt: dayjs().subtract(2, 'day').hour(8).minute(20).format('YYYY-MM-DD HH:mm:ss'),
      note: '夜间系统稳定，无重大告警',
      summary: {
        unresolvedAlerts: [],
        suppressedAlerts: [],
        inProgressEvents: [],
        pendingInspections: [],
        todayRisks: []
      }
    }
  ],

  addAlertAction: (alertId, action) => {
    set(state => ({
      alerts: state.alerts.map(a => {
        if (a.id !== alertId) return a;
        const history = a.actionHistory || [];
        return { ...a, actionHistory: [action, ...history] };
      }),
      events: [get().alertActionToEvent(action), ...state.events]
    }));
  },

  updateAlertStatus: (alertId, updates) => {
    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId ? { ...a, ...updates } : a
      )
    }));
  },

  getAlertById: (id) => {
    return get().alerts.find(a => a.id === id);
  },

  getEventsByAlertId: (alertId) => {
    return get().events.filter(e => e.alertId === alertId);
  },

  addEventNote: (alertId, content, operator = '我') => {
    const action = makeAction(alertId, 'note', '添加备注', content, operator);
    get().addAlertAction(alertId, action);
  },

  resolveAlert: (alertId, operator = '我') => {
    const action = makeAction(alertId, 'resolve', '告警恢复', '已确认告警恢复正常', operator);
    get().addAlertAction(alertId, action);
    const alert = get().getAlertById(alertId);
    if (alert) {
      const resolvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const updated = {
        status: 'resolved' as const,
        resolvedBy: operator,
        resolvedAt
      };
      const newAlert = { ...alert, ...updated };
      const sla = get().calculateSla(newAlert);
      get().updateAlertStatus(alertId, { ...updated, sla });
    }
  },

  acknowledgeAlert: (alertId, operator = '我') => {
    const action = makeAction(alertId, 'acknowledge', '告警认领', '已认领此告警，开始处理', operator);
    get().addAlertAction(alertId, action);
    const alert = get().getAlertById(alertId);
    if (alert) {
      const acknowledgedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const updated = {
      status: 'acknowledged' as const,
      acknowledgedBy: operator,
      acknowledgedAt
    };
      const newAlert = { ...alert, ...updated };
      const sla = get().calculateSla(newAlert);
      get().updateAlertStatus(alertId, { ...updated, sla });
    }
  },

  suppressAlert: (alertId, minutes, operator = '我') => {
    const until = dayjs().add(minutes, 'minute').format('YYYY-MM-DD HH:mm:ss');
    const action = makeAction(
      alertId,
      'suppress',
      '告警静音',
      `静音 ${minutes} 分钟，将于 ${dayjs(until).format('HH:mm')} 到期`,
      operator
    );
    get().addAlertAction(alertId, action);
    get().updateAlertStatus(alertId, {
      status: 'suppressed',
      suppressedUntil: until,
      suppressedBy: operator
    });
  },

  escalateAlert: (alertId, operator = '我') => {
    const action = makeAction(alertId, 'escalate', '告警升级', '已升级给值班主管，等待响应', operator);
    get().addAlertAction(alertId, action);
  },

  addInspectionRecord: (record) => {
    set(state => ({
      inspectionRecords: [record, ...state.inspectionRecords]
    }));
  },

  updateInspectionRecord: (id, updates) => {
    set(state => ({
      inspectionRecords: state.inspectionRecords.map(r =>
        r.id === id ? { ...r, ...updates } : r
      )
    }));
  },

  getInspectionById: (id) => {
    return get().inspectionRecords.find(r => r.id === id);
  },

  addHandoverRecord: (record) => {
    set(state => ({
      handoverRecords: [record, ...state.handoverRecords]
    }));
  },

  confirmHandover: (recordId, takeoverPerson) => {
    set(state => ({
      handoverRecords: state.handoverRecords.map(r =>
        r.id === recordId
          ? {
              ...r,
              status: 'confirmed',
              takeoverPerson,
              confirmedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
          : r
      )
    }));
  },

  generateHandoverSummary: () => {
    const { alerts, inspectionRecords } = get();
    const unresolvedAlerts = alerts.filter(a => a.status !== 'resolved');
    const suppressedAlerts = alerts.filter(
      a => a.status === 'suppressed' && a.suppressedUntil && dayjs(a.suppressedUntil).isAfter(dayjs())
    );
    const inProgressAlerts = alerts.filter(
      a => a.status === 'active' || a.status === 'acknowledged'
    );
    const inProgressEvents = inProgressAlerts.map(alert => ({
      id: `evt-${alert.id}`,
      alertId: alert.id,
      title: alert.title,
      type: 'incident' as const,
      description: alert.description,
      operator: alert.acknowledgedBy || '系统',
      timestamp: alert.createdAt
    }));
    const pendingInspections = inspectionRecords.filter(r => r.status === 'in_progress');

    return {
      unresolvedAlerts,
      suppressedAlerts,
      inProgressEvents,
      pendingInspections,
      todayRisks
    };
  },

  alertActionToEvent: (action) => {
    let type: 'incident' | 'action' | 'note' = 'action';
    if (action.action === 'create' || action.action === 'resolve') {
      type = 'incident';
    } else if (action.action === 'note') {
      type = 'note';
    }
    return {
      id: `e-${action.id}`,
      alertId: action.alertId,
      title: action.title,
      type,
      description: action.description,
      operator: action.operator,
      timestamp: action.timestamp
    };
  },

  calculateSla: (alert) => {
    const { response, resolve: resolveSla } = getSlaMinutesByLevel(alert.level);
    const createdAt = dayjs(alert.createdAt);
    const now = dayjs();
    const responseUsed = alert.acknowledgedAt
      ? dayjs(alert.acknowledgedAt).diff(createdAt, 'minute')
      : now.diff(createdAt, 'minute');
    const resolveUsed = alert.resolvedAt
      ? dayjs(alert.resolvedAt).diff(createdAt, 'minute')
      : now.diff(createdAt, 'minute');
    return {
      responseSlaMinutes: response,
      resolveSlaMinutes: resolveSla,
      responseStatus: alert.status === 'resolved' || alert.acknowledgedAt
        ? calculateSlaStatus(responseUsed, response)
        : calculateSlaStatus(responseUsed, response),
      resolveStatus: alert.status === 'resolved'
        ? calculateSlaStatus(resolveUsed, resolveSla)
        : calculateSlaStatus(resolveUsed, resolveSla),
      responseUsedMinutes: responseUsed,
      resolveUsedMinutes: resolveUsed
    };
  },

  createAlertFromInspection: (inspectionId, title, description, level) => {
    const alertId = `alert-${Date.now()}`;
    const now = dayjs();
    const newAlert: Alert = {
      id: alertId,
      title,
      level: level as Alert['level'],
      status: 'active',
      resource: '巡检发现',
      description,
      createdAt: now.format('YYYY-MM-DD HH:mm:ss'),
      sourceInspectionId: inspectionId,
      actionHistory: [
        {
          id: `${alertId}-create`,
          alertId,
          action: 'from_inspection',
          title: '巡检发现异常',
          description: `来自巡检发现的异常，已自动创建告警`,
          operator: '系统',
          timestamp: now.format('YYYY-MM-DD HH:mm:ss')
        }
      ]
    };
    newAlert.sla = get().calculateSla(newAlert);
    set(state => ({
      alerts: [newAlert, ...state.alerts],
      events: [
        {
          id: `e-${alertId}-create`,
          alertId,
          title: '巡检发现异常',
          type: 'incident',
          description,
          operator: '系统',
          timestamp: now.format('YYYY-MM-DD HH:mm:ss'),
          sourceInspectionId: inspectionId
        },
        ...state.events
      ],
      inspectionRecords: state.inspectionRecords.map(r =>
        r.id === inspectionId
          ? { ...r, relatedAlertIds: [...(r.relatedAlertIds || []), alertId] }
          : r
      )
    }));
    return alertId;
  },

  generateInspectionReport: (recordId) => {
    const record = get().getInspectionById(recordId);
    if (!record || !record.checkItems) return;

    const abnormalItems = record.checkItems.filter(item => !item.passed && item.checked);
    const passedItems = record.checkItems.filter(item => item.passed && item.checked);

    const suggestions: string[] = [];
    if (abnormalItems.length > 0) {
      suggestions.push('建议优先处理巡检发现的异常项');
      suggestions.push('对异常项关联的资源进行深入排查');
      suggestions.push('将严重异常升级为告警或事件跟踪处理');
    } else {
      suggestions.push('本次巡检无异常，继续保持日常监控');
    }

    const report = {
      id: `report-${recordId}`,
      recordId,
      generatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      totalItems: record.checkItems.length,
      passedItems: passedItems.length,
      failedItems: abnormalItems.length,
      abnormalItems,
      suggestions,
      screenshotCount: record.screenshots?.length || 0
    };

    get().updateInspectionRecord(recordId, { report });
  },

  getSlaStatsByPeriod: (period) => {
    const { alerts } = get();
    const now = dayjs();
    let startOfPeriod: dayjs.Dayjs;

    switch (period) {
      case 'day':
        startOfPeriod = now.startOf('day');
        break;
      case 'week':
        startOfPeriod = now.startOf('week');
        break;
      case 'month':
        startOfPeriod = now.startOf('month');
        break;
      default:
        startOfPeriod = now.startOf('week');
    }

    const periodAlerts = alerts.filter(a => dayjs(a.createdAt).isAfter(startOfPeriod));

    let responseOverdueCount = 0;
    let resolveOverdueCount = 0;
    let totalResolveTime = 0;
    let resolvedCount = 0;

    periodAlerts.forEach(alert => {
      const sla = alert.sla || get().calculateSla(alert);
      if (sla.responseStatus === 'overdue') responseOverdueCount++;
      if (alert.status === 'resolved') {
        if (sla.resolveStatus === 'overdue') resolveOverdueCount++;
        if (sla.resolveUsedMinutes !== undefined) {
          totalResolveTime += sla.resolveUsedMinutes;
          resolvedCount++;
        }
      }
    });

    const total = periodAlerts.length || 1;
    const complianceRate = Math.max(0, ((total - Math.max(responseOverdueCount, resolveOverdueCount)) / total) * 100);

    return {
      responseOverdueCount,
      resolveOverdueCount,
      avgResolveTime: resolvedCount > 0 ? Math.round(totalResolveTime / resolvedCount) : 0,
      slaCompliance: Number(complianceRate.toFixed(1))
    };
  },

  getDutyRankingByPeriod: (period) => {
    const { alerts } = get();
    const now = dayjs();
    let startOfPeriod: dayjs.Dayjs;

    switch (period) {
      case 'day':
        startOfPeriod = now.startOf('day');
        break;
      case 'week':
        startOfPeriod = now.startOf('week');
        break;
      case 'month':
        startOfPeriod = now.startOf('month');
        break;
      default:
        startOfPeriod = now.startOf('week');
    }

    const periodAlerts = alerts.filter(a =>
      (a.acknowledgedAt && dayjs(a.acknowledgedAt).isAfter(startOfPeriod)) ||
      (a.resolvedAt && dayjs(a.resolvedAt).isAfter(startOfPeriod))
    );

    const personStats = new Map<string, { handled: number; totalResolveTime: number; resolveCount: number; overdue: number }>();

    periodAlerts.forEach(alert => {
      const operator = alert.resolvedBy || alert.acknowledgedBy || '未知';
      if (!personStats.has(operator)) {
        personStats.set(operator, { handled: 0, totalResolveTime: 0, resolveCount: 0, overdue: 0 });
      }
      const stats = personStats.get(operator)!;
      stats.handled++;

      const sla = alert.sla || get().calculateSla(alert);
      if (sla.resolveStatus === 'overdue' || sla.responseStatus === 'overdue') {
        stats.overdue++;
      }

      if (alert.status === 'resolved' && sla.resolveUsedMinutes !== undefined) {
        stats.totalResolveTime += sla.resolveUsedMinutes;
        stats.resolveCount++;
      }
    });

    const ranking = Array.from(personStats.entries())
      .map(([name, stats]) => ({
        name,
        alertsHandled: stats.handled,
        avgResolveTime: stats.resolveCount > 0 ? Math.round(stats.totalResolveTime / stats.resolveCount) : 0,
        overdueCount: stats.overdue
      }))
      .sort((a, b) => b.alertsHandled - a.alertsHandled)
      .slice(0, 5);

    return ranking;
  }
}));

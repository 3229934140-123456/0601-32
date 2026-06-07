import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useAppStore } from '@/stores/appStore';
import type { Event, Alert, AlertAction } from '@/types';

const EventsPage: React.FC = () => {
  const router = useRouter();
  const alertId = router.params.alertId || 'a1';
  
  const getAlertById = useAppStore(state => state.getAlertById);
  const addEventNote = useAppStore(state => state.addEventNote);
  const resolveAlert = useAppStore(state => state.resolveAlert);
  const events = useAppStore(state => state.events);
  const getInspectionById = useAppStore(state => state.getInspectionById);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  const alertInfo = useMemo(() => getAlertById(alertId as string) || null, [alertId, getAlertById]);

  const eventList = useMemo(() => {
    const alert = getAlertById(alertId as string);
    if (alert?.actionHistory && alert.actionHistory.length > 0) {
      return alert.actionHistory.map((action: AlertAction): Event => ({
        id: action.id,
        alertId: action.alertId,
        title: action.title,
        type: action.action === 'note' ? 'note' : action.action === 'create' || action.action === 'resolve' ? 'incident' : 'action',
        description: action.description,
        operator: action.operator,
        timestamp: action.timestamp
      }));
    }
    const related = events.filter(e => e.alertId === alertId);
    return related.length > 0 ? related : events.slice(0, 5);
  }, [alertId, getAlertById, events]);

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'critical':
        return styles.levelCritical;
      case 'major':
        return styles.levelMajor;
      case 'minor':
        return styles.levelMinor;
      case 'warning':
        return styles.levelWarning;
      default:
        return styles.levelInfo;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'critical':
        return '严重';
      case 'major':
        return '重要';
      case 'minor':
        return '次要';
      case 'warning':
        return '警告';
      default:
        return '信息';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'acknowledged':
        return styles.statusAcknowledged;
      case 'suppressed':
        return styles.statusSuppressed;
      case 'resolved':
        return styles.statusResolved;
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '活动';
      case 'acknowledged':
        return '已认领';
      case 'suppressed':
        return '已静音';
      case 'resolved':
        return '已恢复';
      default:
        return status;
    }
  };

  const getDotClass = (type: string) => {
    switch (type) {
      case 'incident':
        return styles.dotIncident;
      case 'action':
        return styles.dotAction;
      case 'note':
        return styles.dotNote;
      default:
        return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return '🚨';
      case 'action':
        return '⚡';
      case 'note':
        return '📝';
      default:
        return '📋';
    }
  };

  const getSlaInfo = (alert: Alert) => {
    if (!alert.sla) return null;
    const items = [];
    if (alert.sla.responseStatus === 'overdue') {
      items.push({ label: '响应超时', value: `${alert.sla.responseUsedMinutes}分钟`, type: 'error' });
    } else if (alert.sla.responseStatus === 'warning') {
      items.push({ label: '响应临近', value: `${alert.sla.responseUsedMinutes}/${alert.sla.responseSlaMinutes}分钟`, type: 'warning' });
    } else if (alert.acknowledgedAt) {
      items.push({ label: '响应时长', value: `${alert.sla.responseUsedMinutes}分钟`, type: 'success' });
    }
    if (alert.status === 'resolved' && alert.sla.resolveStatus === 'overdue') {
      items.push({ label: '恢复超时', value: `${alert.sla.resolveUsedMinutes}分钟`, type: 'error' });
    } else if (alert.status === 'resolved') {
      items.push({ label: '恢复时长', value: `${alert.sla.resolveUsedMinutes}分钟`, type: 'success' });
    }
    return items;
  };

  const formatTime = (timeStr: string) => {
    return dayjs(timeStr).format('HH:mm');
  };

  const formatDateTime = (timeStr: string) => {
    return dayjs(timeStr).format('MM-DD HH:mm');
  };

  const handleAddNote = () => {
    setNoteText('');
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) {
      Taro.showToast({ title: '请输入备注内容', icon: 'none' });
      return;
    }
    addEventNote(alertId as string, noteText, '我');
    setShowNoteModal(false);
    setNoteText('');
    Taro.showToast({ title: '备注已添加', icon: 'success' });
  };

  const handleResolve = () => {
    Taro.showModal({
      title: '确认恢复',
      content: '确定此告警已恢复吗？',
      success: (res) => {
        if (res.confirm) {
          resolveAlert(alertId as string, '我');
          Taro.showToast({ title: '已标记为恢复', icon: 'success' });
        }
      }
    });
  };

  const goToInspection = (inspectionId: string) => {
    Taro.switchTab({
      url: '/pages/inspection/index',
      success: () => {
        Taro.showToast({ title: '跳转到巡检记录', icon: 'none' });
      }
    });
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  const slaItems = alertInfo ? getSlaInfo(alertInfo) : [];

  return (
    <View className={styles.page}>
      {alertInfo && (
        <View className={styles.header}>
          <View className={styles.alertTitle}>{alertInfo.title}</View>
          <View className={styles.alertMeta}>
            <View className={classNames(styles.levelBadge, getLevelClass(alertInfo.level))}>
              {getLevelText(alertInfo.level)}
            </View>
            <View className={classNames(styles.statusTag, getStatusClass(alertInfo.status))}>
              {getStatusText(alertInfo.status)}
            </View>
          </View>
          <View className={styles.alertInfo}>
            <Text className={styles.infoItem}>📍 {alertInfo.resource}</Text>
            <Text className={styles.infoItem}>🕐 {formatDateTime(alertInfo.createdAt)}</Text>
          </View>
          {alertInfo.acknowledgedBy && (
            <View className={styles.alertInfo}>
              <Text className={styles.infoItem}>👤 认领人：{alertInfo.acknowledgedBy}</Text>
            </View>
          )}
          {alertInfo.status === 'suppressed' && alertInfo.suppressedUntil && (
            <View className={styles.alertInfo}>
              <Text className={styles.infoItem}>🔇 静音至 {formatTime(alertInfo.suppressedUntil)}</Text>
            </View>
          )}
          {alertInfo.note && (
            <View className={styles.noteBox}>
              <Text className={styles.noteLabel}>📝 最新备注：</Text>
              <Text className={styles.noteText}>{alertInfo.note}</Text>
            </View>
          )}
          {alertInfo.sourceInspectionId && (
            <View className={styles.sourceBox} onClick={() => goToInspection(alertInfo.sourceInspectionId)}>
              <View className={styles.sourceInfo}>
                <Text className={styles.sourceLabel}>📋 来源巡检：</Text>
                <Text className={styles.sourceName}>
                  {getInspectionById(alertInfo.sourceInspectionId)?.templateName || '巡检记录'}
                </Text>
              </View>
              <Text className={styles.sourceArrow}>→</Text>
            </View>
          )}
          {slaItems && slaItems.length > 0 && (
            <View className={styles.slaSection}>
              {slaItems.map((item, index) => (
                <View
                  key={index}
                  className={classNames(
                    styles.slaItem,
                    item.type === 'error' && styles.slaItemError,
                    item.type === 'warning' && styles.slaItemWarning,
                    item.type === 'success' && styles.slaItemSuccess
                  )}
                >
                  <Text className={styles.slaLabel}>{item.label}</Text>
                  <Text className={styles.slaValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <ScrollView scrollY className={styles.timelineSection}>
        <View className={styles.sectionTitle}>
          <Text>处理时间线</Text>
          <Text className={styles.eventCount}>共 {eventList.length} 条</Text>
        </View>

        <View className={styles.timeline}>
          {eventList.map((event: Event) => (
            <View key={event.id} className={styles.timelineItem}>
              <View className={classNames(styles.timelineDot, getDotClass(event.type))} />
              <View className={styles.timelineContent}>
                <View className={styles.timelineHeader}>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text className={styles.typeIcon}>{getTypeIcon(event.type)}</Text>
                    <Text className={styles.timelineType}>{event.title}</Text>
                  </View>
                  <Text className={styles.timelineTime}>
                    {formatTime(event.timestamp)}
                  </Text>
                </View>
                <View className={styles.timelineDesc}>{event.description}</View>
                <View className={styles.timelineOperator}>
                  <Text className={styles.operatorIcon}>👤</Text>
                  <Text>{event.operator}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.actionBar}>
        <View className={classNames(styles.actionBtn, styles.btnSecondary)} onClick={handleAddNote}>
          📝 添加备注
        </View>
        {alertInfo?.status !== 'resolved' && (
          <View className={classNames(styles.actionBtn, styles.btnSuccess)} onClick={handleResolve}>
            ✅ 标记恢复
          </View>
        )}
      </View>

      {showNoteModal && (
        <View className={styles.modal} onClick={() => setShowNoteModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalTitle}>添加备注</View>
            <Textarea
              className={styles.modalInput}
              placeholder="请输入备注内容..."
              value={noteText}
              onInput={(e) => setNoteText(e.detail.value)}
              maxlength={500}
            />
            <View className={styles.modalActions}>
              <View
                className={classNames(styles.modalBtn, styles.modalCancel)}
                onClick={() => setShowNoteModal(false)}
              >
                取消
              </View>
              <View
                className={classNames(styles.modalBtn, styles.modalConfirm)}
                onClick={handleSaveNote}
              >
                保存
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default EventsPage;

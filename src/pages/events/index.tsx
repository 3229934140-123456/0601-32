import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { events, alerts } from '@/data/mockData';
import type { Event, Alert } from '@/types';

const EventsPage: React.FC = () => {
  const router = useRouter();
  const alertId = router.params.alertId || 'a1';
  const [alertInfo, setAlertInfo] = useState<Alert | null>(null);
  const [eventList, setEventList] = useState<Event[]>([]);

  useEffect(() => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setAlertInfo(alert);
    }
    const relatedEvents = events.filter(e => e.alertId === alertId);
    if (relatedEvents.length > 0) {
      setEventList(relatedEvents);
    } else {
      setEventList(events);
    }
  }, [alertId]);

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

  const handleAddNote = () => {
    Taro.showToast({ title: '添加备注功能', icon: 'none' });
  };

  const handleResolve = () => {
    Taro.showModal({
      title: '确认恢复',
      content: '确定此告警已恢复吗？',
      success: (res) => {
        if (res.confirm) {
          const newEvent: Event = {
            id: `e${Date.now()}`,
            alertId: alertId as string,
            title: '告警恢复',
            type: 'action',
            description: '值班人员确认告警已恢复',
            operator: '张工',
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
          };
          setEventList(prev => [...prev, newEvent]);
          Taro.showToast({ title: '已标记为恢复', icon: 'success' });
        }
      }
    });
  };

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
            <Text className={styles.resourceName}>📍 {alertInfo.resource}</Text>
          </View>
        </View>
      )}

      <ScrollView scrollY className={styles.timelineSection}>
        <View className={styles.sectionTitle}>处理时间线</View>

        <View className={styles.timeline}>
          {eventList.map((event: Event, index: number) => (
            <View key={event.id} className={styles.timelineItem}>
              <View className={classNames(styles.timelineDot, getDotClass(event.type))} />
              <View className={styles.timelineContent}>
                <View className={styles.timelineHeader}>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text className={styles.typeIcon}>{getTypeIcon(event.type)}</Text>
                    <Text className={styles.timelineType}>{event.title}</Text>
                  </View>
                  <Text className={styles.timelineTime}>
                    {event.timestamp.slice(11, 16)}
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
    </View>
  );
};

export default EventsPage;

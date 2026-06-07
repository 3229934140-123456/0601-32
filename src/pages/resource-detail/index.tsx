import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classNames from 'classnames';
import { resources } from '@/data/mockData';
import { useAppStore } from '@/stores/appStore';
import type { Resource, Alert, Event, AlertAction } from '@/types';

const ResourceDetailPage: React.FC = () => {
  const router = useRouter();
  const resourceId = router.params.id || 'h1';
  const alerts = useAppStore(state => state.alerts);

  const resource = useMemo(() => 
    resources.find(r => r.id === resourceId) || null,
    [resourceId]
  );

  const relatedAlerts = useMemo(() => {
    if (!resource) return [];
    return alerts.filter(a => a.resource === resource.name);
  }, [resource, alerts]);

  const recentEvents = useMemo(() => {
    const events: (Event & { alertId: string })[] = [];
    relatedAlerts.forEach(alert => {
      const history = alert.actionHistory || [];
      history.forEach((action: AlertAction) => {
        events.push({
          id: action.id,
          alertId: alert.id,
          title: action.title,
          type: action.action === 'note' ? 'note' : action.action === 'create' || action.action === 'resolve' ? 'incident' : 'action',
          description: action.description,
          operator: action.operator,
          timestamp: action.timestamp
        });
      });
    });
    return events
      .sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())
      .slice(0, 10);
  }, [relatedAlerts]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'host':
        return '🖥️';
      case 'container':
        return '📦';
      case 'network':
        return '🌐';
      case 'storage':
        return '💾';
      default:
        return '📦';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'host':
        return '主机';
      case 'container':
        return '容器';
      case 'network':
        return '网络';
      case 'storage':
        return '存储';
      default:
        return type;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'running':
        return styles.statusRunning;
      case 'warning':
        return styles.statusWarning;
      case 'error':
        return styles.statusError;
      case 'stopped':
        return styles.statusStopped;
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'warning':
        return '告警';
      case 'error':
        return '异常';
      case 'stopped':
        return '已停止';
      default:
        return status;
    }
  };

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

  const getEventDotClass = (type: string) => {
    switch (type) {
      case 'incident':
        return styles.eventDotIncident;
      case 'action':
        return styles.eventDotAction;
      case 'note':
        return styles.eventDotNote;
      default:
        return '';
    }
  };

  const formatTime = (timeStr: string) => {
    return dayjs(timeStr).format('HH:mm');
  };

  const formatDateTime = (timeStr: string) => {
    return dayjs(timeStr).format('MM-DD HH:mm');
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return '#f53f3f';
    if (value >= 70) return '#ff7d00';
    if (value >= 50) return '#ffc300';
    return '#165dff';
  };

  const goToAlert = (alertId: string) => {
    Taro.navigateTo({ url: `/pages/events/index?alertId=${alertId}` });
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  if (!resource) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📦</Text>
          <Text className={styles.emptyText}>资源不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.backBtn} onClick={goBack}>← 返回</View>
        <View className={styles.resourceBasic}>
          <View className={styles.resourceIcon}>{getTypeIcon(resource.type)}</View>
          <View className={styles.resourceInfo}>
            <Text className={styles.resourceName}>{resource.name}</Text>
            <View className={styles.resourceMeta}>
              <Text className={styles.resourceType}>{getTypeText(resource.type)}</Text>
              <View className={classNames(styles.statusBadge, getStatusClass(resource.status))}>
                {getStatusText(resource.status)}
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>基本信息</Text>
          <View className={styles.infoCard}>
            {resource.ip && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>IP 地址</Text>
                <Text className={styles.infoValue}>{resource.ip}</Text>
              </View>
            )}
            {resource.region && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>所属区域</Text>
                <Text className={styles.infoValue}>{resource.region}</Text>
              </View>
            )}
            {resource.description && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>描述</Text>
                <Text className={styles.infoValue}>{resource.description}</Text>
              </View>
            )}
          </View>
        </View>

        {(resource.cpu !== undefined || resource.memory !== undefined || resource.disk !== undefined) && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>资源指标</Text>
            <View className={styles.metricsCard}>
              {resource.cpu !== undefined && (
                <View className={styles.metricItem}>
                  <View className={styles.metricHeader}>
                    <Text className={styles.metricName}>CPU 使用率</Text>
                    <Text className={styles.metricValue}>{resource.cpu}%</Text>
                  </View>
                  <View className={styles.metricBar}>
                    <View
                      className={styles.metricFill}
                      style={{
                        width: `${resource.cpu}%`,
                        background: getProgressColor(resource.cpu)
                      }}
                    />
                  </View>
                </View>
              )}
              {resource.memory !== undefined && (
                <View className={styles.metricItem}>
                  <View className={styles.metricHeader}>
                    <Text className={styles.metricName}>内存使用率</Text>
                    <Text className={styles.metricValue}>{resource.memory}%</Text>
                  </View>
                  <View className={styles.metricBar}>
                    <View
                      className={styles.metricFill}
                      style={{
                        width: `${resource.memory}%`,
                        background: getProgressColor(resource.memory)
                      }}
                    />
                  </View>
                </View>
              )}
              {resource.disk !== undefined && (
                <View className={styles.metricItem}>
                  <View className={styles.metricHeader}>
                    <Text className={styles.metricName}>磁盘使用率</Text>
                    <Text className={styles.metricValue}>{resource.disk}%</Text>
                  </View>
                  <View className={styles.metricBar}>
                    <View
                      className={styles.metricFill}
                      style={{
                        width: `${resource.disk}%`,
                        background: getProgressColor(resource.disk)
                      }}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>关联告警</Text>
            <Text className={styles.sectionCount}>共 {relatedAlerts.length} 条</Text>
          </View>
          {relatedAlerts.length === 0 ? (
            <View className={styles.emptyCard}>
              <Text className={styles.emptyIcon}>✅</Text>
              <Text className={styles.emptyText}>暂无关联告警</Text>
            </View>
          ) : (
            <View className={styles.alertList}>
              {relatedAlerts.map((alert: Alert) => (
                <View
                  key={alert.id}
                  className={styles.alertItem}
                  onClick={() => goToAlert(alert.id)}
                >
                  <View className={classNames(styles.alertLevelBar, getLevelClass(alert.level))} />
                  <View className={styles.alertContent}>
                    <View className={styles.alertHeader}>
                      <Text className={styles.alertItemTitle}>{alert.title}</Text>
                      <View className={classNames(styles.levelBadge, getLevelClass(alert.level))}>
                        {getLevelText(alert.level)}
                      </View>
                    </View>
                    <Text className={styles.alertDesc}>{alert.description}</Text>
                    <View className={styles.alertFooter}>
                      <Text className={styles.alertTime}>{formatDateTime(alert.createdAt)}</Text>
                      <Text className={styles.alertStatusText}>
                        {alert.status === 'resolved' ? '已恢复' : alert.status === 'acknowledged' ? '已认领' : '活动'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>最近事件</Text>
            <Text className={styles.sectionCount}>共 {recentEvents.length} 条</Text>
          </View>
          {recentEvents.length === 0 ? (
            <View className={styles.emptyCard}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无事件记录</Text>
            </View>
          ) : (
            <View className={styles.eventList}>
              {recentEvents.map((event) => (
                <View
                  key={event.id}
                  className={styles.eventItem}
                  onClick={() => goToAlert(event.alertId)}
                >
                  <View className={classNames(styles.eventDot, getEventDotClass(event.type))} />
                  <View className={styles.eventContent}>
                    <View className={styles.eventHeader}>
                      <Text className={styles.eventTitle}>{event.title}</Text>
                      <Text className={styles.eventTime}>{formatTime(event.timestamp)}</Text>
                    </View>
                    <Text className={styles.eventDesc}>{event.description}</Text>
                    <Text className={styles.eventOperator}>— {event.operator}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ResourceDetailPage;

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classNames from 'classnames';
import { resources, alerts, events } from '@/data/mockData';
import type { Resource, Alert, Event } from '@/types';

const ResourceDetailPage: React.FC = () => {
  const router = useRouter();
  const resourceId = router.params.id || 'h1';
  const [resource, setResource] = useState<Resource | null>(null);
  const [relatedAlerts, setRelatedAlerts] = useState<Alert[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  useEffect(() => {
    const res = resources.find(r => r.id === resourceId);
    if (res) {
      setResource(res);
      
      const related = alerts.filter(a => a.resource === res.name).slice(0, 5);
      setRelatedAlerts(related);
      
      const recent = events
        .filter(e => {
          const alert = alerts.find(a => a.id === e.alertId);
          return alert && alert.resource === res.name;
        })
        .slice(0, 5);
      setRecentEvents(recent);
    }
  }, [resourceId]);

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

  const formatTime = (timeStr: string) => {
    return dayjs(timeStr).format('HH:mm');
  };

  const formatDateTime = (timeStr: string) => {
    return dayjs(timeStr).format('MM-DD HH:mm');
  };

  const getProgressColor = (value: number, type: 'cpu' | 'memory' | 'disk') => {
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
        <View className={styles.backBtn} onClick={goBack}>
          ← 返回
        </View>
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
                        background: getProgressColor(resource.cpu, 'cpu')
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
                        background: getProgressColor(resource.memory, 'memory')
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
                        background: getProgressColor(resource.disk, 'disk')
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
                      <Text className={styles.alertTitle}>{alert.title}</Text>
                      <View className={classNames(styles.levelBadge, getLevelClass(alert.level))}>
                        {getLevelText(alert.level)}
                      </View>
                    </View>
                    <Text className={styles.alertDesc}>{alert.description}</Text>
                    <View className={styles.alertFooter}>
                      <Text className={styles.alertTime}>{formatDateTime(alert.createdAt)}</Text>
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
              {recentEvents.map((event: Event) => (
                <View key={event.id} className={styles.eventItem}>
                  <View className={styles.eventDot} />
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

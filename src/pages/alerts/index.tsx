import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { alerts as initialAlerts } from '@/data/mockData';
import type { Alert, AlertLevel, AlertStatus } from '@/types';

const levelTabs: { key: AlertLevel | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'critical', label: '严重' },
  { key: 'major', label: '重要' },
  { key: 'minor', label: '次要' },
  { key: 'info', label: '信息' }
];

const statusTabs: { key: AlertStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '活动' },
  { key: 'acknowledged', label: '已认领' },
  { key: 'suppressed', label: '已静音' },
  { key: 'resolved', label: '已恢复' }
];

const suppressOptions = [
  { key: '30min', label: '30分钟' },
  { key: '1h', label: '1小时' },
  { key: '2h', label: '2小时' },
  { key: '24h', label: '24小时' }
];

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [activeLevel, setActiveLevel] = useState<AlertLevel | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<AlertStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSuppressModal, setShowSuppressModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedSuppressTime, setSelectedSuppressTime] = useState('30min');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchLevel = activeLevel === 'all' || alert.level === activeLevel;
      const matchStatus = activeStatus === 'all' || alert.status === activeStatus;
      return matchLevel && matchStatus;
    });
  }, [alerts, activeLevel, activeStatus]);

  const getLevelClass = (level: string, type: 'bar' | 'badge' | 'text') => {
    const map: Record<string, Record<string, string>> = {
      critical: { bar: styles.barCritical, badge: styles.badgeCritical, text: styles.levelCritical },
      major: { bar: styles.barMajor, badge: styles.badgeMajor, text: styles.levelMajor },
      minor: { bar: styles.barMinor, badge: styles.badgeMinor, text: styles.levelMinor },
      warning: { bar: styles.barWarning, badge: styles.badgeWarning, text: styles.levelWarning },
      info: { bar: styles.barInfo, badge: styles.badgeInfo, text: styles.levelInfo }
    };
    return map[level]?.[type] || '';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.tagActive;
      case 'acknowledged':
        return styles.tagAcknowledged;
      case 'suppressed':
        return styles.tagSuppressed;
      case 'resolved':
        return styles.tagResolved;
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
      case 'info':
        return '信息';
      default:
        return level;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAcknowledge = (alert: Alert) => {
    setAlerts(prev => prev.map(a =>
      a.id === alert.id
        ? { ...a, status: 'acknowledged' as AlertStatus, acknowledgedBy: '张工', acknowledgedAt: new Date().toISOString() }
        : a
    ));
    Taro.showToast({ title: '认领成功', icon: 'success' });
  };

  const openNoteModal = (alert: Alert) => {
    setSelectedAlert(alert);
    setNoteText(alert.note || '');
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (!selectedAlert || !noteText.trim()) return;
    setAlerts(prev => prev.map(a =>
      a.id === selectedAlert.id ? { ...a, note: noteText } : a
    ));
    setShowNoteModal(false);
    Taro.showToast({ title: '备注已保存', icon: 'success' });
  };

  const openSuppressModal = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowSuppressModal(true);
  };

  const handleSuppress = () => {
    if (!selectedAlert) return;
    setAlerts(prev => prev.map(a =>
      a.id === selectedAlert.id
        ? { ...a, status: 'suppressed' as AlertStatus, suppressedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString() }
        : a
    ));
    setShowSuppressModal(false);
    Taro.showToast({ title: '已静音', icon: 'success' });
  };

  const handleEscalate = (alert: Alert) => {
    Taro.showModal({
      title: '确认升级',
      content: `确定要将告警「${alert.title}」升级给值班主管吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已升级通知', icon: 'success' });
        }
      }
    });
  };

  const handleTestNotify = (alert: Alert) => {
    Taro.showModal({
      title: '通知测试',
      content: '测试通知将发送到您的手机和邮箱，确认发送吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '发送中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '测试通知已发送', icon: 'success' });
          }, 1500);
        }
      }
    });
  };

  const handleResolve = (alert: Alert) => {
    Taro.showModal({
      title: '确认恢复',
      content: `确定告警「${alert.title}」已恢复吗？`,
      success: (res) => {
        if (res.confirm) {
          setAlerts(prev => prev.map(a =>
            a.id === alert.id ? { ...a, status: 'resolved' as AlertStatus } : a
          ));
          Taro.showToast({ title: '已标记为恢复', icon: 'success' });
        }
      }
    });
  };

  const goToEvents = (alert: Alert) => {
    Taro.navigateTo({ url: `/pages/events/index?alertId=${alert.id}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.levelFilter}>
        <View className={styles.levelTabs}>
          {levelTabs.map(tab => (
            <View
              key={tab.key}
              className={classNames(
                styles.levelTab,
                activeLevel === tab.key && styles.tabActive,
                activeLevel === tab.key && tab.key !== 'all' && getLevelClass(tab.key, 'text')
              )}
              onClick={() => setActiveLevel(tab.key as AlertLevel | 'all')}
            >
              {tab.label}
            </View>
          ))}
        </View>

        <ScrollView scrollX className={styles.statusTabs}>
          {statusTabs.map(tab => (
            <View
              key={tab.key}
              className={classNames(
                styles.statusTab,
                activeStatus === tab.key && styles.statusTabActive
              )}
              onClick={() => setActiveStatus(tab.key as AlertStatus | 'all')}
            >
              {tab.label}
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView scrollY className={styles.alertList}>
        {filteredAlerts.length === 0 ? (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>🔔</View>
            <View className={styles.emptyText}>暂无相关告警</View>
          </View>
        ) : (
          filteredAlerts.map((alert: Alert) => (
            <View key={alert.id} className={styles.alertCard}>
              <View className={classNames(styles.alertLeftBar, getLevelClass(alert.level, 'bar'))} />

              <View onClick={() => toggleExpand(alert.id)}>
                <View className={styles.alertHeader}>
                  <Text className={styles.alertTitle}>{alert.title}</Text>
                  <View className={classNames(styles.levelBadge, getLevelClass(alert.level, 'badge'))}>
                    {getLevelText(alert.level)}
                  </View>
                </View>

                <View className={styles.alertDesc}>{alert.description}</View>

                <View className={styles.alertMeta}>
                  <View className={styles.metaLeft}>
                    <View className={styles.metaItem}>
                      <Text className={styles.metaIcon}>📍</Text>
                      <Text>{alert.resource}</Text>
                    </View>
                  </View>
                  <View className={classNames(styles.statusTag, getStatusClass(alert.status))}>
                    {getStatusText(alert.status)}
                  </View>
                </View>

                {alert.acknowledgedBy && (
                  <View className={styles.metaItem} style={{ marginTop: 12, fontSize: 24 }}>
                    👤 {alert.acknowledgedBy} · {alert.acknowledgedAt?.slice(11, 16)}
                  </View>
                )}

                {alert.note && expandedId === alert.id && (
                  <View className={styles.noteBox}>
                    <Text className={styles.noteLabel}>📝 备注：</Text>
                    <Text>{alert.note}</Text>
                  </View>
                )}
              </View>

              {expandedId === alert.id && alert.status !== 'resolved' && (
                <View className={styles.actionBar}>
                  {alert.status === 'active' && (
                    <View
                      className={classNames(styles.actionBtn, styles.btnPrimary)}
                      onClick={() => handleAcknowledge(alert)}
                    >
                      ✋ 认领
                    </View>
                  )}
                  <View
                    className={classNames(styles.actionBtn, styles.btnWarning)}
                    onClick={() => openSuppressModal(alert)}
                  >
                    🔇 静音
                  </View>
                  <View
                    className={classNames(styles.actionBtn, styles.btnDanger)}
                    onClick={() => handleEscalate(alert)}
                  >
                    ⬆️ 升级
                  </View>
                  <View
                    className={classNames(styles.actionBtn, styles.btnSuccess)}
                    onClick={() => openNoteModal(alert)}
                  >
                    📝 备注
                  </View>
                </View>
              )}

              {expandedId === alert.id && (
                <View className={styles.actionBar}>
                  <View
                    className={classNames(styles.actionBtn, styles.btnPrimary)}
                    onClick={() => goToEvents(alert)}
                  >
                    📋 事件详情
                  </View>
                  <View
                    className={classNames(styles.actionBtn, styles.btnSuccess)}
                    onClick={() => handleTestNotify(alert)}
                  >
                    📧 通知测试
                  </View>
                  {alert.status !== 'resolved' && (
                    <View
                      className={classNames(styles.actionBtn, styles.btnSuccess)}
                      onClick={() => handleResolve(alert)}
                    >
                      ✅ 恢复
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

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

      {showSuppressModal && (
        <View className={styles.modal} onClick={() => setShowSuppressModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalTitle}>静音时长</View>
            <View className={styles.timeOptions}>
              {suppressOptions.map(option => (
                <View
                  key={option.key}
                  className={classNames(
                    styles.timeOption,
                    selectedSuppressTime === option.key && styles.timeOptionActive
                  )}
                  onClick={() => setSelectedSuppressTime(option.key)}
                >
                  {option.label}
                </View>
              ))}
            </View>
            <View className={styles.modalActions}>
              <View
                className={classNames(styles.modalBtn, styles.modalCancel)}
                onClick={() => setShowSuppressModal(false)}
              >
                取消
              </View>
              <View
                className={classNames(styles.modalBtn, styles.modalConfirm)}
                onClick={handleSuppress}
              >
                确认静音
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AlertsPage;

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useAppStore } from '@/stores/appStore';
import type { HandoverRecord, Alert, InspectionRecord, RiskItem } from '@/types';

const HandoverDetailPage: React.FC = () => {
  const router = useRouter();
  const handoverId = router.params.id || '';
  
  const handoverRecords = useAppStore(state => state.handoverRecords);
  const confirmHandover = useAppStore(state => state.confirmHandover);
  const getAlertById = useAppStore(state => state.getAlertById);

  const record = useMemo(() => 
    handoverRecords.find(r => r.id === handoverId) || null,
    [handoverId, handoverRecords]
  );

  const goBack = () => {
    Taro.navigateBack();
  };

  const goToAlert = (alertId: string) => {
    Taro.navigateTo({ url: `/pages/events/index?alertId=${alertId}` });
  };

  const handleConfirm = () => {
    if (!record) return;
    Taro.showModal({
      title: '确认接班',
      content: '请确认已了解所有交接事项，确认后将完成接班。',
      success: (res) => {
        if (res.confirm) {
          confirmHandover(record.id, '我');
          Taro.showToast({ title: '接班成功', icon: 'success' });
        }
      }
    });
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'critical': return styles.levelCritical;
      case 'major': return styles.levelMajor;
      case 'minor': return styles.levelMinor;
      case 'warning': return styles.levelWarning;
      default: return styles.levelInfo;
    }
  };

  if (!record) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>交接记录不存在</Text>
        </View>
      </View>
    );
  }

  const summary = record.summary;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.backBtn} onClick={goBack}>← 返回</View>
        <Text className={styles.title}>交接详情</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>班次</Text>
            <View className={styles.shiftBadge}>{record.shift}</View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>状态</Text>
            <View
              className={classNames(
                styles.statusBadge,
                record.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
              )}
            >
              {record.status === 'confirmed' ? '已确认' : '待接班'}
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>交班人</Text>
            <Text className={styles.infoValue}>{record.handoverPerson}</Text>
          </View>
          {record.takeoverPerson && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>接班人</Text>
              <Text className={styles.infoValue}>{record.takeoverPerson}</Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>创建时间</Text>
            <Text className={styles.infoValue}>
              {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
            </Text>
          </View>
          {record.confirmedAt && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>确认时间</Text>
              <Text className={styles.infoValue}>
                {dayjs(record.confirmedAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </View>
          )}
        </View>

        {record.note && (
          <View className={styles.noteCard}>
            <Text className={styles.cardTitle}>📝 交接备注</Text>
            <Text className={styles.noteText}>{record.note}</Text>
          </View>
        )}

        <View className={styles.sectionCard}>
          <Text className={styles.cardTitle}>
            🚨 未恢复告警 ({summary.unresolvedAlerts?.length || 0})
          </Text>
          {(!summary.unresolvedAlerts || summary.unresolvedAlerts.length === 0) ? (
            <Text className={styles.emptyHint}>暂无未恢复告警</Text>
          ) : (
            <View className={styles.listContainer}>
              {summary.unresolvedAlerts.map((alert: Alert) => (
                <View
                  key={alert.id}
                  className={styles.alertItem}
                  onClick={() => goToAlert(alert.id)}
                >
                  <View className={classNames(styles.levelBar, getLevelClass(alert.level))} />
                  <View className={styles.alertContent}>
                    <Text className={styles.alertTitle}>{alert.title}</Text>
                    <Text className={styles.alertMeta}>{alert.resource}</Text>
                  </View>
                  <Text className={styles.arrow}>→</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.cardTitle}>
            🔇 已静音告警 ({summary.suppressedAlerts?.length || 0})
          </Text>
          {(!summary.suppressedAlerts || summary.suppressedAlerts.length === 0) ? (
            <Text className={styles.emptyHint}>暂无已静音告警</Text>
          ) : (
            <View className={styles.listContainer}>
              {summary.suppressedAlerts.map((alert: Alert) => (
                <View
                  key={alert.id}
                  className={styles.alertItem}
                  onClick={() => goToAlert(alert.id)}
                >
                  <View className={styles.alertContent}>
                    <Text className={styles.alertTitle}>{alert.title}</Text>
                    <Text className={styles.alertMeta}>
                      静音至 {dayjs(alert.suppressedUntil || '').format('HH:mm')}
                    </Text>
                  </View>
                  <Text className={styles.arrow}>→</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.cardTitle}>
            📋 进行中巡检 ({summary.pendingInspections?.length || 0})
          </Text>
          {(!summary.pendingInspections || summary.pendingInspections.length === 0) ? (
            <Text className={styles.emptyHint}>暂无进行中巡检</Text>
          ) : (
            <View className={styles.listContainer}>
              {summary.pendingInspections.map((record: InspectionRecord) => (
                <View key={record.id} className={styles.inspectionItem}>
                  <Text className={styles.inspectionTitle}>{record.templateName}</Text>
                  <View className={styles.inspectionProgress}>
                    <View className={styles.progressBar}>
                      <View
                        className={styles.progressFill}
                        style={{
                          width: `${(record.itemsPassed / record.itemsTotal) * 100}%`
                        }}
                      />
                    </View>
                    <Text className={styles.progressText}>
                      {record.itemsPassed}/{record.itemsTotal}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.cardTitle}>
            ⚠️ 今日风险 ({summary.todayRisks?.length || 0})
          </Text>
          {(!summary.todayRisks || summary.todayRisks.length === 0) ? (
            <Text className={styles.emptyHint}>暂无今日风险</Text>
          ) : (
            <View className={styles.listContainer}>
              {summary.todayRisks.map((risk: RiskItem) => (
                <View key={risk.id} className={styles.riskItem}>
                  <View className={classNames(styles.riskDot, getLevelClass(risk.level))} />
                  <View className={styles.riskContent}>
                    <Text className={styles.riskTitle}>{risk.title}</Text>
                    <Text className={styles.riskDesc}>{risk.description}</Text>
                  </View>
                  <Text className={styles.riskTime}>{risk.time}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {record.status === 'pending' && (
        <View className={styles.bottomBar}>
          <View className={styles.confirmBtn} onClick={handleConfirm}>
            确认接班
          </View>
        </View>
      )}
    </View>
  );
};

export default HandoverDetailPage;

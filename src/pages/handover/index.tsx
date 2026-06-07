import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useAppStore } from '@/stores/appStore';
import { todayRisks } from '@/data/mockData';
import type { Alert, InspectionRecord, RiskItem, HandoverRecord } from '@/types';

type TabType = 'current' | 'history';

const HandoverPage: React.FC = () => {
  const handoverRecords = useAppStore(state => state.handoverRecords);
  const addHandoverRecord = useAppStore(state => state.addHandoverRecord);
  const confirmHandover = useAppStore(state => state.confirmHandover);
  const generateHandoverSummary = useAppStore(state => state.generateHandoverSummary);

  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [handoverNote, setHandoverNote] = useState('');
  const [selectedShift, setSelectedShift] = useState('白班');

  const shiftOptions = ['白班', '夜班', '大夜班'];

  const summary = useMemo(() => {
    return generateHandoverSummary();
  }, [generateHandoverSummary]);

  const handleCreateHandover = () => {
    setShowCreateModal(true);
    setHandoverNote('');
  };

  const handleConfirmCreate = () => {
    const newRecord: HandoverRecord = {
      id: `h${Date.now()}`,
      shift: selectedShift,
      handoverPerson: '我',
      status: 'pending',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      note: handoverNote,
      summary
    };
    addHandoverRecord(newRecord);
    setShowCreateModal(false);
    Taro.showToast({ title: '交接记录已创建', icon: 'success' });
  };

  const handleConfirmHandover = (record: HandoverRecord) => {
    Taro.showModal({
      title: '确认接班',
      content: `确定接下 ${record.shift} 的班吗？请确认已了解所有交接事项。`,
      success: (res) => {
        if (res.confirm) {
          confirmHandover(record.id, '我');
          Taro.showToast({ title: '接班成功', icon: 'success' });
        }
      }
    });
  };

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/handover-detail/index?id=${id}` });
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  const pendingRecord = handoverRecords.find(r => r.status === 'pending');

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.backBtn} onClick={goBack}>← 返回</View>
        <Text className={styles.title}>值班交接</Text>
        <View style={{ width: 80 }} />
      </View>

      <View className={styles.tabBar}>
        <View className={styles.tabs}>
          <View
            className={classNames(styles.tab, activeTab === 'current' && styles.tabActive)}
            onClick={() => setActiveTab('current')}
          >
            当前交接
          </View>
          <View
            className={classNames(styles.tab, activeTab === 'history' && styles.tabActive)}
            onClick={() => setActiveTab('history')}
          >
            历史记录
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {activeTab === 'current' ? (
          <View>
            <View className={styles.summaryCard}>
              <View className={styles.cardTitle}>
                <Text>📊 交接汇总</Text>
              </View>

              <View className={styles.summaryRow}>
                <View className={styles.summaryItem}>
                  <Text className={styles.summaryNum} style={{ color: '#f53f3f' }}>
                    {summary.unresolvedAlerts.length}
                  </Text>
                  <Text className={styles.summaryLabel}>未恢复告警</Text>
                </View>
                <View className={styles.summaryItem}>
                  <Text className={styles.summaryNum} style={{ color: '#ff7d00' }}>
                    {summary.inProgressEvents.length}
                  </Text>
                  <Text className={styles.summaryLabel}>进行中事件</Text>
                </View>
                <View className={styles.summaryItem}>
                  <Text className={styles.summaryNum} style={{ color: '#ffc300' }}>
                    {summary.suppressedAlerts.length}
                  </Text>
                  <Text className={styles.summaryLabel}>已静音告警</Text>
                </View>
                <View className={styles.summaryItem}>
                  <Text className={styles.summaryNum} style={{ color: '#165dff' }}>
                    {summary.pendingInspections.length}
                  </Text>
                  <Text className={styles.summaryLabel}>进行中巡检</Text>
                </View>
              </View>
            </View>

            {summary.unresolvedAlerts.length > 0 && (
              <View className={styles.sectionCard}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>🚨 未恢复告警</Text>
                  <Text className={styles.sectionCount}>{summary.unresolvedAlerts.length} 条</Text>
                </View>
                <View className={styles.itemList}>
                  {summary.unresolvedAlerts.slice(0, 3).map((alert: Alert) => (
                    <View key={alert.id} className={styles.itemRow}>
                      <View className={classNames(styles.levelDot, styles[`levelDot_${alert.level}`])} />
                      <Text className={styles.itemTitle}>{alert.title}</Text>
                      <Text className={styles.itemMeta}>{alert.resource}</Text>
                    </View>
                  ))}
                  {summary.unresolvedAlerts.length > 3 && (
                    <Text className={styles.moreHint}>还有 {summary.unresolvedAlerts.length - 3} 条...</Text>
                  )}
                </View>
              </View>
            )}

            {summary.inProgressEvents.length > 0 && (
              <View className={styles.sectionCard}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>⚡ 进行中事件</Text>
                  <Text className={styles.sectionCount}>{summary.inProgressEvents.length} 件</Text>
                </View>
                <View className={styles.eventList}>
                  {summary.inProgressEvents.slice(0, 3).map(event => {
                    const alert = summary.unresolvedAlerts.find(a => a.id === event.alertId);
                    const lastAction = alert?.actionHistory?.[0];
                    const statusText = alert?.status === 'acknowledged' ? '处理中' : '待认领';
                    return (
                      <View key={event.id} className={styles.eventRow}>
                        <View className={styles.eventMain}>
                          <Text className={styles.eventTitle}>{event.title}</Text>
                          <View className={styles.eventMetaRow}>
                            <View className={classNames(
                              styles.statusTag,
                              alert?.status === 'acknowledged' ? styles.statusTagProcessing : styles.statusTagPending
                            )}>
                              {statusText}
                            </View>
                            {lastAction && (
                              <Text className={styles.eventAction}>
                                最后动作：{lastAction.title}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Text className={styles.eventTime}>
                          {lastAction ? dayjs(lastAction.timestamp).format('HH:mm') : dayjs(event.timestamp).format('HH:mm')}
                        </Text>
                      </View>
                    );
                  })}
                  {summary.inProgressEvents.length > 3 && (
                    <Text className={styles.moreHint}>还有 {summary.inProgressEvents.length - 3} 件...</Text>
                  )}
                </View>
              </View>
            )}

            {summary.suppressedAlerts.length > 0 && (
              <View className={styles.sectionCard}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>🔇 已静音告警</Text>
                  <Text className={styles.sectionCount}>{summary.suppressedAlerts.length} 条</Text>
                </View>
                <View className={styles.itemList}>
                  {summary.suppressedAlerts.map((alert: Alert) => (
                    <View key={alert.id} className={styles.itemRow}>
                      <Text className={styles.itemTitle}>{alert.title}</Text>
                      <Text className={styles.itemMeta}>
                        静音至 {dayjs(alert.suppressedUntil || '').format('HH:mm')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {summary.pendingInspections.length > 0 && (
              <View className={styles.sectionCard}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>📋 进行中巡检</Text>
                  <Text className={styles.sectionCount}>{summary.pendingInspections.length} 项</Text>
                </View>
                <View className={styles.itemList}>
                  {summary.pendingInspections.map((record: InspectionRecord) => (
                    <View key={record.id} className={styles.itemRow}>
                      <Text className={styles.itemTitle}>{record.templateName}</Text>
                      <Text className={styles.itemMeta}>
                        {record.itemsPassed}/{record.itemsTotal} 项
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {summary.todayRisks.length > 0 && (
              <View className={styles.sectionCard}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>⚠️ 今日风险</Text>
                  <Text className={styles.sectionCount}>{summary.todayRisks.length} 项</Text>
                </View>
                <View className={styles.itemList}>
                  {summary.todayRisks.map((risk: RiskItem) => (
                    <View key={risk.id} className={styles.itemRow}>
                      <Text className={styles.itemTitle}>{risk.title}</Text>
                      <Text className={styles.itemMeta}>{risk.time}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!pendingRecord && (
              <View className={styles.createBtn} onClick={handleCreateHandover}>
                ✏️ 创建交接记录
              </View>
            )}

            {pendingRecord && (
              <View className={styles.pendingCard}>
                <View className={styles.pendingHeader}>
                  <Text className={styles.pendingTitle}>⏳ 待接班</Text>
                  <View className={styles.pendingBadge}>{pendingRecord.shift}</View>
                </View>
                <View className={styles.pendingInfo}>
                  <Text className={styles.pendingLabel}>交班人：</Text>
                  <Text className={styles.pendingValue}>{pendingRecord.handoverPerson}</Text>
                </View>
                <View className={styles.pendingInfo}>
                  <Text className={styles.pendingLabel}>创建时间：</Text>
                  <Text className={styles.pendingValue}>{dayjs(pendingRecord.createdAt).format('MM-DD HH:mm')}</Text>
                </View>
                {pendingRecord.note && (
                  <View className={styles.pendingNote}>
                    <Text className={styles.pendingLabel}>交接备注：</Text>
                    <Text className={styles.pendingNoteText}>{pendingRecord.note}</Text>
                  </View>
                )}
                <View className={styles.pendingActions}>
                  <View
                    className={classNames(styles.actionBtn, styles.btnSecondary)}
                    onClick={() => goToDetail(pendingRecord.id)}
                  >
                    查看详情
                  </View>
                  <View
                    className={classNames(styles.actionBtn, styles.btnPrimary)}
                    onClick={() => handleConfirmHandover(pendingRecord)}
                  >
                    确认接班
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.historyList}>
            {handoverRecords.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📝</Text>
                <Text className={styles.emptyText}>暂无交接记录</Text>
              </View>
            ) : (
              handoverRecords.map((record: HandoverRecord) => (
                <View
                  key={record.id}
                  className={styles.historyCard}
                  onClick={() => goToDetail(record.id)}
                >
                  <View className={styles.historyHeader}>
                    <View className={styles.historyShift}>{record.shift}</View>
                    <View
                      className={classNames(
                        styles.historyStatus,
                        record.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
                      )}
                    >
                      {record.status === 'confirmed' ? '已确认' : '待接班'}
                    </View>
                  </View>
                  <View className={styles.historyInfo}>
                    <Text className={styles.historyLabel}>交班：{record.handoverPerson}</Text>
                    {record.takeoverPerson && (
                      <Text className={styles.historyLabel}>接班：{record.takeoverPerson}</Text>
                    )}
                  </View>
                  <Text className={styles.historyTime}>
                    {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {showCreateModal && (
        <View className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalTitle}>创建交接记录</View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>班次</Text>
              <View className={styles.shiftOptions}>
                {shiftOptions.map(shift => (
                  <View
                    key={shift}
                    className={classNames(
                      styles.shiftOption,
                      selectedShift === shift && styles.shiftOptionActive
                    )}
                    onClick={() => setSelectedShift(shift)}
                  >
                    {shift}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>交接备注</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入交接备注，如特殊注意事项、待处理事项等..."
                value={handoverNote}
                onInput={(e) => setHandoverNote(e.detail.value)}
                maxlength={500}
              />
            </View>

            <View className={styles.modalActions}>
              <View
                className={classNames(styles.modalBtn, styles.modalCancel)}
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </View>
              <View
                className={classNames(styles.modalBtn, styles.modalConfirm)}
                onClick={handleConfirmCreate}
              >
                创建
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default HandoverPage;

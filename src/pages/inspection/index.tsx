import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { inspectionTemplates, inspectionRecords as initialRecords } from '@/data/mockData';
import type { InspectionTemplate, InspectionRecord, InspectionStatus } from '@/types';

type TabType = 'templates' | 'records';

const InspectionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [records, setRecords] = useState<InspectionRecord[]>(initialRecords);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);

  const getStatusClass = (status: InspectionStatus) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'in_progress':
        return styles.statusInProgress;
      case 'failed':
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: InspectionStatus) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'failed':
        return '未通过';
      default:
        return '待开始';
    }
  };

  const handleStartInspection = (template: InspectionTemplate) => {
    setSelectedTemplate(template);
    setShowStartModal(true);
  };

  const confirmStartInspection = () => {
    if (!selectedTemplate) return;

    const newRecord: InspectionRecord = {
      id: `r${Date.now()}`,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      status: 'in_progress',
      operator: '张工',
      startTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      itemsPassed: 0,
      itemsTotal: selectedTemplate.itemCount
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowStartModal(false);
    setActiveTab('records');
    Taro.showToast({ title: '巡检已开始', icon: 'success' });
  };

  const handleViewDetail = (record: InspectionRecord) => {
    Taro.showToast({ title: `查看 ${record.templateName} 详情`, icon: 'none' });
  };

  const handleUploadImage = (record: InspectionRecord) => {
    Taro.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('[Inspection] 选择图片:', res.tempFilePaths.length, '张');
        Taro.showToast({ title: '上传成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Inspection] 选择图片失败:', err);
      }
    });
  };

  const handleCheckIn = (record: InspectionRecord) => {
    Taro.showModal({
      title: '确认打卡',
      content: '确定完成当前巡检项目的打卡吗？',
      success: (res) => {
        if (res.confirm) {
          setRecords(prev => prev.map(r =>
            r.id === record.id
              ? {
                  ...r,
                  itemsPassed: Math.min(r.itemsPassed + 1, r.itemsTotal),
                  status: r.itemsPassed + 1 >= r.itemsTotal ? 'completed' : r.status,
                  endTime: r.itemsPassed + 1 >= r.itemsTotal
                    ? new Date().toISOString().slice(0, 19).replace('T', ' ')
                    : r.endTime
                }
              : r
          ));
          Taro.showToast({ title: '打卡成功', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabBar}>
        <View className={styles.tabs}>
          <View
            className={classNames(styles.tab, activeTab === 'templates' && styles.tabActive)}
            onClick={() => setActiveTab('templates')}
          >
            巡检模板
          </View>
          <View
            className={classNames(styles.tab, activeTab === 'records' && styles.tabActive)}
            onClick={() => setActiveTab('records')}
          >
            巡检记录
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {activeTab === 'templates' ? (
          <View>
            {inspectionTemplates.map((template: InspectionTemplate) => (
              <View key={template.id} className={styles.templateCard}>
                <View className={styles.templateHeader}>
                  <Text className={styles.templateName}>{template.name}</Text>
                  <View className={styles.frequencyBadge}>{template.frequency}</View>
                </View>
                <View className={styles.templateDesc}>{template.description}</View>
                <View className={styles.templateFooter}>
                  <View className={styles.itemCount}>
                    共 <Text className={styles.itemCountNum}>{template.itemCount}</Text> 个检查项
                  </View>
                  <View
                    className={styles.startBtn}
                    onClick={() => handleStartInspection(template)}
                  >
                    开始巡检
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View>
            {records.length === 0 ? (
              <View className={styles.emptyState}>
                <View className={styles.emptyIcon}>📋</View>
                <View className={styles.emptyText}>暂无巡检记录</View>
              </View>
            ) : (
              records.map((record: InspectionRecord) => (
                <View key={record.id} className={styles.recordCard}>
                  <View className={styles.recordHeader}>
                    <Text className={styles.recordTitle}>{record.templateName}</Text>
                    <View className={classNames(styles.statusBadge, getStatusClass(record.status))}>
                      {getStatusText(record.status)}
                    </View>
                  </View>

                  <View className={styles.recordInfo}>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>巡检人员</Text>
                      <Text className={styles.infoValue}>{record.operator}</Text>
                    </View>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>开始时间</Text>
                      <Text className={styles.infoValue}>{record.startTime}</Text>
                    </View>
                    {record.endTime && (
                      <View className={styles.infoRow}>
                        <Text className={styles.infoLabel}>结束时间</Text>
                        <Text className={styles.infoValue}>{record.endTime}</Text>
                      </View>
                    )}
                  </View>

                  <View>
                    <View className={styles.progressBar}>
                      <View
                        className={styles.progressFill}
                        style={{
                          width: `${(record.itemsPassed / record.itemsTotal) * 100}%`,
                          background: record.status === 'failed' ? '#f53f3f' : '#165dff'
                        }}
                      />
                    </View>
                    <View className={styles.progressText}>
                      {record.itemsPassed} / {record.itemsTotal} 项通过
                    </View>
                  </View>

                  <View className={styles.recordActions}>
                    {record.status === 'in_progress' && (
                      <>
                        <View
                          className={classNames(styles.actionBtn, styles.btnPrimary)}
                          onClick={() => handleCheckIn(record)}
                        >
                          ✅ 打卡
                        </View>
                        <View
                          className={classNames(styles.actionBtn, styles.btnSecondary)}
                          onClick={() => handleUploadImage(record)}
                        >
                          📷 上传截图
                        </View>
                      </>
                    )}
                    <View
                      className={classNames(
                        styles.actionBtn,
                        record.status === 'in_progress' ? styles.btnSecondary : styles.btnPrimary
                      )}
                      onClick={() => handleViewDetail(record)}
                    >
                      查看详情
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {showStartModal && selectedTemplate && (
        <View className={styles.modal} onClick={() => setShowStartModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalTitle}>开始巡检</View>
            <View className={styles.modalInfo}>
              确定开始「{selectedTemplate.name}」巡检？
              {"\n"}
              共 {selectedTemplate.itemCount} 个检查项
            </View>
            <View className={styles.modalActions}>
              <View
                className={classNames(styles.modalBtn, styles.modalCancel)}
                onClick={() => setShowStartModal(false)}
              >
                取消
              </View>
              <View
                className={classNames(styles.modalBtn, styles.modalConfirm)}
                onClick={confirmStartInspection}
              >
                开始巡检
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default InspectionPage;

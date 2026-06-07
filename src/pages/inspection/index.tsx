import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classNames from 'classnames';
import { inspectionTemplates, inspectionRecords as initialRecords } from '@/data/mockData';
import type { InspectionTemplate, InspectionRecord, InspectionStatus, CheckedItem, ScreenshotItem, InspectionItem } from '@/types';

type TabType = 'templates' | 'records';

const demoImages = [
  'https://picsum.photos/id/1/400/300',
  'https://picsum.photos/id/2/400/300',
  'https://picsum.photos/id/3/400/300',
  'https://picsum.photos/id/4/400/300',
  'https://picsum.photos/id/5/400/300',
  'https://picsum.photos/id/6/400/300'
];

const InspectionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [records, setRecords] = useState<InspectionRecord[]>(initialRecords);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const formatTime = (timeStr: string) => {
    return dayjs(timeStr).format('HH:mm');
  };

  const formatDateTime = (timeStr: string) => {
    return dayjs(timeStr).format('MM-DD HH:mm');
  };

  const handleStartInspection = (template: InspectionTemplate) => {
    setSelectedTemplate(template);
    setShowStartModal(true);
  };

  const confirmStartInspection = () => {
    if (!selectedTemplate) return;

    const checkItems: CheckedItem[] = selectedTemplate.items.map((item: InspectionItem) => ({
      itemId: item.id,
      itemName: item.name,
      checked: false,
      passed: false,
      remark: ''
    }));

    const newRecord: InspectionRecord = {
      id: `r${Date.now()}`,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      status: 'in_progress',
      operator: '我',
      startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      itemsPassed: 0,
      itemsTotal: selectedTemplate.itemCount,
      checkItems,
      screenshots: []
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowStartModal(false);
    setActiveTab('records');
    Taro.showToast({ title: '巡检已开始', icon: 'success' });
  };

  const toggleExpand = (recordId: string) => {
    setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
  };

  const handleCheckIn = (record: InspectionRecord) => {
    const currentIndex = record.checkItems.findIndex(item => !item.checked);
    if (currentIndex === -1) {
      Taro.showToast({ title: '所有项已打卡完成', icon: 'none' });
      return;
    }

    const currentItem = record.checkItems[currentIndex];
    
    Taro.showModal({
      title: '确认打卡',
      content: `确定完成「${currentItem.itemName}」的检查吗？`,
      success: (res) => {
        if (res.confirm) {
          setRecords(prev => prev.map(r => {
            if (r.id !== record.id) return r;
            
            const newCheckItems = [...r.checkItems];
            newCheckItems[currentIndex] = {
              ...newCheckItems[currentIndex],
              checked: true,
              passed: true,
              checkedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              remark: '检查正常'
            };
            
            const passedCount = newCheckItems.filter(item => item.checked && item.passed).length;
            const allChecked = newCheckItems.every(item => item.checked);
            
            return {
              ...r,
              checkItems: newCheckItems,
              itemsPassed: passedCount,
              status: allChecked ? 'completed' : r.status,
              endTime: allChecked ? dayjs().format('YYYY-MM-DD HH:mm:ss') : r.endTime
            };
          }));
          
          Taro.showToast({ title: '打卡成功', icon: 'success' });
        }
      }
    });
  };

  const handleUploadImage = (record: InspectionRecord) => {
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
    const currentItemIndex = record.checkItems.findIndex(item => !item.checked);
    const currentItem = currentItemIndex >= 0 ? record.checkItems[currentItemIndex] : null;
    
    const newScreenshot: ScreenshotItem = {
      id: `s${Date.now()}`,
      url: randomImage,
      name: `截图_${dayjs().format('HHmmss')}.jpg`,
      uploadAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      itemId: currentItem?.itemId
    };

    setRecords(prev => prev.map(r => {
      if (r.id !== record.id) return r;
      return {
        ...r,
        screenshots: [...r.screenshots, newScreenshot]
      };
    }));

    Taro.showToast({ title: '上传成功', icon: 'success' });
  };

  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
  };

  const renderCheckItems = (record: InspectionRecord) => {
    return (
      <View className={styles.checkItemList}>
        <View className={styles.sectionSubtitle}>
          <Text>📋 检查项</Text>
          <Text className={styles.itemCountText}>{record.itemsPassed}/{record.itemsTotal}</Text>
        </View>
        {record.checkItems.map((item, index) => (
          <View key={item.itemId} className={classNames(styles.checkItem, item.checked && styles.checkItemDone)}>
            <View className={classNames(styles.checkDot, item.checked && styles.checkDotDone)}>
              {item.checked ? '✓' : index + 1}
            </View>
            <View className={styles.checkItemContent}>
              <Text className={styles.checkItemName}>{item.itemName}</Text>
              {item.checked && item.checkedAt && (
                <Text className={styles.checkItemTime}>
                  {formatTime(item.checkedAt)} · {item.remark || '检查正常'}
                </Text>
              )}
              {!item.checked && (
                <Text className={styles.checkItemPending}>待检查</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderScreenshots = (record: InspectionRecord) => {
    if (record.screenshots.length === 0) return null;
    
    return (
      <View className={styles.screenshotSection}>
        <View className={styles.sectionSubtitle}>
          <Text>📷 截图记录</Text>
          <Text className={styles.itemCountText}>共 {record.screenshots.length} 张</Text>
        </View>
        <View className={styles.screenshotGrid}>
          {record.screenshots.map((screenshot: ScreenshotItem) => (
            <View
              key={screenshot.id}
              className={styles.screenshotItem}
              onClick={() => handlePreviewImage(screenshot.url)}
            >
              <Image
                src={screenshot.url}
                mode="aspectFill"
                className={styles.screenshotImg}
              />
              <Text className={styles.screenshotName}>{screenshot.name}</Text>
              <Text className={styles.screenshotTime}>{formatTime(screenshot.uploadAt)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
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
                  <View onClick={() => toggleExpand(record.id)}>
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
                        <Text className={styles.infoValue}>{formatDateTime(record.startTime)}</Text>
                      </View>
                      {record.endTime && (
                        <View className={styles.infoRow}>
                          <Text className={styles.infoLabel}>结束时间</Text>
                          <Text className={styles.infoValue}>{formatDateTime(record.endTime)}</Text>
                        </View>
                      )}
                    </View>

                    <View>
                      <View className={styles.progressBar}>
                        <View
                          className={classNames(
                            styles.progressFill,
                            record.status === 'failed' && styles.progressFailed
                          )}
                          style={{
                            width: `${(record.itemsPassed / record.itemsTotal) * 100}%`
                          }}
                        />
                      </View>
                      <View className={styles.progressText}>
                        {record.itemsPassed} / {record.itemsTotal} 项通过
                      </View>
                    </View>
                  </View>

                  {expandedRecordId === record.id && (
                    <View className={styles.recordDetail}>
                      {renderCheckItems(record)}
                      {renderScreenshots(record)}
                    </View>
                  )}

                  <View className={styles.expandHint} onClick={() => toggleExpand(record.id)}>
                    {expandedRecordId === record.id ? '▲ 收起详情' : '▼ 展开查看详情'}
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

      {previewImage && (
        <View className={styles.previewModal} onClick={() => setPreviewImage(null)}>
          <Image
            src={previewImage}
            mode="aspectFit"
            className={styles.previewImage}
          />
          <View className={styles.previewClose} onClick={() => setPreviewImage(null)}>
            ✕
          </View>
        </View>
      )}
    </View>
  );
};

export default InspectionPage;

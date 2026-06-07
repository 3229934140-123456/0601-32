import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classNames from 'classnames';
import { inspectionTemplates } from '@/data/mockData';
import { useAppStore } from '@/stores/appStore';
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
  const inspectionRecords = useAppStore(state => state.inspectionRecords);
  const addInspectionRecord = useAppStore(state => state.addInspectionRecord);
  const updateInspectionRecord = useAppStore(state => state.updateInspectionRecord);
  const generateInspectionReport = useAppStore(state => state.generateInspectionReport);
  const createAlertFromInspection = useAppStore(state => state.createAlertFromInspection);

  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAbnormalModal, setShowAbnormalModal] = useState(false);
  const [selectedAbnormalItem, setSelectedAbnormalItem] = useState<{ record: InspectionRecord; item: CheckedItem } | null>(null);

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
      screenshots: [],
      relatedAlertIds: [],
      relatedEventIds: []
    };

    addInspectionRecord(newRecord);
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
          const newCheckItems = [...record.checkItems];
          newCheckItems[currentIndex] = {
            ...newCheckItems[currentIndex],
            checked: true,
            passed: true,
            checkedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            remark: '检查正常'
          };
          
          const passedCount = newCheckItems.filter(item => item.checked && item.passed).length;
          const allChecked = newCheckItems.every(item => item.checked);
          
          updateInspectionRecord(record.id, {
            checkItems: newCheckItems,
            itemsPassed: passedCount,
            status: allChecked ? 'completed' : record.status,
            endTime: allChecked ? dayjs().format('YYYY-MM-DD HH:mm:ss') : record.endTime
          });

          if (allChecked) {
            setTimeout(() => {
              generateInspectionReport(record.id);
            }, 100);
          }
          
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

    updateInspectionRecord(record.id, {
      screenshots: [...(record.screenshots || []), newScreenshot]
    });

    Taro.showToast({ title: '上传成功', icon: 'success' });
  };

  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
  };

  const handleConvertToAlert = (record: InspectionRecord, item: CheckedItem) => {
    Taro.showModal({
      title: '转告警',
      content: `确定将「${item.itemName}」的异常转为告警吗？`,
      success: (res) => {
        if (res.confirm) {
          const alertId = createAlertFromInspection(
            record.id,
            `巡检异常：${item.itemName}`,
            item.remark || `巡检「${record.templateName}」中发现异常：${item.itemName}`,
            'warning'
          );
          Taro.showToast({ title: '已转为告警', icon: 'success' });
          Taro.navigateTo({ url: `/pages/events/index?alertId=${alertId}` });
        }
      }
    });
  };

  const handleConvertToEvent = (record: InspectionRecord, item: CheckedItem) => {
    Taro.showModal({
      title: '转事件',
      content: `确定将「${item.itemName}」的异常转为事件吗？`,
      success: (res) => {
        if (res.confirm) {
          const alertId = createAlertFromInspection(
            record.id,
            `巡检事件：${item.itemName}`,
            item.remark || `巡检「${record.templateName}」中发现异常事件：${item.itemName}`,
            'minor'
          );
          Taro.showToast({ title: '已转为事件', icon: 'success' });
          Taro.navigateTo({ url: `/pages/events/index?alertId=${alertId}` });
        }
      }
    });
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
    if (!record.screenshots || record.screenshots.length === 0) return null;
    
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

  const renderReport = (record: InspectionRecord) => {
    if (!record.report) return null;
    const report = record.report;
    const abnormalScreenshots = record.screenshots?.slice(0, 3) || [];

    return (
      <View className={styles.reportSection}>
        <View className={styles.sectionSubtitle}>
          <Text>📊 巡检报告</Text>
          <Text className={styles.reportTime}>生成于 {formatTime(report.generatedAt)}</Text>
        </View>

        <View className={styles.reportStats}>
          <View className={styles.reportStatItem}>
            <Text className={styles.reportStatNum} style={{ color: '#00b42a' }}>{report.passedItems}</Text>
            <Text className={styles.reportStatLabel}>通过项</Text>
          </View>
          <View className={styles.reportStatItem}>
            <Text className={styles.reportStatNum} style={{ color: '#f53f3f' }}>{report.failedItems}</Text>
            <Text className={styles.reportStatLabel}>异常项</Text>
          </View>
          <View className={styles.reportStatItem}>
            <Text className={styles.reportStatNum} style={{ color: '#165dff' }}>{report.screenshotCount}</Text>
            <Text className={styles.reportStatLabel}>截图数</Text>
          </View>
        </View>

        {report.abnormalItems.length > 0 && (
          <View className={styles.abnormalSection}>
            <Text className={styles.sectionSubtitleText}>🔴 异常项</Text>
            {report.abnormalItems.map((item, idx) => (
              <View key={`${item.itemId}-${idx}`} className={styles.abnormalItem}>
                <View className={styles.abnormalInfo}>
                  <Text className={styles.abnormalName}>{item.itemName}</Text>
                  <Text className={styles.abnormalDesc}>{item.remark || '检查未通过'}</Text>
                </View>
                <View className={styles.abnormalActions}>
                  <View
                    className={classNames(styles.abnormalBtn, styles.btnAlert)}
                    onClick={() => handleConvertToAlert(record, item)}
                  >
                    转告警
                  </View>
                  <View
                    className={classNames(styles.abnormalBtn, styles.btnEvent)}
                    onClick={() => handleConvertToEvent(record, item)}
                  >
                    转事件
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {abnormalScreenshots.length > 0 && (
          <View className={styles.reportScreenshotSection}>
            <Text className={styles.sectionSubtitleText}>📷 异常截图</Text>
            <View className={styles.screenshotGrid}>
              {abnormalScreenshots.map(screenshot => (
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
                </View>
              ))}
            </View>
          </View>
        )}

        {report.suggestions.length > 0 && (
          <View className={styles.suggestionSection}>
            <Text className={styles.sectionSubtitleText}>💡 处理建议</Text>
            {report.suggestions.map((sug, idx) => (
              <View key={idx} className={styles.suggestionItem}>
                <Text className={styles.suggestionDot}>•</Text>
                <Text className={styles.suggestionText}>{sug}</Text>
              </View>
            ))}
          </View>
        )}
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
            {inspectionRecords.length === 0 ? (
              <View className={styles.emptyState}>
                <View className={styles.emptyIcon}>📋</View>
                <View className={styles.emptyText}>暂无巡检记录</View>
              </View>
            ) : (
              inspectionRecords.map((record: InspectionRecord) => (
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
                      {(record.status === 'completed' || record.status === 'failed') && record.report
                        ? (
                          <>
                            {renderReport(record)}
                            {renderScreenshots(record)}
                          </>
                        ) : (
                          <>
                            {renderCheckItems(record)}
                            {renderScreenshots(record)}
                          </>
                        )}
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

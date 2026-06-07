import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { overviewStats, keyMetrics, topologyNodes, todayRisks } from '@/data/mockData';
import type { KeyMetric, RiskItem, TopologyNode } from '@/types';
import dayjs from 'dayjs';

const OverviewPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm'));
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm'));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const onPullDownRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1500);
  };

  useEffect(() => {
    Taro.eventCenter.on('pulldownrefresh', onPullDownRefresh);
    return () => {
      Taro.eventCenter.off('pulldownrefresh', onPullDownRefresh);
    };
  }, []);

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'up':
        return styles.trendUp;
      case 'down':
        return styles.trendDown;
      default:
        return styles.trendStable;
    }
  };

  const getTrendText = (trend: string, value: string) => {
    switch (trend) {
      case 'up':
        return `↑ ${value}`;
      case 'down':
        return `↓ ${value}`;
      default:
        return `→ ${value}`;
    }
  };

  const getBarClass = (status: string) => {
    switch (status) {
      case 'warning':
        return styles.barWarning;
      case 'error':
        return styles.barError;
      default:
        return styles.barNormal;
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

  const getNodeStatusClass = (status: string) => {
    switch (status) {
      case 'running':
        return styles.nodeRunning;
      case 'warning':
        return styles.nodeWarning;
      case 'error':
        return styles.nodeError;
      default:
        return '';
    }
  };

  const nodePositions = [
    { top: '10%', left: '50%', transform: 'translateX(-50%)' },
    { top: '35%', left: '15%' },
    { top: '35%', right: '15%' },
    { bottom: '15%', left: '25%' },
    { bottom: '15%', right: '25%' }
  ];

  const goToSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' });
  };

  const goToAlerts = () => {
    Taro.switchTab({ url: '/pages/alerts/index' });
  };

  const goToEvents = () => {
    Taro.navigateTo({ url: '/pages/events/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <View className={styles.greeting}>张工，您好</View>
            <View className={styles.time}>{currentTime}</View>
          </View>
          <View className={styles.settingBtn} onClick={goToSettings}>
            ⚙
          </View>
        </View>

        <View className={styles.healthSection}>
          <View className={styles.healthLabel}>服务健康度</View>
          <View className={styles.healthValue}>
            {overviewStats.serviceHealth}
            <Text className={styles.healthUnit}>%</Text>
          </View>
          <View className={styles.healthDesc}>整体运行状态良好</View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{overviewStats.totalResources}</View>
            <View className={styles.statLabel}>资源总数</View>
          </View>
          <View className={styles.statItem} onClick={goToAlerts}>
            <View className={styles.statValue}>{overviewStats.activeAlerts}</View>
            <View className={styles.statLabel}>活跃告警</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statValue}>{overviewStats.todayRisks}</View>
            <View className={styles.statLabel}>今日风险</View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>关键指标</Text>
          </View>
          <View className={styles.metricGrid}>
            {keyMetrics.map((metric: KeyMetric) => (
              <View key={metric.id} className={styles.metricCard}>
                <View className={styles.metricHeader}>
                  <Text className={styles.metricName}>{metric.name}</Text>
                  <View className={classNames(styles.metricTrend, getTrendClass(metric.trend))}>
                    {getTrendText(metric.trend, metric.trendValue)}
                  </View>
                </View>
                <View className={styles.metricValue}>
                  {metric.value}
                  <Text className={styles.metricUnit}> {metric.unit}</Text>
                </View>
                <View className={styles.metricBar}>
                  <View
                    className={classNames(styles.metricBarFill, getBarClass(metric.status))}
                    style={{ width: `${Math.min(parseFloat(metric.value), 100)}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>拓扑状态</Text>
            <Text className={styles.sectionMore}>查看详情 →</Text>
          </View>
          <View className={styles.card}>
            <View className={styles.topologyWrap}>
              <View className={styles.topologyCenter}>核心</View>
              <View className={styles.topologyNodes}>
                {topologyNodes.map((node: TopologyNode, index: number) => (
                  <View
                    key={node.id}
                    className={styles.topologyNode}
                    style={nodePositions[index] || {}}
                  >
                    <View className={classNames(styles.nodeStatus, getNodeStatusClass(node.status))} />
                    <Text>{node.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日风险</Text>
            <Text className={styles.sectionMore} onClick={goToEvents}>全部 →</Text>
          </View>
          <View className={styles.card}>
            <View className={styles.riskList}>
              {todayRisks.map((risk: RiskItem) => (
                <View key={risk.id} className={styles.riskItem}>
                  <View className={classNames(styles.riskLevel, getLevelClass(risk.level))} />
                  <View className={styles.riskContent}>
                    <View className={styles.riskTitle}>{risk.title}</View>
                    <View className={styles.riskDesc}>{risk.description}</View>
                  </View>
                  <Text className={styles.riskTime}>{risk.time}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>快捷操作</Text>
          </View>
          <View className={styles.card}>
            <View className={styles.quickActions}>
              <View className={styles.actionItem} onClick={goToAlerts}>
                <View className={styles.actionIcon} style={{ background: 'rgba(245, 63, 63, 0.1)' }}>
                  🔔
                </View>
                <Text className={styles.actionLabel}>告警处理</Text>
              </View>
              <View className={styles.actionItem} onClick={() => Taro.switchTab({ url: '/pages/inspection/index' })}>
                <View className={styles.actionIcon} style={{ background: 'rgba(0, 180, 42, 0.1)' }}>
                  ✅
                </View>
                <Text className={styles.actionLabel}>巡检打卡</Text>
              </View>
              <View className={styles.actionItem} onClick={goToEvents}>
                <View className={styles.actionIcon} style={{ background: 'rgba(22, 93, 255, 0.1)' }}>
                  📋
                </View>
                <Text className={styles.actionLabel}>事件记录</Text>
              </View>
              <View className={styles.actionItem} onClick={() => Taro.switchTab({ url: '/pages/reports/index' })}>
                <View className={styles.actionIcon} style={{ background: 'rgba(114, 46, 209, 0.1)' }}>
                  📊
                </View>
                <Text className={styles.actionLabel}>数据报表</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OverviewPage;

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import classNames from 'classnames';
import {
  availabilityMetrics,
  alertLevelDistribution,
  reportDataByPeriod
} from '@/data/mockData';
import type { ChartDataPoint, ReportMetric, DutyRecord } from '@/types';

const timeTabs = [
  { key: 'day', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' }
];

const levelColors = ['#f53f3f', '#ff7d00', '#ffc300', '#ff9a2e', '#722ed1'];

type PeriodKey = 'day' | 'week' | 'month';

const ReportsPage: React.FC = () => {
  const [activeTime, setActiveTime] = useState<PeriodKey>('week');

  const periodData = useMemo(() => {
    return reportDataByPeriod[activeTime] || reportDataByPeriod.week;
  }, [activeTime]);

  const { responseTime, alertTrend, dutyRecords } = periodData;

  const maxResponseTime = useMemo(() => {
    return Math.max(...responseTime.map(d => d.value));
  }, [responseTime]);

  const maxAlertCount = useMemo(() => {
    return Math.max(...alertTrend.map(d => d.value));
  }, [alertTrend]);

  const totalAlerts = useMemo(() => {
    return alertLevelDistribution.reduce((sum, d) => sum + d.value, 0);
  }, []);

  const avgResponseTime = useMemo(() => {
    if (responseTime.length === 0) return 0;
    return Math.round(responseTime.reduce((s, d) => s + d.value, 0) / responseTime.length);
  }, [responseTime]);

  const minResponseTime = useMemo(() => {
    return Math.min(...responseTime.map(d => d.value));
  }, [responseTime]);

  const totalAlertCount = useMemo(() => {
    return alertTrend.reduce((s, d) => s + d.value, 0);
  }, [alertTrend]);

  const avgAlertCount = useMemo(() => {
    if (alertTrend.length === 0) return 0;
    return Math.round(totalAlertCount / alertTrend.length);
  }, [alertTrend, totalAlertCount]);

  const renderBarChart = (data: ChartDataPoint[], maxValue: number, color: string) => {
    return (
      <View className={styles.chartBars}>
        {data.map((item, index) => {
          const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <View key={index} className={styles.chartBar}>
              <Text className={styles.barValue}>{item.value}</Text>
              <View
                className={styles.barFill}
                style={{
                  height: `${heightPercent}%`,
                  background: color
                }}
              />
            </View>
          );
        })}
      </View>
    );
  };

  const renderChartLabels = (data: ChartDataPoint[]) => {
    return (
      <View className={styles.chartLabels}>
        {data.map((item, index) => (
          <Text key={index} className={styles.chartLabel}>{item.label}</Text>
        ))}
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.timeFilter}>
        <View className={styles.timeTabs}>
          {timeTabs.map(tab => (
            <View
              key={tab.key}
              className={classNames(
                styles.timeTab,
                activeTime === tab.key && styles.timeTabActive
              )}
              onClick={() => setActiveTime(tab.key)}
            >
              {tab.label}
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>服务可用率</Text>
          </View>
          <View className={styles.card}>
            <View className={styles.availabilityGrid}>
              {availabilityMetrics.map((metric: ReportMetric, index: number) => (
                <View key={index} className={styles.availabilityItem}>
                  <Text className={styles.avaLabel}>{metric.label}</Text>
                  <View>
                    <Text className={styles.avaValue}>
                      {metric.value}
                      <Text style={{ fontSize: 28 }}>%</Text>
                    </Text>
                    {metric.trend && (
                      <Text className={classNames(styles.avaTrend)}>
                        {metric.trend}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>响应时长趋势</Text>
            <Text className={styles.sectionMore}>单位: ms</Text>
          </View>
          <View className={styles.card}>
            <View className={styles.chartContainer}>
              {renderBarChart(
                responseTime,
                maxResponseTime,
                'linear-gradient(180deg, #4080ff 0%, #165dff 100%)'
              )}
            </View>
            {renderChartLabels(responseTime)}
            <View className={styles.statRow}>
              <View className={styles.statItem}>
                <View className={styles.statValue}>{Math.round(maxResponseTime)}</View>
                <View className={styles.statLabel}>峰值(ms)</View>
              </View>
              <View className={styles.statItem}>
                <View className={styles.statValue}>
                  {avgResponseTime}
                </View>
                <View className={styles.statLabel}>均值(ms)</View>
              </View>
              <View className={styles.statItem}>
                <View className={styles.statValue}>
                  {minResponseTime}
                </View>
                <View className={styles.statLabel}>最低(ms)</View>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>告警趋势</Text>
          </View>
          <View className={styles.card}>
            <View className={styles.chartContainer} style={{ height: 280 }}>
              {renderBarChart(
                alertTrend,
                maxAlertCount,
                'linear-gradient(180deg, #ff9a2e 0%, #ff7d00 100%)'
              )}
            </View>
            {renderChartLabels(alertTrend)}
            <View className={styles.statRow}>
              <View className={styles.statItem}>
                <View className={styles.statValue} style={{ color: '#f53f3f' }}>
                  {totalAlertCount}
                </View>
                <View className={styles.statLabel}>总告警数</View>
              </View>
              <View className={styles.statItem}>
                <View className={styles.statValue} style={{ color: '#ff7d00' }}>
                  {avgAlertCount}
                </View>
                <View className={styles.statLabel}>日均告警</View>
              </View>
              <View className={styles.statItem}>
                <View className={styles.statValue} style={{ color: '#00b42a' }}>
                  23.5%
                </View>
                <View className={styles.statLabel}>环比下降</View>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>告警级别分布</Text>
          </View>
          <View className={styles.card}>
            <View className={styles.donutWrap}>
              <View className={styles.donutChart}>
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `conic-gradient(
                      #f53f3f 0deg ${(alertLevelDistribution[0]?.value || 0) / totalAlerts * 360}deg,
                      #ff7d00 ${(alertLevelDistribution[0]?.value || 0) / totalAlerts * 360}deg ${(alertLevelDistribution.slice(0, 2).reduce((s, d) => s + d.value, 0)) / totalAlerts * 360}deg,
                      #ffc300 ${(alertLevelDistribution.slice(0, 2).reduce((s, d) => s + d.value, 0)) / totalAlerts * 360}deg ${(alertLevelDistribution.slice(0, 3).reduce((s, d) => s + d.value, 0)) / totalAlerts * 360}deg,
                      #ff9a2e ${(alertLevelDistribution.slice(0, 3).reduce((s, d) => s + d.value, 0)) / totalAlerts * 360}deg ${(alertLevelDistribution.slice(0, 4).reduce((s, d) => s + d.value, 0)) / totalAlerts * 360}deg,
                      #722ed1 ${(alertLevelDistribution.slice(0, 4).reduce((s, d) => s + d.value, 0)) / totalAlerts * 360}deg 360deg
                    )`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <View
                    style={{
                      width: '65%',
                      height: '65%',
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <View style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1d2129' }}>{totalAlerts}</Text>
                      <Text style={{ fontSize: 22, color: '#86909c' }}>总计</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className={styles.legendList}>
                {alertLevelDistribution.map((item, index) => (
                  <View key={index} className={styles.legendItem}>
                    <View className={styles.legendLeft}>
                      <View
                        className={styles.legendDot}
                        style={{ backgroundColor: levelColors[index] }}
                      />
                      <Text className={styles.legendName}>{item.label}</Text>
                    </View>
                    <Text className={styles.legendValue}>{item.value} 条</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>值班表现</Text>
          </View>
          <View className={styles.card}>
            <View className={styles.tableHeader}>
              <Text className={styles.colDate}>日期</Text>
              <Text className={styles.colName}>值班人员</Text>
              <Text className={styles.colAlerts}>处理告警</Text>
              <Text className={styles.colResponse}>平均响应</Text>
            </View>
            {dutyRecords.map((record: DutyRecord, index: number) => (
              <View key={index} className={styles.tableRow}>
                <Text className={styles.colDate}>{record.date.slice(5)}</Text>
                <Text className={classNames(styles.colName, styles.highlightText)}>{record.name}</Text>
                <Text className={styles.colAlerts}>{record.alertsHandled}</Text>
                <Text className={classNames(styles.colResponse, styles.timeValue)}>
                  {record.avgResponseTime}分钟
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportsPage;

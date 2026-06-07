import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { resources } from '@/data/mockData';
import type { Resource, ResourceType } from '@/types';

const tabs: { key: ResourceType; label: string; icon: string }[] = [
  { key: 'host', label: '主机', icon: '🖥' },
  { key: 'container', label: '容器', icon: '📦' },
  { key: 'network', label: '网络', icon: '🌐' },
  { key: 'storage', label: '存储', icon: '💾' }
];

const ResourcesPage: React.FC = () => {
  const [activeType, setActiveType] = useState<ResourceType>('host');
  const [searchText, setSearchText] = useState('');

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchType = r.type === activeType;
      const matchSearch = !searchText ||
        r.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (r.ip && r.ip.includes(searchText));
      return matchType && matchSearch;
    });
  }, [activeType, searchText]);

  const stats = useMemo(() => {
    const filtered = resources.filter(r => r.type === activeType);
    const running = filtered.filter(r => r.status === 'running').length;
    const warning = filtered.filter(r => r.status === 'warning').length;
    const error = filtered.filter(r => r.status === 'error').length;
    return { total: filtered.length, running, warning, error };
  }, [activeType]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'running':
        return styles.statusRunning;
      case 'warning':
        return styles.statusWarning;
      case 'error':
        return styles.statusError;
      default:
        return styles.statusStopped;
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
      default:
        return '已停止';
    }
  };

  const getTypeIconClass = (type: string) => {
    switch (type) {
      case 'host':
        return styles.iconHost;
      case 'container':
        return styles.iconContainer;
      case 'network':
        return styles.iconNetwork;
      case 'storage':
        return styles.iconStorage;
      default:
        return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'host':
        return '🖥';
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

  const getMeterColor = (value: number) => {
    if (value >= 80) return '#f53f3f';
    if (value >= 60) return '#ff7d00';
    return '#00b42a';
  };

  const handleResourceClick = (resource: Resource) => {
    Taro.showToast({ title: `查看 ${resource.name} 详情`, icon: 'none' });
  };

  const renderMeters = (resource: Resource) => {
    const meters: { label: string; value: number }[] = [];
    if (resource.cpu !== undefined) {
      meters.push({ label: 'CPU', value: resource.cpu });
    }
    if (resource.memory !== undefined) {
      meters.push({ label: '内存', value: resource.memory });
    }
    if (resource.disk !== undefined) {
      meters.push({ label: '磁盘', value: resource.disk });
    }
    return meters;
  };

  return (
    <View className={styles.page}>
      <View className={styles.filterBar}>
        <View className={styles.filterTabs}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classNames(styles.filterTab, activeType === tab.key && styles.tabActive)}
              onClick={() => setActiveType(tab.key)}
            >
              {tab.label}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <View className={styles.statNum}>{stats.total}</View>
          <View className={styles.statLabel}>总数</View>
        </View>
        <View className={styles.statItem}>
          <View className={styles.statNum} style={{ color: '#00b42a' }}>{stats.running}</View>
          <View className={styles.statLabel}>运行中</View>
        </View>
        <View className={styles.statItem}>
          <View className={styles.statNum} style={{ color: '#ff7d00' }}>{stats.warning}</View>
          <View className={styles.statLabel}>告警</View>
        </View>
        <View className={styles.statItem}>
          <View className={styles.statNum} style={{ color: '#f53f3f' }}>{stats.error}</View>
          <View className={styles.statLabel}>异常</View>
        </View>
      </View>

      <ScrollView scrollY className={styles.resourceList}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索资源名称或IP"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>

        {filteredResources.length === 0 ? (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>📦</View>
            <View className={styles.emptyText}>暂无相关资源</View>
          </View>
        ) : (
          filteredResources.map((resource: Resource) => (
            <View
              key={resource.id}
              className={styles.resourceCard}
              onClick={() => handleResourceClick(resource)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.cardLeft}>
                  <View className={classNames(styles.typeIcon, getTypeIconClass(resource.type))}>
                    {getTypeIcon(resource.type)}
                  </View>
                  <Text className={styles.resourceName}>{resource.name}</Text>
                </View>
                <View className={classNames(styles.statusBadge, getStatusClass(resource.status))}>
                  {getStatusText(resource.status)}
                </View>
              </View>

              <View className={styles.resourceInfo}>
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
              </View>

              {renderMeters(resource).length > 0 && (
                <View className={styles.meterGroup}>
                  {renderMeters(resource).map((meter, idx) => (
                    <View key={idx} className={styles.meterItem}>
                      <Text className={styles.meterLabel}>{meter.label}</Text>
                      <View className={styles.meterBar}>
                        <View
                          className={styles.meterFill}
                          style={{
                            width: `${meter.value}%`,
                            background: getMeterColor(meter.value)
                          }}
                        />
                      </View>
                      <Text className={styles.meterValue}>{meter.value}%</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ResourcesPage;

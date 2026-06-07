import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';

interface SettingItemProps {
  icon: string;
  iconType?: 'primary' | 'success' | 'warning' | 'info';
  title: string;
  desc?: string;
  value?: string;
  hasArrow?: boolean;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onClick?: () => void;
  onSwitchChange?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconType = 'primary',
  title,
  desc,
  value,
  hasArrow = false,
  hasSwitch = false,
  switchValue = false,
  onClick,
  onSwitchChange
}) => {
  const iconClassMap = {
    primary: styles.iconPrimary,
    success: styles.iconSuccess,
    warning: styles.iconWarning,
    info: styles.iconInfo
  };

  return (
    <View className={styles.settingItem} onClick={onClick}>
      <View className={classNames(styles.itemIcon, iconClassMap[iconType])}>
        {icon}
      </View>
      <View className={styles.itemContent}>
        <View className={styles.itemTitle}>{title}</View>
        {desc && <View className={styles.itemDesc}>{desc}</View>}
      </View>
      {value && <Text className={styles.itemValue}>{value}</Text>}
      {hasSwitch && (
        <View
          className={classNames(styles.switchWrap, switchValue && styles.switchActive)}
          onClick={(e) => {
            e.stopPropagation();
            onSwitchChange && onSwitchChange(!switchValue);
          }}
        >
          <View
            className={classNames(
              styles.switchHandle,
              switchValue && styles.switchHandleActive
            )}
          />
        </View>
      )}
      {hasArrow && <Text className={styles.itemArrow}>›</Text>}
    </View>
  );
};

const SettingsPage: React.FC = () => {
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);

  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '清理中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '缓存已清除', icon: 'success' });
          }, 1000);
        }
      }
    });
  };

  const handleAbout = () => {
    Taro.showToast({ title: '版本 v1.0.0', icon: 'none' });
  };

  const handleFeedback = () => {
    Taro.showToast({ title: '意见反馈', icon: 'none' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  };

  const handleAccountInfo = () => {
    Taro.showToast({ title: '账号信息', icon: 'none' });
  };

  const handleSecurity = () => {
    Taro.showToast({ title: '账号安全', icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.userSection}>
        <View className={styles.userCard}>
          <View className={styles.avatar}>👤</View>
          <View className={styles.userInfo}>
            <View className={styles.userName}>张工程师</View>
            <View className={styles.userRole}>运维工程师 · 值班</View>
            <View className={styles.userDesc}>工号：OPT-2024001</View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>账号</View>
        <View className={styles.settingsGroup}>
          <SettingItem
            icon="👤"
            iconType="primary"
            title="个人信息"
            desc="姓名、工号、联系方式"
            hasArrow
            onClick={handleAccountInfo}
          />
          <SettingItem
            icon="🔐"
            iconType="success"
            title="账号安全"
            desc="密码、绑定手机"
            hasArrow
            onClick={handleSecurity}
          />
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>通知设置</View>
        <View className={styles.settingsGroup}>
          <SettingItem
            icon="🔔"
            iconType="warning"
            title="告警通知"
            desc="接收告警推送"
            hasSwitch
            switchValue={notifyEnabled}
            onSwitchChange={setNotifyEnabled}
          />
          <SettingItem
            icon="🔊"
            iconType="info"
            title="通知声音"
            hasSwitch
            switchValue={soundEnabled}
            onSwitchChange={setSoundEnabled}
          />
          <SettingItem
            icon="📳"
            iconType="primary"
            title="震动提醒"
            hasSwitch
            switchValue={vibrateEnabled}
            onSwitchChange={setVibrateEnabled}
          />
          <SettingItem
            icon="⚠️"
            iconType="warning"
            title="仅严重告警"
            desc="只接收严重级别告警"
            hasSwitch
            switchValue={criticalOnly}
            onSwitchChange={setCriticalOnly}
          />
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>通用</View>
        <View className={styles.settingsGroup}>
          <SettingItem
            icon="🗑"
            iconType="primary"
            title="清除缓存"
            value="32.5MB"
            hasArrow
            onClick={handleClearCache}
          />
          <SettingItem
            icon="💬"
            iconType="success"
            title="意见反馈"
            hasArrow
            onClick={handleFeedback}
          />
          <SettingItem
            icon="ℹ️"
            iconType="info"
            title="关于我们"
            value="v1.0.0"
            hasArrow
            onClick={handleAbout}
          />
        </View>
      </View>

      <View className={styles.logoutBtn} onClick={handleLogout}>
        退出登录
      </View>

      <View className={styles.versionInfo}>
        运维监控平台 v1.0.0
      </View>
    </ScrollView>
  );
};

export default SettingsPage;

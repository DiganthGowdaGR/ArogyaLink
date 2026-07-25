import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type StatusBadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type StatusBadgeProps = {
  status?: StatusBadgeStatus;
  children: string;
  style?: StyleProp<ViewStyle>;
};

const statusStyles: Record<
  StatusBadgeStatus,
  { backgroundColor: string; color: string }
> = {
  success: {
    backgroundColor: colors.successLight,
    color: colors.success,
  },
  warning: {
    backgroundColor: colors.warningLight,
    color: colors.warning,
  },
  danger: {
    backgroundColor: colors.dangerLight,
    color: colors.danger,
  },
  info: {
    backgroundColor: colors.infoLight,
    color: colors.info,
  },
  neutral: {
    backgroundColor: colors.neutralLight,
    color: colors.neutral,
  },
};

export function StatusBadge({
  status = 'neutral',
  children,
  style,
}: StatusBadgeProps) {
  const badge = statusStyles[status];

  return (
    <View
      accessibilityLabel={`${children} status`}
      style={[styles.badge, { backgroundColor: badge.backgroundColor }, style]}
    >
      <AppText variant="caption" color={badge.color} style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});

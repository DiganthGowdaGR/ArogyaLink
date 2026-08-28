import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.iconArea}>{icon}</View> : null}
      <View style={styles.copy}>
        <AppText variant="title" style={styles.title}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="body" color="textSecondary" style={styles.description}>
            {description}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <AppButton variant="secondary" onPress={onActionPress}>
          {actionLabel}
        </AppButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  description: {
    maxWidth: 360,
    textAlign: 'center',
  },
  iconArea: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.surfaceSecondary,
  },
  title: {
    textAlign: 'center',
  },
});

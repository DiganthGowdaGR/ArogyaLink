import type { ReactNode } from 'react';
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { accessibility, colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Card } from './Card';

type ActionCardProps = {
  icon?: ReactNode;
  label: string;
  description?: string;
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function ActionCard({
  icon,
  label,
  description,
  onPress,
  accessibilityLabel,
  style,
}: ActionCardProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.card, style]}
      contentStyle={styles.content}
    >
      <View style={styles.iconArea}>{icon}</View>
      <View style={styles.copy}>
        <AppText variant="title" style={styles.label}>
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" color="textSecondary" style={styles.description}>
            {description}
          </AppText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 160,
    minWidth: 0,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  copy: {
    gap: spacing.xs,
  },
  description: {
    maxWidth: 320,
  },
  iconArea: {
    width: 64,
    height: 64,
    minWidth: accessibility.minimumTouchTarget,
    minHeight: accessibility.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  label: {
    color: colors.textPrimary,
  },
});

import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { accessibility, spacing } from '@/theme';

import { AppText } from './AppText';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: PressableProps['onPress'];
  actionAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
  actionAccessibilityLabel,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.copy}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionText && onActionPress ? (
        <Pressable
          accessibilityLabel={actionAccessibilityLabel ?? actionText}
          accessibilityRole="button"
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.actionPressed,
          ]}
        >
          <AppText variant="button" color="primary" style={styles.actionText}>
            {actionText}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    minHeight: accessibility.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionText: {
    textAlign: 'right',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});

import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing } from '@/theme';

type CardProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  onPress?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  onPress,
  style,
  contentStyle,
  accessibilityRole,
  ...props
}: CardProps) {
  if (onPress) {
    return (
      <Pressable
        {...props}
        accessibilityRole={accessibilityRole ?? 'button'}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
          style,
        ]}
      >
        <View style={contentStyle}>{children}</View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.large,
    borderWidth: 1,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.82,
  },
});

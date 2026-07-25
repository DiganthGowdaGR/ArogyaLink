import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { accessibility, colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  variant?: AppButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const buttonStyles: Record<AppButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
};

const textColors: Record<AppButtonVariant, string> = {
  primary: colors.surface,
  secondary: colors.primary,
  outline: colors.textPrimary,
  danger: colors.surface,
};

export function AppButton({
  children,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const labelColor = isDisabled ? colors.neutral : textColors[variant];

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        buttonStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <AppText
            variant="button"
            color={labelColor}
            numberOfLines={2}
            style={[styles.label, textStyle]}
          >
            {children}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: accessibility.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.medium,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  disabled: {
    backgroundColor: colors.neutralLight,
    borderColor: colors.neutralLight,
  },
  fullWidth: {
    width: '100%',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});

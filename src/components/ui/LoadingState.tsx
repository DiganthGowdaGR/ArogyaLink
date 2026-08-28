import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';

import { AppText } from './AppText';

type LoadingStateProps = {
  message?: string;
  style?: StyleProp<ViewStyle>;
};

export function LoadingState({ message = 'Loading...', style }: LoadingStateProps) {
  return (
    <View
      accessibilityLabel={message}
      accessibilityRole="progressbar"
      style={[styles.container, style]}
    >
      <ActivityIndicator color={colors.primary} size="large" />
      <AppText variant="body" color="textSecondary" style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  message: {
    textAlign: 'center',
  },
});

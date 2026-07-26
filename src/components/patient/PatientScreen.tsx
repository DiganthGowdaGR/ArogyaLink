import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, OfflineBanner, ScreenContainer } from '@/components/ui';
import { spacing } from '@/theme';

type PatientScreenProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function PatientScreen({
  title,
  subtitle,
  eyebrow,
  children,
  contentStyle,
}: PatientScreenProps) {
  return (
    <ScreenContainer contentStyle={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]}>
        <View style={styles.header}>
          {eyebrow ? (
            <AppText variant="caption" color="primary">
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="heading">{title}</AppText>
          {subtitle ? (
            <AppText variant="body" color="textSecondary">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        <OfflineBanner />
        {children}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  screen: {
    flex: 1,
  },
});

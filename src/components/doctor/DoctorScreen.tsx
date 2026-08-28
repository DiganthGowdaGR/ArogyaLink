import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, ScreenContainer } from '@/components/ui';
import { spacing } from '@/theme';

type DoctorScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function DoctorScreen({
  title,
  subtitle,
  children,
  contentStyle,
}: DoctorScreenProps) {
  return (
    <ScreenContainer contentStyle={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]}>
        <View style={styles.header}>
          <AppText variant="heading">{title}</AppText>
          {subtitle ? (
            <AppText variant="body" color="textSecondary">
              {subtitle}
            </AppText>
          ) : null}
        </View>
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

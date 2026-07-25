import { StyleSheet, View, type PressableProps } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { accessibility, colors, radius, spacing } from '@/theme';

import { PatientIcon } from './PatientIcon';

type InfoRowProps = {
  title: string;
  description?: string;
  icon: Parameters<typeof PatientIcon>[0]['name'];
  onPress?: PressableProps['onPress'];
};

export function InfoRow({ title, description, icon, onPress }: InfoRowProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={title}
      style={styles.card}
      contentStyle={styles.content}
    >
      <View style={styles.iconArea}>
        <PatientIcon name={icon} />
      </View>
      <View style={styles.copy}>
        <AppText variant="bodyStrong">{title}</AppText>
        {description ? (
          <AppText variant="caption" color="textSecondary">
            {description}
          </AppText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  content: {
    minHeight: accessibility.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  iconArea: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.medium,
    backgroundColor: colors.primaryLight,
  },
});

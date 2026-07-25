import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import { AppText, Card, StatusBadge } from '@/components/ui';
import {
  mockPatientHistory,
  mockPatientSnapshot,
} from '@/features/doctor/mockData';
import { colors, radius, spacing } from '@/theme';

export default function DoctorPatientHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <DoctorScreen
      title="Patient History"
      subtitle={`${mockPatientSnapshot.name} - ${id ?? mockPatientSnapshot.id}`}
    >
      {mockPatientHistory.map((visit) => (
        <Card key={`${visit.date}-${visit.reason}`} contentStyle={styles.cardContent}>
          <View style={styles.visitHeader}>
            <View style={styles.iconArea}>
              <DoctorIcon name={{ android: 'history', web: 'history' }} />
            </View>
            <View style={styles.visitCopy}>
              <AppText variant="title">{visit.date}</AppText>
              <AppText variant="bodyStrong">{visit.doctor}</AppText>
              <AppText variant="body" color="textSecondary">
                {visit.reason}
              </AppText>
            </View>
          </View>
          <View style={styles.itemList}>
            {visit.items.map((item) => (
              <StatusBadge key={item} status="info">
                {item}
              </StatusBadge>
            ))}
          </View>
        </Card>
      ))}
    </DoctorScreen>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: spacing.lg,
  },
  iconArea: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  itemList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  visitCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  visitHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});

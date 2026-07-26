import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppText, Card, EmptyState, StatusBadge } from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { mockSeed } from '@/data/mockSeed';
import { appointmentRepository, carePlanRepository, doctorRepository } from '@/repositories';
import { colors, radius, spacing } from '@/theme';

export default function PatientHealthHistoryScreen() {
  const consultations = mockSeed.consultations.filter(
    (consultation) => consultation.patientId === demoIdentities.patientId
  );

  return (
    <PatientScreen
      title="Health History"
      subtitle="Visits grouped by doctor, clinic, and date"
    >
      {consultations.length === 0 ? (
        <EmptyState title="No health history yet" description="Completed visits will appear here." />
      ) : (
        consultations.map((consultation) => {
          const doctor = doctorRepository.getById(consultation.doctorId);
          const appointment = appointmentRepository.getById(consultation.appointmentId);
          const carePlan = carePlanRepository
            .getByPatient(consultation.patientId)
            .find((plan) => plan.consultationId === consultation.id);
          const items = ['Consultation', ...(carePlan ? ['Care Plan'] : [])];

          return (
            <Card key={consultation.id} contentStyle={styles.cardContent}>
          <View style={styles.visitHeader}>
            <View style={styles.iconArea}>
              <PatientIcon name={{ android: 'clinical_notes', web: 'clinical_notes' }} />
            </View>
            <View style={styles.visitCopy}>
              <AppText variant="title">{consultation.date}</AppText>
              <AppText variant="bodyStrong">{doctor?.fullName ?? 'Doctor'}</AppText>
              <AppText variant="body" color="textSecondary">
                {doctor?.clinicName ?? 'Clinic'}
              </AppText>
            </View>
          </View>

          <View style={styles.reasonBlock}>
            <AppText variant="caption" color="textSecondary">
              Reason
            </AppText>
            <AppText variant="bodyStrong">
              {appointment?.reason ?? consultation.notes ?? 'Follow-up consultation'}
            </AppText>
          </View>

          <View style={styles.itemList}>
            {items.map((item) => (
              <StatusBadge key={item} status="info">
                {item}
              </StatusBadge>
            ))}
          </View>
            </Card>
          );
        })
      )}
    </PatientScreen>
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
  reasonBlock: {
    gap: spacing.xs,
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

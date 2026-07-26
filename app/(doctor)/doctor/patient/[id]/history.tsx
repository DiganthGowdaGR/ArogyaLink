import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import { AppText, Card, EmptyState, StatusBadge } from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { mockSeed } from '@/data/mockSeed';
import { appointmentRepository, carePlanRepository, doctorRepository, patientRepository } from '@/repositories';
import { colors, radius, spacing } from '@/theme';

export default function DoctorPatientHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = id ?? demoIdentities.patientId;
  const patient = patientRepository.getById(patientId);
  const consultations = mockSeed.consultations.filter(
    (consultation) => consultation.patientId === patientId
  );

  return (
    <DoctorScreen
      title="Patient History"
      subtitle={`${patient?.fullName ?? 'Patient'} - ${patientId}`}
    >
      {consultations.length === 0 ? (
        <EmptyState title="No patient history" description="Completed consultations will appear here." />
      ) : (
        consultations.map((consultation) => {
          const doctor = doctorRepository.getById(consultation.doctorId);
          const appointment = appointmentRepository.getById(consultation.appointmentId);
          const carePlan = carePlanRepository
            .getByPatient(patientId)
            .find((plan) => plan.consultationId === consultation.id);
          const items = ['Consultation', ...(carePlan ? ['Care Plan'] : [])];

          return (
        <Card key={consultation.id} contentStyle={styles.cardContent}>
          <View style={styles.visitHeader}>
            <View style={styles.iconArea}>
              <DoctorIcon name={{ android: 'history', web: 'history' }} />
            </View>
            <View style={styles.visitCopy}>
              <AppText variant="title">{consultation.date}</AppText>
              <AppText variant="bodyStrong">{doctor?.fullName ?? 'Doctor'}</AppText>
              <AppText variant="body" color="textSecondary">
                {appointment?.reason ?? consultation.notes ?? 'Follow-up consultation'}
              </AppText>
            </View>
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

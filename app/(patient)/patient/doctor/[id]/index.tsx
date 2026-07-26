import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppButton, AppText, Card, EmptyState, SectionHeader, StatusBadge } from '@/components/ui';
import { doctorRepository } from '@/repositories';
import { colors, radius, spacing } from '@/theme';
import { useConnectivity } from '@/services/connectivity';

export default function PatientDoctorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOffline } = useConnectivity();
  const doctor = id ? doctorRepository.getById(id) : undefined;

  if (!doctor) {
    return (
      <PatientScreen title="Doctor Profile">
        <EmptyState title="Doctor not found" description="This doctor profile is unavailable." />
      </PatientScreen>
    );
  }

  return (
    <PatientScreen title="Doctor Profile" subtitle="Review availability before requesting a visit">
      <Card contentStyle={styles.identityContent}>
        <View style={styles.avatar}>
          <PatientIcon name={{ android: 'stethoscope', web: 'stethoscope' }} color={colors.surface} size={36} />
        </View>
        <AppText variant="heading" style={styles.centerText}>{doctor.fullName}</AppText>
        <AppText variant="bodyStrong" color="textSecondary" style={styles.centerText}>
          {doctor.specialization}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.centerText}>
          {doctor.clinicName} - {doctor.city}
        </AppText>
        <StatusBadge status={doctor.available ? 'success' : 'neutral'}>
          {doctor.available ? 'Available' : 'Currently unavailable'}
        </StatusBadge>
        <AppText variant="body" color="textSecondary" style={styles.centerText}>
          Demo professional profile for ArogyaLink appointment requests.
        </AppText>
        <AppButton
          fullWidth
          disabled={isOffline}
          accessibilityLabel={`Book appointment with ${doctor.fullName}`}
          onPress={() =>
            router.push({
              pathname: '/patient/doctor/[id]/book',
              params: { id: doctor.id },
            })
          }
        >
          Book Appointment
        </AppButton>
        {isOffline ? (
          <AppText variant="caption" color="textSecondary" style={styles.centerText}>
            Internet connection required to request a new appointment.
          </AppText>
        ) : null}
      </Card>

      <Card contentStyle={styles.availabilityContent}>
        <SectionHeader title="Availability" subtitle="Choose from these demo slots" />
        {doctor.availability.map((availability) => (
          <View key={availability.date} style={styles.dayRow}>
            <AppText variant="bodyStrong">{formatDate(availability.date)}</AppText>
            <AppText variant="body" color="textSecondary">
              {availability.times.join('  ·  ')}
            </AppText>
          </View>
        ))}
      </Card>
    </PatientScreen>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  avatar: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  availabilityContent: {
    gap: spacing.md,
  },
  centerText: {
    textAlign: 'center',
  },
  dayRow: {
    gap: spacing.xs,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
  },
  identityContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
});

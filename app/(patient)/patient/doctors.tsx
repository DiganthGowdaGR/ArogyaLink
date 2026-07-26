import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppButton, AppText, Card, EmptyState, StatusBadge } from '@/components/ui';
import { doctorRepository } from '@/repositories';
import { colors, radius, spacing, typography } from '@/theme';

export default function PatientDoctorsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const doctors = doctorRepository.list().filter((doctor) => doctor.available);
  const filteredDoctors = doctors.filter((doctor) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [doctor.fullName, doctor.specialization, doctor.clinicName, doctor.city].some((value) =>
      value.toLowerCase().includes(query)
    );
  });

  return (
    <PatientScreen title="Find a Doctor" subtitle="Choose a doctor for your next visit">
      <Card contentStyle={styles.searchContent}>
        <AppText variant="bodyStrong">Search doctors or specialization</AppText>
        <TextInput
          accessibilityLabel="Search doctors or specialization"
          autoCapitalize="none"
          onChangeText={setSearch}
          placeholder="Search by name, clinic, city, or speciality"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          value={search}
        />
      </Card>

      {filteredDoctors.length === 0 ? (
        <EmptyState title="No doctors found" description="Try another name, speciality, clinic, or city." />
      ) : (
        filteredDoctors.map((doctor) => (
          <Card key={doctor.id} contentStyle={styles.doctorCard}>
            <View style={styles.doctorTop}>
              <View style={styles.iconArea}>
                <PatientIcon name={{ android: 'stethoscope', web: 'stethoscope' }} />
              </View>
              <View style={styles.doctorCopy}>
                <AppText variant="title">{doctor.fullName}</AppText>
                <AppText variant="body" color="textSecondary">
                  {doctor.specialization}
                </AppText>
              </View>
            </View>
            <View style={styles.detailGroup}>
              <AppText variant="bodyStrong">{doctor.clinicName}</AppText>
              <AppText variant="body" color="textSecondary">{doctor.city}</AppText>
              <StatusBadge status="success">Available</StatusBadge>
            </View>
            <AppButton
              variant="secondary"
              accessibilityLabel={`View ${doctor.fullName}`}
              onPress={() =>
                router.push({
                  pathname: '/patient/doctor/[id]/index',
                  params: { id: doctor.id },
                })
              }
            >
              View Doctor
            </AppButton>
          </Card>
        ))
      )}
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  detailGroup: {
    gap: spacing.xs,
  },
  doctorCard: {
    gap: spacing.md,
  },
  doctorCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  doctorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconArea: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  searchContent: {
    gap: spacing.md,
  },
  searchInput: {
    minHeight: 52,
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    paddingHorizontal: spacing.md,
  },
});

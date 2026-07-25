import { StyleSheet, TextInput, View } from 'react-native';

import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import { PatientCard } from '@/components/doctor/PatientCard';
import { AppButton, AppText, Card } from '@/components/ui';
import { mockDoctorPatients } from '@/features/doctor/mockData';
import { colors, radius, spacing, typography } from '@/theme';

export default function DoctorPatientsScreen() {
  return (
    <DoctorScreen title="Patients" subtitle="Quick access to your patient records">
      <Card contentStyle={styles.searchContent}>
        <AppText variant="bodyStrong">Search patient</AppText>
        <TextInput
          accessibilityLabel="Search patient by name or ID"
          editable={false}
          placeholder="Search by name or patient ID"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
        <View style={styles.searchActions}>
          <AppButton
            variant="secondary"
            icon={<DoctorIcon name={{ android: 'qr_code_scanner', web: 'qr_code_scanner' }} />}
            accessibilityLabel="Scan patient QR"
          >
            Scan Patient QR
          </AppButton>
          <AppButton
            variant="outline"
            icon={<DoctorIcon name={{ android: 'search', web: 'search' }} />}
            accessibilityLabel="Search by patient ID"
          >
            Search by Patient ID
          </AppButton>
        </View>
      </Card>

      <View style={styles.patientList}>
        {mockDoctorPatients.map((patient) => (
          <PatientCard key={patient.id} {...patient} />
        ))}
      </View>
    </DoctorScreen>
  );
}

const styles = StyleSheet.create({
  patientList: {
    gap: spacing.md,
  },
  searchActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
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

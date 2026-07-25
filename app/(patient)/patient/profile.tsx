import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { InfoRow } from '@/components/patient/InfoRow';
import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppButton, AppText, Card, SectionHeader } from '@/components/ui';
import { routes } from '@/config/navigation';
import { mockPatient } from '@/features/patient/mockData';
import { colors, radius, spacing } from '@/theme';

export default function PatientProfileScreen() {
  return (
    <ProfileContent />
  );
}

function ProfileContent() {
  const router = useRouter();

  return (
    <PatientScreen title="My Profile">
      <Card contentStyle={styles.identityContent}>
        <View style={styles.avatar}>
          <PatientIcon
            name={{ android: 'person', web: 'person' }}
            color={colors.surface}
            size={34}
          />
        </View>
        <View style={styles.identityCopy}>
          <AppText variant="heading" style={styles.centerText}>
            {mockPatient.name}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.centerText}>
            Patient ID: {mockPatient.patientId}
          </AppText>
        </View>
        <AppButton
          variant="secondary"
          icon={<PatientIcon name={{ android: 'qr_code', web: 'qr_code' }} />}
          accessibilityLabel="Show health QR"
        >
          Show Health QR
        </AppButton>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Personal Information" />
        <InfoRow
          title="Medical Basics"
          description={`Blood group: ${mockPatient.bloodGroup}`}
          icon={{ android: 'bloodtype', web: 'bloodtype' }}
        />
        <InfoRow
          title="Allergies"
          description={mockPatient.allergies}
          icon={{ android: 'allergy', web: 'allergy' }}
        />
        <InfoRow
          title="Known conditions"
          description={mockPatient.knownConditions}
          icon={{ android: 'medical_information', web: 'medical_information' }}
        />
      </Card>

      <View style={styles.rowStack}>
        <InfoRow
          title="Emergency Contact"
          description={mockPatient.emergencyContact}
          icon={{ android: 'contact_emergency', web: 'contact_emergency' }}
        />
        <InfoRow
          title="Health History"
          description="Visits, prescriptions, reports, and summaries"
          icon={{ android: 'history', web: 'history' }}
          onPress={() => router.push('/patient/health-history')}
        />
        <InfoRow
          title="Notifications"
          description="Medicine and visit reminders"
          icon={{ android: 'notifications', web: 'notifications' }}
        />
        <InfoRow
          title="Language"
          description="Choose your preferred language"
          icon={{ android: 'language', web: 'language' }}
        />
        <InfoRow
          title="Help & Support"
          description="Get help using ArogyaLink"
          icon={{ android: 'help', web: 'help' }}
        />
      </View>

      <Card contentStyle={styles.devContent}>
        <AppText variant="caption" color="textSecondary" style={styles.centerText}>
          Development option
        </AppText>
        <AppButton
          variant="outline"
          accessibilityLabel="Switch role"
          onPress={() => router.replace(routes.auth)}
        >
          Switch Role
        </AppButton>
      </Card>
    </PatientScreen>
  );
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
  cardContent: {
    gap: spacing.md,
  },
  centerText: {
    textAlign: 'center',
  },
  devContent: {
    gap: spacing.md,
  },
  identityContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  identityCopy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowStack: {
    gap: spacing.md,
  },
});

import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { InfoRow } from '@/components/patient/InfoRow';
import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppButton, AppText, Card, SectionHeader } from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { routes } from '@/config/navigation';
import { patientRepository } from '@/repositories';
import { useAuthSession } from '@/features/auth/AuthContext';
import { colors, radius, spacing } from '@/theme';

export default function PatientProfileScreen() {
  return (
    <ProfileContent />
  );
}

function ProfileContent() {
  const router = useRouter();
  const { logout } = useAuthSession();
  const patient = patientRepository.getById(demoIdentities.patientId);

  const handleLogout = () => {
    logout();
    router.replace(routes.authLogin);
  };

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
            {patient?.fullName ?? 'Patient'}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.centerText}>
            Patient ID: {patient?.id ?? demoIdentities.patientId}
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
          description={`Blood group: ${patient?.bloodGroup ?? 'Not recorded'}`}
          icon={{ android: 'bloodtype', web: 'bloodtype' }}
        />
        <InfoRow
          title="Allergies"
          description={patient?.allergies.join(', ') || 'No known allergies'}
          icon={{ android: 'allergy', web: 'allergy' }}
        />
        <InfoRow
          title="Known conditions"
          description={patient?.conditions.join(', ') || 'No known conditions'}
          icon={{ android: 'medical_information', web: 'medical_information' }}
        />
      </Card>

      <View style={styles.rowStack}>
        <InfoRow
          title="Emergency Contact"
          description="Emergency contact not yet recorded"
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
        <AppButton
          variant="outline"
          accessibilityLabel="Logout"
          onPress={handleLogout}
        >
          Logout
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

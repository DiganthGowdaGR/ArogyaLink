import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import { AppButton, AppText, Card, SectionHeader } from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { routes } from '@/config/navigation';
import { doctorRepository } from '@/repositories';
import { useAuthSession } from '@/features/auth/AuthContext';
import { colors, radius, spacing } from '@/theme';

export default function DoctorProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthSession();
  const doctor = doctorRepository.getById(demoIdentities.doctorId);

  const handleLogout = () => {
    logout();
    router.replace(routes.authLogin);
  };

  return (
    <DoctorScreen title="Profile">
      <Card contentStyle={styles.identityContent}>
        <View style={styles.avatar}>
          <DoctorIcon
            name={{ android: 'stethoscope', web: 'stethoscope' }}
            color={colors.surface}
            size={36}
          />
        </View>
        <View style={styles.identityCopy}>
          <AppText variant="heading" style={styles.centerText}>
            {doctor?.fullName ?? 'Doctor'}
          </AppText>
          <AppText variant="bodyStrong" color="textSecondary" style={styles.centerText}>
            {doctor?.specialization ?? 'Healthcare provider'}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.centerText}>
            {doctor?.clinicName ?? 'Clinic'}
          </AppText>
        </View>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Professional Information" />
        <ProfileRow
          title="Specialization"
          value={doctor?.specialization ?? 'Not recorded'}
          icon="medical_services"
        />
        <ProfileRow
          title="Clinic / Hospital"
          value={`${doctor?.clinicName ?? 'Not recorded'}, ${doctor?.city ?? ''}`}
          icon="business"
        />
        <ProfileRow
          title="Availability"
          value={doctor?.available ? 'Available for appointments' : 'Currently unavailable'}
          icon="schedule"
        />
      </Card>

      <View style={styles.rowStack}>
        <ProfileRow title="Notification Settings" value="Consultation and queue alerts" icon="notifications" />
        <ProfileRow title="Help & Support" value="Get help using ArogyaLink" icon="help" />
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
    </DoctorScreen>
  );
}

type ProfileIconName = 'medical_services' | 'business' | 'schedule' | 'notifications' | 'help';

function ProfileRow({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ProfileIconName;
}) {
  return (
    <Card style={styles.rowCard} contentStyle={styles.rowContent}>
      <View style={styles.rowIcon}>
        <DoctorIcon name={{ android: icon, web: icon }} />
      </View>
      <View style={styles.rowCopy}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" color="textSecondary">
          {value}
        </AppText>
      </View>
    </Card>
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
  rowCard: {
    padding: spacing.md,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  rowIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.medium,
    backgroundColor: colors.primaryLight,
  },
  rowStack: {
    gap: spacing.md,
  },
});

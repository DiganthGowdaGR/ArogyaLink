import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppText, Card, ScreenContainer } from '@/components/ui';
import { routes, type UserRole } from '@/config/navigation';
import { useAuthSession } from '@/features/auth/AuthContext';
import { getAuthError } from '@/features/auth/validation';
import { colors, radius, spacing, typography } from '@/theme';

const roles: UserRole[] = ['patient', 'doctor'];

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, login, role } = useAuthSession();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated && role === 'patient') {
    return <Redirect href={routes.patientHome} />;
  }

  if (isAuthenticated && role === 'doctor') {
    return <Redirect href={routes.doctorHome} />;
  }

  const handleLogin = async () => {
    const validationError = getAuthError({ identifier, password });

    if (validationError) {
      setError(validationError);
      return;
    }

    await login({ identifier: identifier.trim(), password, role: selectedRole });
    router.replace(selectedRole === 'patient' ? routes.patientHome : routes.doctorHome);
  };

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <View style={styles.content}>
        <Card contentStyle={styles.cardContent}>
          <View style={styles.header}>
            <AppText variant="display" style={styles.centerText}>
              ArogyaLink
            </AppText>
            <AppText variant="title" style={styles.centerText}>
              Login
            </AppText>
          </View>

          <RoleSelector selectedRole={selectedRole} onChange={setSelectedRole} />

          <View style={styles.fieldGroup}>
            <AppText variant="caption" color="textSecondary">
              Email or phone
            </AppText>
            <TextInput
              accessibilityLabel="Email or phone"
              autoCapitalize="none"
              inputMode="email"
              onChangeText={setIdentifier}
              placeholder="Enter email or phone"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={identifier}
            />
          </View>

          <View style={styles.fieldGroup}>
            <AppText variant="caption" color="textSecondary">
              Password
            </AppText>
            <TextInput
              accessibilityLabel="Password"
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error ? (
            <AppText variant="caption" color="danger" style={styles.centerText}>
              {error}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            <AppButton fullWidth accessibilityLabel="Login" onPress={() => void handleLogin()}>
              Login
            </AppButton>
            <AppButton
              fullWidth
              variant="secondary"
              accessibilityLabel="Create account"
              onPress={() => router.push(routes.authRegister)}
            >
              Create Account
            </AppButton>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}

function RoleSelector({
  selectedRole,
  onChange,
}: {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
}) {
  return (
    <View style={styles.roleSelector}>
      {roles.map((role) => {
        const isSelected = selectedRole === role;
        const label = role === 'patient' ? 'Patient' : 'Doctor';

        return (
          <Pressable
            key={role}
            accessibilityLabel={`Login as ${label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(role)}
            style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
          >
            <AppText
              variant="button"
              color={isSelected ? 'primary' : 'textSecondary'}
              style={styles.centerText}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    width: '100%',
  },
  cardContent: {
    gap: spacing.lg,
  },
  centerText: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    minHeight: 52,
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    paddingHorizontal: spacing.md,
  },
  roleOption: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.medium,
    paddingHorizontal: spacing.md,
  },
  roleOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.xs,
  },
  screen: {
    flex: 1,
  },
});

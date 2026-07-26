import { Redirect, Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { doctorTabs, routes } from '@/config/navigation';
import { useAuthSession } from '@/features/auth/AuthContext';
import { accessibility, colors, typography } from '@/theme';

export default function DoctorTabsLayout() {
  const { isAuthenticated, role } = useAuthSession();

  if (!isAuthenticated) {
    return <Redirect href={routes.authLogin} />;
  }

  if (role !== 'doctor') {
    return <Redirect href={routes.patientHome} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.sizes.sm,
          lineHeight: typography.lineHeights.sm,
          fontWeight: typography.weights.medium,
        },
        tabBarStyle: {
          minHeight: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          minHeight: accessibility.minimumTouchTarget,
        },
      }}
    >
      {doctorTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            href: tab.href,
            tabBarAccessibilityLabel: `${tab.label} tab`,
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name={tab.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="patient/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="patient/[id]/history" options={{ href: null }} />
      <Tabs.Screen name="patient/[id]/care-plan" options={{ href: null }} />
    </Tabs>
  );
}

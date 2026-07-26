import { Redirect, Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { patientTabs, routes } from '@/config/navigation';
import { useAuthSession } from '@/features/auth/AuthContext';
import { accessibility, colors, typography } from '@/theme';

export default function PatientTabsLayout() {
  const { isAuthenticated, role } = useAuthSession();

  if (!isAuthenticated) {
    return <Redirect href={routes.authLogin} />;
  }

  if (role !== 'patient') {
    return <Redirect href={routes.doctorHome} />;
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
      {patientTabs.map((tab) => (
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
      <Tabs.Screen
        name="health-history"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

import { Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { doctorTabs } from '@/config/navigation';
import { accessibility, colors, typography } from '@/theme';

export default function DoctorTabsLayout() {
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
    </Tabs>
  );
}

import type { Href } from 'expo-router';
import type { AndroidSymbol, SFSymbol } from 'expo-symbols';

export type UserRole = 'patient' | 'doctor';

export type NavigationIconName = {
  ios: SFSymbol;
  android: AndroidSymbol;
  web: AndroidSymbol;
};

export type TabRoute = {
  name: string;
  label: string;
  href: Href;
  icon: NavigationIconName;
};

export const routes = {
  auth: '/(auth)/index',
  patientHome: '/patient/home',
  doctorHome: '/doctor/home',
} as const;

export const patientTabs: TabRoute[] = [
  {
    name: 'home',
    label: 'Home',
    href: '/patient/home',
    icon: { ios: 'house.fill', android: 'home', web: 'home' },
  },
  {
    name: 'appointments',
    label: 'Appointments',
    href: '/patient/appointments',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  },
  {
    name: 'ai',
    label: 'AI',
    href: '/patient/ai',
    icon: { ios: 'brain.head.profile', android: 'psychology', web: 'psychology' },
  },
  {
    name: 'medications',
    label: 'Medications',
    href: '/patient/medications',
    icon: { ios: 'pills.fill', android: 'medication', web: 'medication' },
  },
  {
    name: 'profile',
    label: 'Profile',
    href: '/patient/profile',
    icon: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
  },
];

export const doctorTabs: TabRoute[] = [
  {
    name: 'home',
    label: 'Home',
    href: '/doctor/home',
    icon: { ios: 'house.fill', android: 'home_health', web: 'home_health' },
  },
  {
    name: 'patients',
    label: 'Patients',
    href: '/doctor/patients',
    icon: { ios: 'person.2.fill', android: 'groups', web: 'groups' },
  },
  {
    name: 'queue',
    label: 'Queue',
    href: '/doctor/queue',
    icon: { ios: 'list.bullet.clipboard.fill', android: 'queue', web: 'queue' },
  },
  {
    name: 'profile',
    label: 'Profile',
    href: '/doctor/profile',
    icon: { ios: 'stethoscope', android: 'stethoscope', web: 'stethoscope' },
  },
];

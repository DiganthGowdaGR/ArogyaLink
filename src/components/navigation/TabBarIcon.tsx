import { SymbolView } from 'expo-symbols';
import { StyleSheet, View, type ColorValue } from 'react-native';

import type { NavigationIconName } from '@/config/navigation';
import { radius } from '@/theme';

type TabBarIconProps = {
  name: NavigationIconName;
  color: ColorValue;
  size?: number;
};

export function TabBarIcon({ name, color, size = 26 }: TabBarIconProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      fallback={<View style={[styles.fallback, { backgroundColor: color }]} />}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
});

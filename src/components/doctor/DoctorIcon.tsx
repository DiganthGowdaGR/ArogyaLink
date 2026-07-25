import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { StyleSheet, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

type DoctorIconProps = {
  name: {
    ios?: SFSymbol;
    android: AndroidSymbol;
    web: AndroidSymbol;
  };
  color?: ColorValue;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function DoctorIcon({
  name,
  color = colors.primary,
  size = 28,
  style,
}: DoctorIconProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      fallback={<View style={[styles.fallback, { backgroundColor: color }, style]} />}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
});

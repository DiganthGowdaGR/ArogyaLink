import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsive } from '@/hooks/useResponsive';
import { colors } from '@/theme';

type ScreenContainerProps = {
  children: ReactNode;
  safeArea?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export function ScreenContainer({
  children,
  safeArea = true,
  style,
  contentStyle,
  testID,
}: ScreenContainerProps) {
  const responsive = useResponsive();
  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container style={[styles.root, style]} testID={testID}>
      <View
        style={[
          styles.content,
          {
            maxWidth: responsive.contentMaxWidth,
            paddingHorizontal: responsive.horizontalPadding,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
});

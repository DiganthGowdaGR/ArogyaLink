import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { layout } from '@/theme';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isDesktop = width >= layout.breakpoints.desktop;
    const isTablet = width >= layout.breakpoints.tablet && !isDesktop;
    const isMobile = width < layout.breakpoints.tablet;

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      contentMaxWidth: layout.contentMaxWidth,
      horizontalPadding: isDesktop
        ? layout.screenPaddingHorizontalLarge
        : layout.screenPaddingHorizontal,
    };
  }, [height, width]);
}

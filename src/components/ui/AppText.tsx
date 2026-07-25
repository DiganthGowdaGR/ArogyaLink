import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';

import { colors, typography } from '@/theme';

type TextVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'button';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: keyof typeof colors | string;
  style?: StyleProp<TextStyle>;
};

const variantStyles = {
  display: typography.display,
  heading: typography.heading,
  title: typography.title,
  body: typography.body,
  bodyStrong: typography.bodyStrong,
  caption: typography.caption,
  button: typography.button,
} as const;

function resolveColor(color?: keyof typeof colors | string) {
  if (!color) {
    return colors.textPrimary;
  }

  return color in colors ? colors[color as keyof typeof colors] : color;
}

export function AppText({
  variant = 'body',
  color,
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[variantStyles[variant], { color: resolveColor(color) }, style]}
    >
      {children}
    </Text>
  );
}

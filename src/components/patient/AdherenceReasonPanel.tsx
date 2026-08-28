import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppText, Card } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';

const reasons = [
  'Forgot',
  'Medicine unavailable',
  "Didn't understand instructions",
  'Felt unwell / possible side effect',
  'Could not travel',
  'Other',
];

export function AdherenceReasonPanel({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');

  const handleReasonPress = (reason: string) => {
    if (reason === 'Other') {
      setSelectedReason(reason);
      return;
    }

    onSubmit(reason);
  };

  return (
    <Card contentStyle={styles.content}>
      <AppText variant="bodyStrong">Why could you not complete this?</AppText>
      <View style={styles.options}>
        {reasons.map((reason) => (
          <AppButton
            key={reason}
            variant={selectedReason === reason ? 'secondary' : 'outline'}
            onPress={() => handleReasonPress(reason)}
            accessibilityLabel={reason}
          >
            {reason}
          </AppButton>
        ))}
      </View>
      {selectedReason === 'Other' ? (
        <>
          <TextInput
            accessibilityLabel="Other reason"
            placeholder="Add a short reason"
            placeholderTextColor={colors.textSecondary}
            value={otherReason}
            onChangeText={setOtherReason}
            style={styles.input}
          />
          <AppButton
            onPress={() => onSubmit(otherReason.trim() || 'Other')}
            accessibilityLabel="Save other reason"
          >
            Save Reason
          </AppButton>
        </>
      ) : null}
      <AppButton variant="outline" onPress={onCancel} accessibilityLabel="Cancel reason">
        Cancel
      </AppButton>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
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
  options: {
    gap: spacing.sm,
  },
});

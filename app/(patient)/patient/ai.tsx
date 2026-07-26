import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { ActionCard, AppButton, AppText, Card } from '@/components/ui';
import { colors, spacing } from '@/theme';
import { useConnectivity } from '@/services/connectivity';

export default function PatientAiScreen() {
  const { isOffline } = useConnectivity();

  return (
    <PatientScreen
      title="Arogya AI"
      subtitle="Ask, understand, and find the right care."
    >
      {isOffline ? (
        <Card contentStyle={styles.offlineCard}>
          <AppText variant="bodyStrong" color="primary">
            Arogya AI needs an internet connection.
          </AppText>
          <AppText variant="body" color="textSecondary">
            Your saved care plan and medicines are still available offline.
          </AppText>
        </Card>
      ) : null}
      <Card contentStyle={styles.voiceCard}>
        <View style={styles.voiceIcon}>
          <PatientIcon
            name={{ android: 'mic', web: 'mic' }}
            color={colors.surface}
            size={32}
          />
        </View>
        <View style={styles.voiceCopy}>
          <AppText variant="title" style={styles.centerText}>
            Tap & Speak
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.centerText}>
            Tell Arogya AI what you need help with.
          </AppText>
        </View>
        <AppButton disabled={isOffline} accessibilityLabel="Tap and speak to Arogya AI">
          Tap & Speak
        </AppButton>
      </Card>

      <View style={styles.actionGrid}>
        <ActionCard
          icon={<PatientIcon name={{ android: 'chat', web: 'chat' }} />}
          label="Ask Arogya AI"
          description="Type or speak about your health concern"
          onPress={() => undefined}
          style={styles.actionCard}
        />
        <ActionCard
          icon={<PatientIcon name={{ android: 'document_scanner', web: 'document_scanner' }} />}
          label="Scan Prescription"
          description="Understand your doctor's prescription"
          onPress={() => undefined}
          style={styles.actionCard}
        />
        <ActionCard
          icon={<PatientIcon name={{ android: 'medical_information', web: 'medical_information' }} />}
          label="Check Health Issue"
          description="Describe or upload a visible health concern"
          onPress={() => undefined}
          style={styles.actionCard}
        />
        <ActionCard
          icon={<PatientIcon name={{ android: 'summarize', web: 'summarize' }} />}
          label="Explain My Records"
          description="Understand your medical records in simple language"
          onPress={() => undefined}
          style={styles.actionCard}
        />
        <ActionCard
          icon={<PatientIcon name={{ android: 'person_search', web: 'person_search' }} />}
          label="Find a Doctor"
          description="Get help finding the right specialist"
          onPress={() => undefined}
          style={styles.actionCard}
        />
      </View>

      <Card>
        <AppText variant="caption" color="textSecondary" style={styles.safetyNote}>
          {"Arogya AI provides general support and does not replace a doctor's diagnosis."}
        </AppText>
      </Card>
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  centerText: {
    textAlign: 'center',
  },
  offlineCard: {
    gap: spacing.sm,
  },
  safetyNote: {
    textAlign: 'center',
  },
  voiceCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  voiceCopy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  voiceIcon: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
});

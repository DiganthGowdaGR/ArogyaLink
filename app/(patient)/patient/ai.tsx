import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import {
  ActionCard,
  AppButton,
  AppText,
  Card,
  EmptyState,
  LoadingState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import type { Doctor } from '@/domain';
import { doctorRepository } from '@/repositories';
import { useConnectivity } from '@/services/connectivity';
import { usePatientOfflineData } from '@/services/offline';
import {
  aiService,
  emergencyCareMessage,
  isEmergencyConcern,
  type AIResponse,
  type AISpeciality,
} from '@/services/ai';
import { colors, radius, spacing, typography } from '@/theme';

type AIMode = 'concern' | 'prescription' | 'record';

export default function PatientAiScreen() {
  const router = useRouter();
  const { isOffline } = useConnectivity();
  const { patient, carePlan, carePlanItems } = usePatientOfflineData();
  const [mode, setMode] = useState<AIMode>('concern');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [matchedDoctors, setMatchedDoctors] = useState<Doctor[]>([]);
  const [routingSpeciality, setRoutingSpeciality] = useState<AISpeciality | null>(null);
  const [emergency, setEmergency] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recordContext = buildRecordContext(patient, carePlanItems, carePlan?.status);

  const chooseMode = (nextMode: AIMode) => {
    setMode(nextMode);
    setInput('');
    setResponse(null);
    setMatchedDoctors([]);
    setRoutingSpeciality(null);
    setEmergency(false);
    setError(null);
  };

  const handleAsk = async () => {
    const value = input.trim();
    const requestText = mode === 'record' && !value ? recordContext : value;

    if (isOffline) {
      return;
    }

    if (!requestText) {
      setError('Tell Arogya AI what you would like help with.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setMatchedDoctors([]);
    setRoutingSpeciality(null);
    setEmergency(false);

    try {
      if (mode === 'concern') {
        if (isEmergencyConcern(requestText)) {
          setEmergency(true);
          return;
        }

        const [summary, suggestion] = await Promise.all([
          aiService.summarizeConcern(requestText),
          aiService.suggestSpeciality(requestText),
        ]);
        const speciality = suggestion.speciality ?? 'General Physician';
        const routing = findMatchingDoctors(speciality);

        setResponse(summary);
        setRoutingSpeciality(routing.speciality);
        setMatchedDoctors(routing.doctors);
      } else if (mode === 'prescription') {
        const [medicationName, ...instructionParts] = requestText.split(/\r?\n/);
        const explanation = await aiService.explainPrescription(
          medicationName.trim(),
          instructionParts.join(' ').trim() || undefined
        );

        setResponse(explanation);
      } else {
        setResponse(await aiService.explainRecord('Patient care plan', requestText));
      }
    } catch {
      setError("I couldn't process that right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientScreen title="Arogya AI" subtitle="Tell me what you need help with.">
      <Card contentStyle={styles.inputCard}>
        <SectionHeader title={modeTitle(mode)} />
        {mode === 'record' && !input ? (
          <AppText variant="caption" color="textSecondary">
            A summary from your saved care plan will be explained.
          </AppText>
        ) : null}
        <TextInput
          accessibilityLabel="Describe your health concern"
          editable={!isOffline}
          multiline
          numberOfLines={4}
          onChangeText={(value) => {
            setInput(value);
            setError(null);
          }}
          placeholder={placeholderForMode(mode)}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          textAlignVertical="top"
          value={input}
        />
        {isOffline ? (
          <AppText variant="caption" color="textSecondary">
            Arogya AI needs an internet connection.
          </AppText>
        ) : null}
        {error ? <AppText variant="caption" color="danger">{error}</AppText> : null}
        <AppButton
          disabled={isOffline || isLoading}
          fullWidth
          loading={isLoading}
          onPress={() => void handleAsk()}
          accessibilityLabel="Ask Arogya AI"
        >
          Ask Arogya AI
        </AppButton>
      </Card>

      <View style={styles.actionGrid}>
        <ActionCard
          icon={<PatientIcon name={{ android: 'medical_information', web: 'medical_information' }} />}
          label="Health Concern"
          description="Organize a symptom or question"
          onPress={() => chooseMode('concern')}
          style={[styles.actionCard, mode === 'concern' && styles.activeAction]}
        />
        <ActionCard
          icon={<PatientIcon name={{ android: 'medication', web: 'medication' }} />}
          label="Explain Prescription"
          description="Understand existing doctor instructions"
          onPress={() => chooseMode('prescription')}
          style={[styles.actionCard, mode === 'prescription' && styles.activeAction]}
        />
        <ActionCard
          icon={<PatientIcon name={{ android: 'summarize', web: 'summarize' }} />}
          label="Explain My Records"
          description="Understand your saved care information"
          onPress={() => chooseMode('record')}
          style={[styles.actionCard, mode === 'record' && styles.activeAction]}
        />
      </View>

      {isLoading ? <LoadingState message="Understanding your concern..." /> : null}
      {emergency ? (
        <Card contentStyle={styles.emergencyCard}>
          <AppText variant="title" color="danger">Urgent medical attention</AppText>
          <AppText variant="body" color="danger">{emergencyCareMessage}</AppText>
        </Card>
      ) : null}
      {response ? (
        <Card contentStyle={styles.responseCard}>
          <SectionHeader
            title={mode === 'concern' ? 'Understanding your concern' : mode === 'prescription' ? 'Simple Explanation' : 'Record Explanation'}
          />
          <AppText variant="body">{response.text}</AppText>
          {mode === 'concern' && response.speciality ? (
            <View style={styles.suggestionBlock}>
              <AppText variant="bodyStrong">Suggested care</AppText>
              <StatusBadge status="info">{response.speciality}</StatusBadge>
              <AppText variant="caption" color="textSecondary">
                A specialist may be appropriate for this concern. A qualified clinician can guide the next step.
              </AppText>
            </View>
          ) : null}
          {mode === 'prescription' ? (
            <AppText variant="caption" color="textSecondary">
              Follow the prescription given by your doctor.
            </AppText>
          ) : null}
        </Card>
      ) : null}
      {mode === 'concern' && response && routingSpeciality ? (
        <View style={styles.doctorSection}>
          <SectionHeader title="Available Doctors" subtitle={`Showing ${routingSpeciality} options`} />
          {matchedDoctors.length === 0 ? (
            <EmptyState title="No matching doctor is currently available in ArogyaLink." />
          ) : (
            matchedDoctors.map((doctor) => (
              <Card key={doctor.id} contentStyle={styles.doctorCard}>
                <AppText variant="title">{doctor.fullName}</AppText>
                <AppText variant="body" color="textSecondary">{doctor.specialization}</AppText>
                <AppText variant="bodyStrong">{doctor.clinicName}</AppText>
                <AppText variant="body" color="textSecondary">{doctor.city}</AppText>
                <StatusBadge status={doctor.available ? 'success' : 'neutral'}>
                  {doctor.available ? 'Available' : 'Currently unavailable'}
                </StatusBadge>
                <AppText variant="caption" color="textSecondary">
                  {doctor.availability.map((item) => `${item.date}: ${item.times.join(', ')}`).join(' | ')}
                </AppText>
                <AppButton
                  variant="secondary"
                  onPress={() =>
                    router.push({
                      pathname: '/patient/doctor/[id]/index',
                      params: { id: doctor.id },
                    })
                  }
                  accessibilityLabel={`View ${doctor.fullName}`}
                >
                  View Doctor
                </AppButton>
              </Card>
            ))
          )}
        </View>
      ) : null}

      <Card>
        <AppText variant="caption" color="textSecondary" style={styles.safetyNote}>
          Arogya AI provides general health support and does not replace a doctor&apos;s diagnosis.
        </AppText>
      </Card>
    </PatientScreen>
  );
}

function findMatchingDoctors(speciality: AISpeciality) {
  const availableDoctors = doctorRepository.list().filter((doctor) => doctor.available);
  const exactDoctors = availableDoctors.filter((doctor) => matchesSpeciality(doctor, speciality));

  if (exactDoctors.length > 0) {
    return { doctors: exactDoctors, speciality };
  }

  const generalDoctors = availableDoctors.filter((doctor) =>
    matchesSpeciality(doctor, 'General Physician')
  );

  return { doctors: generalDoctors, speciality: 'General Physician' as const };
}

function matchesSpeciality(doctor: Doctor, speciality: AISpeciality) {
  const value = doctor.specialization.toLowerCase();

  if (speciality === 'General Physician') {
    return /general|family|primary/.test(value);
  }

  return value.includes(speciality.toLowerCase());
}

function buildRecordContext(
  patient: ReturnType<typeof usePatientOfflineData>['patient'],
  items: ReturnType<typeof usePatientOfflineData>['carePlanItems'],
  carePlanStatus?: string
) {
  const conditions = patient?.conditions.join(', ') || 'No conditions recorded';
  const careItems = items.map((item) => item.title).join(', ') || 'No care-plan items recorded';

  return `Patient conditions: ${conditions}. Active care plan status: ${carePlanStatus ?? 'not recorded'}. Care-plan items: ${careItems}.`;
}

function modeTitle(mode: AIMode) {
  if (mode === 'prescription') return 'Explain a prescription';
  if (mode === 'record') return 'Explain my records';
  return 'Describe your health concern';
}

function placeholderForMode(mode: AIMode) {
  if (mode === 'prescription') return 'Metformin 500 mg\nAfter breakfast';
  if (mode === 'record') return 'Add a record detail, or use your saved care-plan summary.';
  return 'I have itching on my skin for two days.';
}

const styles = StyleSheet.create({
  actionCard: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  activeAction: {
    borderColor: colors.primary,
  },
  doctorCard: {
    gap: spacing.sm,
  },
  doctorSection: {
    gap: spacing.md,
  },
  emergencyCard: {
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  input: {
    minHeight: 120,
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    padding: spacing.md,
  },
  inputCard: {
    gap: spacing.md,
  },
  responseCard: {
    gap: spacing.lg,
  },
  safetyNote: {
    textAlign: 'center',
  },
  suggestionBlock: {
    gap: spacing.sm,
  },
});

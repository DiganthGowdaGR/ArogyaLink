import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { mockSeed } from '@/data/mockSeed';
import type { CarePlanItem, CarePlanItemType } from '@/domain';
import {
  carePlanRepository,
  careTaskRepository,
  doctorRepository,
  patientRepository,
} from '@/repositories';
import { colors, radius, spacing, typography } from '@/theme';

type Draft = {
  title: string;
  dosage: string;
  instructions: string;
  durationDays: string;
  scheduledTimes: string;
  dueAt: string;
  speciality: string;
};

const emptyDraft: Draft = {
  title: '',
  dosage: '',
  instructions: '',
  durationDays: '',
  scheduledTimes: '',
  dueAt: '',
  speciality: '',
};

const itemTypes: { type: CarePlanItemType; label: string }[] = [
  { type: 'medication', label: 'Add Medication' },
  { type: 'test', label: 'Add Test' },
  { type: 'referral', label: 'Add Referral' },
  { type: 'followUp', label: 'Add Follow-up' },
];

export default function DoctorCarePlanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = id ?? demoIdentities.patientId;
  const patient = patientRepository.getById(patientId);
  const doctor = doctorRepository.getById(demoIdentities.doctorId);
  const activeCarePlan = patient
    ? carePlanRepository.getActiveByPatient(patient.id)
    : undefined;
  const [savedItems, setSavedItems] = useState<CarePlanItem[]>(() =>
    activeCarePlan ? carePlanRepository.listItemsByCarePlan(activeCarePlan.id) : []
  );
  const [pendingItems, setPendingItems] = useState<CarePlanItem[]>([]);
  const [selectedType, setSelectedType] = useState<CarePlanItemType>('medication');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!patient) {
    return (
      <DoctorScreen title="Care Plan">
        <EmptyState title="Patient not found" description="This patient record is unavailable." />
      </DoctorScreen>
    );
  }

  const updateDraft = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleAddItem = () => {
    const title = selectedType === 'referral' ? draft.speciality.trim() : draft.title.trim();

    if (!title) {
      setError(
        selectedType === 'medication'
          ? 'Enter a medicine name.'
          : selectedType === 'test'
            ? 'Enter a test name.'
            : selectedType === 'referral'
              ? 'Enter a referral speciality.'
              : 'Enter a follow-up title.'
      );
      return;
    }

    const durationDays = Number.parseInt(draft.durationDays, 10);

    if (selectedType === 'medication' && (!Number.isFinite(durationDays) || durationDays <= 0)) {
      setError('Enter a valid medication duration in days.');
      return;
    }

    const scheduledTimes = draft.scheduledTimes
      .split(',')
      .map((time) => time.trim())
      .filter(Boolean);
    const item: CarePlanItem = {
      id: `draft-care-plan-item-${Date.now()}-${pendingItems.length}`,
      carePlanId: activeCarePlan?.id ?? 'pending-care-plan',
      type: selectedType,
      title,
      instructions: draft.instructions.trim() || undefined,
      dueAt: draft.dueAt.trim() || undefined,
      status: 'pending',
      dosage: selectedType === 'medication' ? draft.dosage.trim() || undefined : undefined,
      scheduledTimes: selectedType === 'medication' ? scheduledTimes : undefined,
      durationDays: selectedType === 'medication' ? durationDays : undefined,
      speciality: selectedType === 'referral' ? draft.speciality.trim() : undefined,
    };

    setPendingItems((current) => [...current, item]);
    setDraft(emptyDraft);
    setError(null);
    setSuccess(null);
  };

  const handleSave = () => {
    if (!pendingItems.length && !activeCarePlan) {
      setError('Add at least one care-plan item before saving.');
      return;
    }

    const carePlan =
      activeCarePlan ??
      carePlanRepository.create({
        id: `care-plan-${Date.now()}`,
        consultationId:
          mockSeed.consultations.find((consultation) => consultation.patientId === patient.id)?.id ??
          `consultation-${patient.id}-care-plan`,
        patientId: patient.id,
        doctorId: doctor?.id ?? demoIdentities.doctorId,
        createdAt: new Date().toISOString(),
        status: 'active',
      });
    const createdItems = pendingItems.map((item) =>
      carePlanRepository.createItem({ ...item, carePlanId: carePlan.id })
    );

    createdItems.forEach((item) => generateCareTasks(item, patient.id));
    setSavedItems((current) => [...current, ...createdItems]);
    setPendingItems([]);
    setError(null);
    setSuccess('Care plan saved. Care tasks were generated for the patient.');
  };

  return (
    <DoctorScreen
      title="Care Plan"
      subtitle={`${patient.fullName} - ${doctor?.fullName ?? 'Doctor'}`}
    >
      <Card contentStyle={styles.identityContent}>
        <View>
          <AppText variant="caption" color="textSecondary">
            Patient
          </AppText>
          <AppText variant="title">{patient.fullName}</AppText>
          <AppText variant="body" color="textSecondary">
            {patient.age} / {patient.gender} - {patient.id}
          </AppText>
        </View>
        <View>
          <AppText variant="caption" color="textSecondary">
            Doctor
          </AppText>
          <AppText variant="bodyStrong">{doctor?.fullName ?? 'Doctor'}</AppText>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Care Plan Items" subtitle="Saved items and their current status" />
        {savedItems.length === 0 && pendingItems.length === 0 ? (
          <EmptyState title="No items yet" description="Add the first item to this care plan." />
        ) : (
          [...savedItems, ...pendingItems].map((item) => (
            <CarePlanItemCard key={item.id} item={item} pending={pendingItems.includes(item)} />
          ))
        )}
      </View>

      <Card contentStyle={styles.formContent}>
        <SectionHeader title="Add Care Item" subtitle="Choose one item type at a time" />
        <View style={styles.typeGrid}>
          {itemTypes.map((itemType) => (
            <AppButton
              key={itemType.type}
              variant={selectedType === itemType.type ? 'secondary' : 'outline'}
              onPress={() => {
                setSelectedType(itemType.type);
                setError(null);
              }}
              accessibilityLabel={itemType.label}
              style={styles.typeButton}
            >
              {itemType.label}
            </AppButton>
          ))}
        </View>

        <FormField
          label={selectedType === 'referral' ? 'Speciality' : selectedType === 'test' ? 'Test name' : selectedType === 'followUp' ? 'Follow-up title' : 'Medicine name'}
          placeholder={selectedType === 'referral' ? 'e.g. Cardiology' : 'Enter a name'}
          value={selectedType === 'referral' ? draft.speciality : draft.title}
          onChangeText={(value) => updateDraft(selectedType === 'referral' ? 'speciality' : 'title', value)}
        />

        {selectedType === 'medication' ? (
          <>
            <FormField label="Dosage" placeholder="e.g. 500 mg" value={draft.dosage} onChangeText={(value) => updateDraft('dosage', value)} />
            <FormField label="Instructions" placeholder="e.g. Take after breakfast" value={draft.instructions} onChangeText={(value) => updateDraft('instructions', value)} multiline />
            <FormField label="Duration in days" placeholder="e.g. 7" value={draft.durationDays} onChangeText={(value) => updateDraft('durationDays', value)} />
            <FormField label="Scheduled times" placeholder="e.g. 08:00, 20:00" value={draft.scheduledTimes} onChangeText={(value) => updateDraft('scheduledTimes', value)} />
          </>
        ) : (
          <>
            <FormField label="Instructions" placeholder="Optional instructions" value={draft.instructions} onChangeText={(value) => updateDraft('instructions', value)} multiline />
            <FormField label="Due date / time" placeholder="e.g. 2026-08-30T10:00" value={draft.dueAt} onChangeText={(value) => updateDraft('dueAt', value)} />
          </>
        )}

        {error ? <AppText color="danger" variant="caption">{error}</AppText> : null}
        {success ? <AppText color="success" variant="caption">{success}</AppText> : null}
        <AppButton onPress={handleAddItem} accessibilityLabel="Add care-plan item">
          {itemTypes.find((itemType) => itemType.type === selectedType)?.label ?? 'Add Item'}
        </AppButton>
        <AppButton variant="secondary" onPress={handleSave} accessibilityLabel="Save care plan">
          {activeCarePlan ? 'Update Care Plan' : 'Save Care Plan'}
        </AppButton>
        <AppButton variant="outline" onPress={() => router.back()} accessibilityLabel="Back to patient">
          Back to Patient
        </AppButton>
      </Card>
    </DoctorScreen>
  );
}

function CarePlanItemCard({ item, pending }: { item: CarePlanItem; pending: boolean }) {
  return (
    <Card contentStyle={styles.itemContent}>
      <View style={styles.itemHeader}>
        <View style={styles.itemCopy}>
          <AppText variant="title">{item.title}</AppText>
          <AppText variant="caption" color="textSecondary">
            {item.type}
          </AppText>
        </View>
        <StatusBadge status={pending ? 'info' : 'success'}>
          {pending ? 'ready to save' : item.status}
        </StatusBadge>
      </View>
      {item.dosage ? <AppText variant="body">Dosage: {item.dosage}</AppText> : null}
      {item.instructions ? <AppText variant="body" color="textSecondary">{item.instructions}</AppText> : null}
      {item.scheduledTimes?.length ? <AppText variant="caption" color="textSecondary">Times: {item.scheduledTimes.join(', ')}</AppText> : null}
      {item.durationDays ? <AppText variant="caption" color="textSecondary">Duration: {item.durationDays} days</AppText> : null}
      {item.dueAt ? <AppText variant="caption" color="textSecondary">Due: {item.dueAt}</AppText> : null}
    </Card>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <AppText variant="caption" color="textSecondary">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function generateCareTasks(item: CarePlanItem, patientId: string) {
  // MVP strategy: medication creates only today's scheduled tasks; other items create one due task.
  const scheduledTimes =
    item.type === 'medication' ? item.scheduledTimes?.slice(0, 3) ?? ['09:00'] : [item.dueAt ?? new Date().toISOString()];
  const today = new Date().toISOString().slice(0, 10);

  scheduledTimes.forEach((scheduledAt, index) => {
    const taskTime = item.type === 'medication' ? `${today}T${scheduledAt}:00.000Z` : scheduledAt;

    careTaskRepository.create({
      id: `${item.id}-task-${index}`,
      patientId,
      carePlanItemId: item.id,
      type: item.type,
      scheduledAt: taskTime,
      status: 'pending',
    });
  });
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: spacing.xs,
  },
  formContent: {
    gap: spacing.md,
  },
  identityContent: {
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
  itemContent: {
    gap: spacing.sm,
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  multilineInput: {
    minHeight: 88,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  section: {
    gap: spacing.md,
  },
  typeButton: {
    flexGrow: 1,
    flexBasis: '45%',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

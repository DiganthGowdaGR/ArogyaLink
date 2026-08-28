import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppButton, AppText, Card, EmptyState, SectionHeader, StatusBadge } from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { appointmentRepository, doctorRepository } from '@/repositories';
import { colors, radius, spacing, typography } from '@/theme';
import { useConnectivity } from '@/services/connectivity';

const commonReasons = [
  'Diabetes follow-up',
  'Fever',
  'Skin concern',
  'General consultation',
];

export default function PatientBookAppointmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOffline } = useConnectivity();
  const doctor = id ? doctorRepository.getById(id) : undefined;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!doctor) {
    return (
      <PatientScreen title="Book Appointment">
        <EmptyState title="Doctor not found" description="This doctor profile is unavailable." />
      </PatientScreen>
    );
  }

  const activeDate = selectedDate || doctor.availability[0]?.date || '';
  const availableTimes = doctor.availability.find((availability) => availability.date === activeDate)?.times ?? [];

  const handleSubmit = () => {
    if (isOffline) {
      setError('Internet connection required to request a new appointment.');
      return;
    }

    const visitReason = reason.trim();

    if (!activeDate || !selectedTime || !visitReason) {
      setError('Choose a date, time, and reason for your visit.');
      return;
    }

    if (!appointmentRepository.isSlotAvailable(doctor.id, activeDate, selectedTime)) {
      setError('This time slot is no longer available. Please choose another time.');
      return;
    }

    appointmentRepository.create({
      id: `appointment-${demoIdentities.patientId}-${doctor.id}-${activeDate}-${selectedTime}`,
      patientId: demoIdentities.patientId,
      doctorId: doctor.id,
      date: activeDate,
      time: selectedTime,
      reason: visitReason,
      status: 'requested',
    });
    setError(null);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PatientScreen title="Appointment Request Sent">
        <Card contentStyle={styles.successContent}>
          <StatusBadge status="success">Requested</StatusBadge>
          <AppText variant="heading" style={styles.centerText}>{doctor.fullName}</AppText>
          <AppText variant="bodyStrong" style={styles.centerText}>
            {activeDate} · {selectedTime}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.centerText}>
            Your request has been sent to the doctor. You will see the confirmation here once the doctor accepts it.
          </AppText>
          <AppButton
            fullWidth
            onPress={() => router.replace('/patient/appointments')}
            accessibilityLabel="View my appointments"
          >
            View My Appointments
          </AppButton>
        </Card>
      </PatientScreen>
    );
  }

  return (
    <PatientScreen title="Book Appointment" subtitle={`${doctor.fullName} - ${doctor.clinicName}`}>
      <Card contentStyle={styles.doctorSummary}>
        <AppText variant="title">{doctor.fullName}</AppText>
        <AppText variant="body" color="textSecondary">{doctor.specialization}</AppText>
        <AppText variant="body" color="textSecondary">{doctor.clinicName} - {doctor.city}</AppText>
      </Card>

      <Card contentStyle={styles.formContent}>
        <SectionHeader title="Select Date" />
        <View style={styles.optionGrid}>
          {doctor.availability.map((availability) => (
            <AppButton
              key={availability.date}
              variant={activeDate === availability.date ? 'secondary' : 'outline'}
              onPress={() => {
                setSelectedDate(availability.date);
                setSelectedTime('');
                setError(null);
              }}
              style={styles.optionButton}
              accessibilityLabel={`Select ${availability.date}`}
            >
              {formatDate(availability.date)}
            </AppButton>
          ))}
        </View>

        <SectionHeader title="Available Time" subtitle="Select one large time slot" />
        <View style={styles.optionGrid}>
          {availableTimes.map((time) => (
            <AppButton
              key={time}
              variant={selectedTime === time ? 'secondary' : 'outline'}
              onPress={() => {
                setSelectedTime(time);
                setError(null);
              }}
              style={styles.optionButton}
              accessibilityLabel={`Select ${time}`}
            >
              {formatTime(time)}
            </AppButton>
          ))}
        </View>

        <SectionHeader title="Reason for Visit" />
        <View style={styles.reasonOptions}>
          {commonReasons.map((commonReason) => (
            <AppButton
              key={commonReason}
              variant={reason === commonReason ? 'secondary' : 'outline'}
              onPress={() => {
                setReason(commonReason);
                setError(null);
              }}
              accessibilityLabel={commonReason}
            >
              {commonReason}
            </AppButton>
          ))}
        </View>
        <TextInput
          accessibilityLabel="Reason for visit"
          onChangeText={(value) => {
            setReason(value);
            setError(null);
          }}
          placeholder="Or type a short reason"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          value={reason}
        />

        {isOffline ? (
          <AppText variant="caption" color="textSecondary">
            Internet connection required to request a new appointment.
          </AppText>
        ) : null}
        {error ? <AppText variant="caption" color="danger">{error}</AppText> : null}
        <AppButton
          fullWidth
          disabled={isOffline}
          onPress={handleSubmit}
          accessibilityLabel="Request appointment"
        >
          Request Appointment
        </AppButton>
      </Card>
    </PatientScreen>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date(2026, 0, 1, hours, minutes);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  doctorSummary: {
    gap: spacing.xs,
  },
  formContent: {
    gap: spacing.lg,
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
  optionButton: {
    flexGrow: 1,
    flexBasis: '42%',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reasonOptions: {
    gap: spacing.sm,
  },
  successContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
});

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { mockSeed } from '@/data/mockSeed';
import type {
  AdherenceEvent,
  Appointment,
  CarePlan,
  CarePlanItem,
  CareTask,
  CareTaskStatus,
  Consultation,
  Doctor,
  Patient,
} from '@/domain';
import {
  adherenceRepository,
  appointmentRepository,
  carePlanRepository,
  careTaskRepository,
  doctorRepository,
  patientRepository,
} from '@/repositories';
import { useConnectivity } from '@/services/connectivity';
import {
  listPendingActions,
  processPendingActions,
  type PendingSyncAction,
} from '@/services/offlineSync';

import {
  readPatientSnapshot,
  refreshPatientSnapshot,
  writePatientSnapshot,
  type OfflinePatientSnapshot,
} from './patientCache';

type OfflineTaskUpdate = {
  taskId: string;
  status: Exclude<CareTaskStatus, 'pending'>;
  recordedAt: string;
  adherenceEventId: string;
  adherenceStatus?: 'onTime' | 'late' | 'missed';
  reason?: string;
};

type PatientOfflineDataContextValue = {
  isOffline: boolean;
  isCacheLoading: boolean;
  isCached: boolean;
  cachedAt?: string;
  patient?: Patient;
  doctor?: Doctor;
  carePlan?: CarePlan;
  carePlanItems: CarePlanItem[];
  careTasks: CareTask[];
  adherenceEvents: AdherenceEvent[];
  appointments: Appointment[];
  consultations: Consultation[];
  refreshCache: () => Promise<void>;
  pendingActions: PendingSyncAction[];
  pendingSyncCount: number;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  refreshPendingActions: () => Promise<void>;
  updateCachedTask: (update: OfflineTaskUpdate) => Promise<void>;
};

const PatientOfflineDataContext = createContext<PatientOfflineDataContextValue | null>(null);

export function PatientOfflineDataProvider({ children }: { children: ReactNode }) {
  const { isOffline, isReady } = useConnectivity();
  const [cachedSnapshot, setCachedSnapshot] = useState<OfflinePatientSnapshot | null>(null);
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingSyncAction[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const previousOffline = useRef<boolean | null>(null);

  const refreshPendingActions = useCallback(async () => {
    setPendingActions(await listPendingActions());
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let active = true;
    const wasOffline = previousOffline.current;
    previousOffline.current = isOffline;

    async function synchronizeCache() {
      setIsCacheLoading(true);

      if (isOffline) {
        const [snapshot, actions] = await Promise.all([
          readPatientSnapshot(),
          listPendingActions(),
        ]);

        if (active) {
          setCachedSnapshot(snapshot);
          setPendingActions(actions);
          setSyncStatus('idle');
        }
      } else {
        let syncResult: { processed: number; failed: number; remaining: number } | undefined;

        if (wasOffline) {
          setSyncStatus('syncing');
          syncResult = await processPendingActions();
        }

        const [snapshot, actions] = await Promise.all([
          refreshPatientSnapshot(),
          listPendingActions(),
        ]);

        if (active) {
          setCachedSnapshot(snapshot);
          setPendingActions(actions);
          if (syncResult?.failed) {
            setSyncStatus('error');
          } else if (syncResult?.processed) {
            setSyncStatus('synced');
            setTimeout(() => {
              if (active) {
                setSyncStatus('idle');
              }
            }, 3000);
          } else {
            setSyncStatus('idle');
          }
        }
      }

      if (active) {
        setIsCacheLoading(false);
      }
    }

    void synchronizeCache();

    return () => {
      active = false;
    };
  }, [isOffline, isReady]);

  const refreshCache = useCallback(async () => {
    if (isOffline) {
      return;
    }

    const snapshot = await refreshPatientSnapshot();
    setCachedSnapshot(snapshot);
  }, [isOffline]);

  const updateCachedTask = useCallback(
    async (update: OfflineTaskUpdate) => {
      if (!isOffline || !cachedSnapshot) {
        return;
      }

      const task = cachedSnapshot.careTasks.find((careTask) => careTask.id === update.taskId);

      if (!task) {
        return;
      }

      const updatedTask =
        update.status === 'completed'
          ? { ...task, status: update.status, completedAt: update.recordedAt }
          : { ...task, status: update.status, completedAt: undefined };
      const event: AdherenceEvent = {
        id: update.adherenceEventId,
        careTaskId: task.id,
        patientId: cachedSnapshot.patient.id,
        recordedAt: update.recordedAt,
        status: update.adherenceStatus ?? 'missed',
        reason: update.reason,
      };
      const nextSnapshot: OfflinePatientSnapshot = {
        ...cachedSnapshot,
        cachedAt: new Date().toISOString(),
        careTasks: cachedSnapshot.careTasks.map((careTask) =>
          careTask.id === task.id ? updatedTask : careTask
        ),
        adherenceEvents: [
          event,
          ...cachedSnapshot.adherenceEvents.filter(
            (adherenceEvent) => adherenceEvent.id !== event.id
          ),
        ],
      };

      await writePatientSnapshot(nextSnapshot);
      setCachedSnapshot(nextSnapshot);
    },
    [cachedSnapshot, isOffline]
  );

  const snapshot = isOffline ? cachedSnapshot : null;
  const liveCarePlan = carePlanRepository.getActiveByPatient('patient-001');
  const liveAppointments = appointmentRepository.listByPatient('patient-001');
  const liveDoctor = liveCarePlan ? doctorRepository.getById(liveCarePlan.doctorId) : undefined;

  const value = useMemo<PatientOfflineDataContextValue>(
    () => ({
      isOffline,
      isCacheLoading,
      isCached: Boolean(isOffline && snapshot),
      cachedAt: isOffline ? snapshot?.cachedAt : undefined,
      patient: isOffline ? snapshot?.patient : patientRepository.getById('patient-001'),
      doctor: isOffline ? snapshot?.doctor ?? undefined : liveDoctor,
      carePlan: isOffline ? snapshot?.carePlan ?? undefined : liveCarePlan ?? undefined,
      carePlanItems: isOffline
        ? snapshot?.carePlanItems ?? []
        : liveCarePlan
          ? carePlanRepository.listItemsByCarePlan(liveCarePlan.id)
          : [],
      careTasks: isOffline
        ? snapshot?.careTasks ?? []
        : careTaskRepository.listByPatient('patient-001'),
      adherenceEvents: isOffline
        ? snapshot?.adherenceEvents ?? []
        : adherenceRepository.listByPatient('patient-001'),
      appointments: isOffline ? snapshot?.appointments ?? [] : liveAppointments,
      consultations: isOffline
        ? snapshot?.consultations ?? []
        : mockSeed.consultations.filter(
            (consultation) => consultation.patientId === 'patient-001'
          ),
      refreshCache,
      pendingActions,
      pendingSyncCount: pendingActions.length,
      syncStatus,
      refreshPendingActions,
      updateCachedTask,
    }),
    [
      isCacheLoading,
      isOffline,
      liveAppointments,
      liveCarePlan,
      liveDoctor,
      pendingActions,
      refreshPendingActions,
      refreshCache,
      snapshot,
      syncStatus,
      updateCachedTask,
    ]
  );

  return (
    <PatientOfflineDataContext.Provider value={value}>
      {children}
    </PatientOfflineDataContext.Provider>
  );
}

export function usePatientOfflineData() {
  const context = useContext(PatientOfflineDataContext);

  if (!context) {
    throw new Error('usePatientOfflineData must be used inside PatientOfflineDataProvider');
  }

  return context;
}

import type {
  AttentionItem,
  AttentionItemType,
  AttentionSeverity,
  CarePlanItemType,
  CareTask,
} from '@/domain';
import {
  adherenceRepository,
  attentionRepository,
  carePlanRepository,
  careTaskRepository,
} from '@/repositories';

type AttentionRule = {
  type: AttentionItemType;
  severity: AttentionSeverity;
  title: string;
  description: string;
  sourceKey: string;
  careTask?: CareTask;
};

export function evaluateAttentionForPatient(patientId: string) {
  const carePlans = carePlanRepository.getByPatient(patientId);
  const carePlanItems = carePlans.flatMap((carePlan) =>
    carePlanRepository.listItemsByCarePlan(carePlan.id).map((item) => ({
      item,
      doctorId: carePlan.doctorId,
    }))
  );
  const itemById = new Map(carePlanItems.map(({ item }) => [item.id, item]));
  const doctorId = carePlans[0]?.doctorId;

  if (!doctorId) {
    return [];
  }

  const careTasks = careTaskRepository.listByPatient(patientId);
  const adherenceEvents = adherenceRepository.listByPatient(patientId);
  const rules: AttentionRule[] = [];

  adherenceEvents.forEach((event) => {
    if (event.status !== 'missed') {
      return;
    }

    const task = careTasks.find((careTask) => careTask.id === event.careTaskId);

    if (task?.type !== 'medication') {
      return;
    }

    if (event.reason === 'Medicine unavailable') {
      rules.push({
        type: 'medication_access',
        severity: 'warning',
        title: 'Medicine unavailable',
        description: 'Patient reported that prescribed medicine was unavailable.',
        sourceKey: event.careTaskId,
        careTask: task,
      });
    }

    if (event.reason === 'Felt unwell / possible side effect') {
      rules.push({
        type: 'possible_side_effect',
        severity: 'high',
        title: 'Possible medication side effect',
        description: 'Patient reported feeling unwell while following treatment.',
        sourceKey: event.careTaskId,
        careTask: task,
      });
    }
  });

  const missedMedicationEvents = adherenceEvents.filter((event) => {
    const task = careTasks.find((careTask) => careTask.id === event.careTaskId);
    return event.status === 'missed' && task?.type === 'medication';
  });

  if (missedMedicationEvents.length >= 2) {
    rules.push({
      type: 'repeated_missed_medication',
      severity: 'warning',
      title: 'Repeated missed medication',
      description: 'Patient has multiple missed medication confirmations.',
      sourceKey: 'patient',
    });
  }

  careTasks.forEach((task) => {
    const item = itemById.get(task.carePlanItemId);

    if (task.status !== 'pending' || !item || new Date(task.scheduledAt) >= new Date()) {
      return;
    }

    const overdueRule = overdueRuleForItem(item.type, task);

    if (overdueRule) {
      rules.push(overdueRule);
    }
  });

  const created: AttentionItem[] = [];
  rules.forEach((rule) => {
    const id = `${patientId}-${rule.type}-${rule.sourceKey}`;
    const existing = attentionRepository.list().find((item) => item.id === id);

    if (existing) {
      return;
    }

    const attentionItem: AttentionItem = {
      id,
      patientId,
      doctorId,
      type: rule.type,
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    created.push(attentionRepository.create(attentionItem));
  });

  return created;
}

export function evaluateAttentionForDoctor(doctorId: string) {
  const patientIds = carePlanRepository
    .list()
    .filter((carePlan) => carePlan.doctorId === doctorId)
    .map((carePlan) => carePlan.patientId);

  return [...new Set(patientIds)].flatMap((patientId) =>
    evaluateAttentionForPatient(patientId)
  );
}

function overdueRuleForItem(type: CarePlanItemType, task: CareTask): AttentionRule | undefined {
  const rules: Partial<Record<AttentionItemType, Omit<AttentionRule, 'sourceKey' | 'careTask'>>> = {
    overdue_test: {
      type: 'overdue_test',
      severity: 'warning',
      title: 'Overdue test',
      description: 'A scheduled test is overdue and still pending.',
    },
    overdue_referral: {
      type: 'overdue_referral',
      severity: 'warning',
      title: 'Overdue referral',
      description: 'A scheduled referral is overdue and still pending.',
    },
    overdue_follow_up: {
      type: 'overdue_follow_up',
      severity: 'info',
      title: 'Overdue follow-up',
      description: 'A scheduled follow-up is overdue and still pending.',
    },
  };
  const typeByItemType: Partial<Record<CarePlanItemType, AttentionItemType>> = {
    test: 'overdue_test',
    referral: 'overdue_referral',
    followUp: 'overdue_follow_up',
  };
  const attentionType = typeByItemType[type];
  const rule = attentionType ? rules[attentionType] : undefined;

  return rule
    ? { ...rule, sourceKey: task.id, careTask: task }
    : undefined;
}

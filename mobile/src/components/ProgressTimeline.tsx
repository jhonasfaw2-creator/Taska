import { View } from 'react-native';
import { Typography } from '@/components/ui';

export interface TimelineStep {
  key: string;
  label: string;
}

/**
 * Ordered list of statuses in the standard task lifecycle.
 * Any step before or at the current index is considered "completed".
 */
export const TASK_LIFECYCLE: TimelineStep[] = [
  { key: 'PENDING', label: 'Task Created' },
  { key: 'SEARCHING', label: 'Searching for Tasker' },
  { key: 'ACCEPTED', label: 'Tasker Accepted' },
  { key: 'PICKED_UP', label: 'Item Picked Up' },
  { key: 'IN_PROGRESS', label: 'En Route' },
  { key: 'COMPLETED', label: 'Completed' },
];

/**
 * For the customer-facing progress view (CANCELLED is a terminal status).
 */
const CANCELLED_STEPS: TimelineStep[] = [
  { key: 'CANCELLED', label: 'Cancelled' },
];

interface ProgressTimelineProps {
  currentStatus: string;
  /** Optional override steps (e.g. for cancelled state) */
  steps?: TimelineStep[];
}

/**
 * Find the index of the current status in the step list.
 * Returns the step index if found, or -1 (which shows all as incomplete).
 */
function findStatusIndex(steps: TimelineStep[], status: string): number {
  return steps.findIndex((s) => s.key === status);
}

export function ProgressTimeline({
  currentStatus,
  steps,
}: ProgressTimelineProps) {
  const timeline = currentStatus === 'CANCELLED' ? CANCELLED_STEPS : (steps ?? TASK_LIFECYCLE);
  const currentIdx = findStatusIndex(timeline, currentStatus);

  // If cancelled, show the cancelled step as failed
  if (currentStatus === 'CANCELLED') {
    return (
      <View className="flex-row items-center py-md">
        <View className="items-center" style={{ width: 28 }}>
          <View className="h-6 w-6 items-center justify-center rounded-full border-2 border-red-500 bg-red-100">
            <Typography variant="caption" weight="bold" className="text-red-600" style={{ fontSize: 10 }}>
              ✕
            </Typography>
          </View>
        </View>
        <View className="ml-md flex-1">
          <Typography variant="body" weight="semibold" className="text-red-600">
            Task Cancelled
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View className="py-sm">
      {timeline.map((step, index) => {
        const isCompleted = index <= currentIdx;
        const isCurrent = index === currentIdx;

        return (
          <View key={step.key} className="flex-row">
            {/* Timeline column */}
            <View className="items-center" style={{ width: 28 }}>
              {/* Connector line above */}
              {index > 0 && (
                <View
                  className={`h-7 w-0.5 ${isCompleted ? 'bg-primary' : 'bg-border'}`}
                />
              )}

              {/* Dot */}
              <View
                className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? 'border-primary bg-primary'
                    : 'border-border bg-surface'
                }`}
              >
                {isCompleted ? (
                  <Typography
                    variant="caption"
                    weight="bold"
                    className="text-background"
                    style={{ fontSize: 10 }}
                  >
                    ✓
                  </Typography>
                ) : (
                  <View className="h-2 w-2 rounded-full bg-border" />
                )}
              </View>

              {/* Connector line below */}
              {index < timeline.length - 1 && (
                <View className={`h-7 w-0.5 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
              )}
            </View>

            {/* Label */}
            <View className="ml-md flex-1 justify-center" style={{ marginTop: index === 0 ? 12 : 0 }}>
              <Typography
                variant="body"
                weight={isCompleted ? 'semibold' : 'regular'}
                className={isCompleted ? 'text-primary' : 'text-text-secondary'}
              >
                {step.label}
              </Typography>
              {isCurrent && (
                <Typography variant="caption" color="secondary" className="mt-0.5">
                  Current
                </Typography>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Status badge component matching the STATUS_CONFIG from customer-home.
 */
const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  SEARCHING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Searching' },
  ACCEPTED: { bg: 'bg-primary/10', text: 'text-primary', label: 'Accepted' },
  PICKED_UP: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Picked Up' },
  IN_PROGRESS: { bg: 'bg-primary/10', text: 'text-primary', label: 'In Progress' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  CANCELLED: { bg: 'bg-text-secondary/10', text: 'text-text-secondary', label: 'Cancelled' },
};

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  return (
    <View className={`rounded-full px-sm py-px ${c.bg}`}>
      <Typography
        variant="caption"
        weight="semibold"
        className={c.text}
        style={{ fontSize: 10 }}
      >
        {c.label}
      </Typography>
    </View>
  );
}

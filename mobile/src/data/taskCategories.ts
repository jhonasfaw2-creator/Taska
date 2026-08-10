import type { MobileIconName } from '@/components/Icon';

export interface TaskCategory {
  id: string;
  slug: string;
  title: string;
  icon: MobileIconName;
  description: string;
}

export const TASK_CATEGORIES: TaskCategory[] = [
  {
    id: 'delivery',
    slug: 'delivery',
    title: 'Delivery',
    icon: 'package',
    description: 'Package and item delivery services.',
  },
  {
    id: 'document-processing',
    slug: 'document-processing',
    title: 'Document Processing',
    icon: 'document',
    description: 'Document handling, printing, and processing.',
  },
  {
    id: 'shopping',
    slug: 'shopping',
    title: 'Shopping',
    icon: 'archive',
    description: 'Personal shopping and errand services.',
  },
  {
    id: 'cleaning',
    slug: 'cleaning',
    title: 'Cleaning',
    icon: 'refresh',
    description: 'Home, office, and space cleaning.',
  },
  {
    id: 'moving',
    slug: 'moving',
    title: 'Moving',
    icon: 'package',
    description: 'Moving and relocation assistance.',
  },
  {
    id: 'repair',
    slug: 'repair',
    title: 'Repair',
    icon: 'briefcase',
    description: 'Repair and maintenance services.',
  },
  {
    id: 'grocery',
    slug: 'grocery',
    title: 'Grocery',
    icon: 'archive',
    description: 'Grocery shopping and delivery.',
  },
  {
    id: 'pharmacy',
    slug: 'pharmacy',
    title: 'Pharmacy',
    icon: 'plus',
    description: 'Pharmacy pickup and delivery.',
  },
  {
    id: 'custom-task',
    slug: 'custom-task',
    title: 'Custom Task',
    icon: 'target',
    description: 'Any other task you need help with.',
  },
];

export interface TaskCategory {
  id: string;
  slug: string;
  title: string;
  icon: string;
  description: string;
}

export const TASK_CATEGORIES: TaskCategory[] = [
  {
    id: 'delivery',
    slug: 'delivery',
    title: 'Delivery',
    icon: '🚚',
    description: 'Package and item delivery services.',
  },
  {
    id: 'document-processing',
    slug: 'document-processing',
    title: 'Document Processing',
    icon: '📄',
    description: 'Document handling, printing, and processing.',
  },
  {
    id: 'shopping',
    slug: 'shopping',
    title: 'Shopping',
    icon: '🛒',
    description: 'Personal shopping and errand services.',
  },
  {
    id: 'cleaning',
    slug: 'cleaning',
    title: 'Cleaning',
    icon: '🧹',
    description: 'Home, office, and space cleaning.',
  },
  {
    id: 'moving',
    slug: 'moving',
    title: 'Moving',
    icon: '📦',
    description: 'Moving and relocation assistance.',
  },
  {
    id: 'repair',
    slug: 'repair',
    title: 'Repair',
    icon: '🔧',
    description: 'Repair and maintenance services.',
  },
  {
    id: 'grocery',
    slug: 'grocery',
    title: 'Grocery',
    icon: '🥦',
    description: 'Grocery shopping and delivery.',
  },
  {
    id: 'pharmacy',
    slug: 'pharmacy',
    title: 'Pharmacy',
    icon: '💊',
    description: 'Pharmacy pickup and delivery.',
  },
  {
    id: 'custom-task',
    slug: 'custom-task',
    title: 'Custom Task',
    icon: '✨',
    description: 'Any other task you need help with.',
  },
];

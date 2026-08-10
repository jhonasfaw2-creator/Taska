import type { MobileIconName } from '@/components/Icon';

export interface VehicleOption {
  id: string;
  icon: MobileIconName;
  name: string;
  description: string;
  recommendedFor: string;
}

export const VEHICLES: VehicleOption[] = [
  {
    id: 'walking',
    icon: 'user',
    name: 'Walking',
    description: 'Small items, short distance',
    recommendedFor: 'Best for envelopes, documents, or small parcels within a neighborhood.',
  },
  {
    id: 'motorcycle',
    icon: 'bike',
    name: 'Motorcycle',
    description: 'Documents, small packages',
    recommendedFor: 'Ideal for quick deliveries, food, and lightweight items in traffic.',
  },
  {
    id: 'car',
    icon: 'car',
    name: 'Car',
    description: 'Medium packages',
    recommendedFor: 'Great for grocery runs, standard deliveries, and medium-sized items.',
  },
  {
    id: 'van',
    icon: 'package',
    name: 'Van',
    description: 'Large items',
    recommendedFor: 'Suitable for furniture, home appliances, and bulk shopping.',
  },
  {
    id: 'truck',
    icon: 'package',
    name: 'Truck',
    description: 'Heavy or bulky cargo',
    recommendedFor: 'Perfect for moving heavy equipment, construction materials, or large loads.',
  },
];

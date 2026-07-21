export interface VehicleOption {
  id: string;
  icon: string;
  name: string;
  description: string;
  recommendedFor: string;
}

export const VEHICLES: VehicleOption[] = [
  {
    id: 'walking',
    icon: '🚶',
    name: 'Walking',
    description: 'Small items, short distance',
    recommendedFor: 'Best for envelopes, documents, or small parcels within a neighborhood.',
  },
  {
    id: 'motorcycle',
    icon: '🏍',
    name: 'Motorcycle',
    description: 'Documents, small packages',
    recommendedFor: 'Ideal for quick deliveries, food, and lightweight items in traffic.',
  },
  {
    id: 'car',
    icon: '🚗',
    name: 'Car',
    description: 'Medium packages',
    recommendedFor: 'Great for grocery runs, standard deliveries, and medium-sized items.',
  },
  {
    id: 'van',
    icon: '🚐',
    name: 'Van',
    description: 'Large items',
    recommendedFor: 'Suitable for furniture, home appliances, and bulk shopping.',
  },
  {
    id: 'truck',
    icon: '🚚',
    name: 'Truck',
    description: 'Heavy or bulky cargo',
    recommendedFor: 'Perfect for moving heavy equipment, construction materials, or large loads.',
  },
];

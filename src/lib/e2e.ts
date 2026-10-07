import type { RestaurantTable } from '@/types/reservation';

export const isE2EMock = (): boolean =>
  process.env.E2E_MOCK_RESERVATIONS === '1' ||
  process.env.NEXT_PUBLIC_E2E_MOCK === '1';

/** Valid UUIDs so Zod `z.uuid()` accepts them in the reservation form. */
export const E2E_TABLES: RestaurantTable[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    table_number: 1,
    capacity: 2,
    zone: 'window',
    is_active: true,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    table_number: 4,
    capacity: 6,
    zone: 'vip',
    is_active: true,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    table_number: 6,
    capacity: 4,
    zone: 'hall',
    is_active: true,
  },
];

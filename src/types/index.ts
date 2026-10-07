export type UserRole = 'admin' | 'staff' | 'customer';

export type DishCategory = 'starters' | 'mains' | 'steaks' | 'desserts' | 'drinks';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: DishCategory;
  image: string;
  isHalal: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  calories?: number;
  ingredients?: string[];
  isAvailable: boolean;
}

export type TableStatus = 'available' | 'reserved' | 'occupied';

export type TableZone = 'main_hall' | 'vip_room' | 'terrace' | 'window_side';

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  zone: TableZone;
  status: TableStatus;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tableId: string;
  date: string;
  time: string;
  guestCount: number;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt?: string;
}
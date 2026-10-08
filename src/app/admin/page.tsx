import type { Metadata } from 'next';
import { getAdminPassword, isKitchenAuthed } from '@/lib/admin-auth';
import { listKitchenReservations } from '@/lib/reservation-ops';
import KitchenDesk from '@/components/kitchen/KitchenDesk';
import KitchenGate from '@/components/kitchen/KitchenGate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kitchen desk',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const configured = Boolean(getAdminPassword());
  if (!configured || !(await isKitchenAuthed())) {
    return <KitchenGate configured={configured} />;
  }

  const reservations = await listKitchenReservations();
  return <KitchenDesk reservations={reservations} />;
}

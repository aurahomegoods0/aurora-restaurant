import type { Metadata } from 'next';
import LegalDocument from '@/components/legal/LegalDocument';

export const metadata: Metadata = {
  title: 'Cookie & GDPR Policy',
  description: 'Cookie and GDPR policy for AURORA Restaurant.',
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#070707]">
      <LegalDocument kind="cookies" />
    </main>
  );
}

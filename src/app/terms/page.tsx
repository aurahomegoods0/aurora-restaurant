import type { Metadata } from 'next';
import LegalDocument from '@/components/legal/LegalDocument';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'House rules for dining and reserving at AURORA Restaurant.',
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#070707]">
      <LegalDocument kind="terms" />
    </main>
  );
}

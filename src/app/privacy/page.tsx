import type { Metadata } from 'next';
import LegalDocument from '@/components/legal/LegalDocument';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How AURORA Restaurant collects and uses personal data.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0A0A0A]">
      <LegalDocument kind="privacy" />
    </main>
  );
}

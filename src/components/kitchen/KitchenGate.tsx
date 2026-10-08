'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { kitchenLogin } from '@/app/actions/admin';
import { useLanguage } from '@/context/LanguageContext';

interface KitchenGateProps {
  configured: boolean;
}

const KitchenGate: React.FC<KitchenGateProps> = ({ configured }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!configured) return;
    setPending(true);
    setError(null);
    const result = await kitchenLogin(password);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  };

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-24 pt-28"
    >
      <p className="text-[10px] uppercase tracking-[0.38em] text-[#D4AF37]">
        {t('kitchen.eyebrow')}
      </p>
      <h1 className="mt-3 font-serif text-4xl text-[#F4EDE0]">
        {t('kitchen.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#A89F8C]">
        {configured ? t('kitchen.gateBody') : t('kitchen.unconfigured')}
      </p>

      {configured ? (
        <form onSubmit={onSubmit} className="mt-10">
          <label
            htmlFor="kitchen-password"
            className="text-[10px] uppercase tracking-[0.22em] text-white/45"
          >
            {t('kitchen.password')}
          </label>
          <input
            id="kitchen-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full border-0 border-b border-[#D4AF37]/25 bg-transparent px-0 py-3 text-[#F4EDE0] outline-none focus:border-[#D4AF37]"
          />
          {error ? (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending || password.length === 0}
            className="mt-8 inline-flex min-h-11 items-center bg-[#D4AF37] px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0A0A0A] disabled:opacity-50"
          >
            {pending ? t('kitchen.signingIn') : t('kitchen.signIn')}
          </button>
        </form>
      ) : null}
    </main>
  );
};

export default KitchenGate;

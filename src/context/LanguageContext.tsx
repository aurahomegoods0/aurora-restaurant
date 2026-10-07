'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { restaurantConfig } from '../../restaurant.config';
import uz from '../locales/uz.json';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

export type Language = 'uz' | 'en' | 'ru';

const translations: Record<Language, Record<string, unknown>> = {
  uz,
  en,
  ru,
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const getNestedValue = (
  obj: Record<string, unknown>,
  key: string,
): string => {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : key;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(
    restaurantConfig.defaultLanguage as Language,
  );

  const t = useCallback(
    (key: string) => getNestedValue(translations[language], key),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
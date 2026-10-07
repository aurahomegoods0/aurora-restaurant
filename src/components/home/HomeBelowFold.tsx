'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import LazyMount from '../chrome/LazyMount';

const sectionFallback = (id: string, minHeight = 'min-h-[50vh]') => (
  <section id={id} className={`${minHeight} bg-[#0A0A0A]`} aria-busy="true" />
);

const MenuSection = dynamic(() => import('../menu/MenuSection'), {
  ssr: false,
  loading: () => sectionFallback('menu'),
});

const MenuFlipbook = dynamic(() => import('../flipbook/MenuFlipbook'), {
  ssr: false,
  loading: () => sectionFallback('flipbook'),
});

const AboutSection = dynamic(() => import('../about/AboutSection'), {
  ssr: false,
  loading: () => sectionFallback('about'),
});

const Testimonials = dynamic(() => import('../reviews/Testimonials'), {
  ssr: false,
});

const ReservationSection = dynamic(
  () => import('../reservation/ReservationSection'),
  {
    ssr: false,
    loading: () => sectionFallback('reservation', 'min-h-[80vh]'),
  },
);

const HomeBelowFold: React.FC = () => {
  return (
    <>
      <LazyMount fallback={sectionFallback('menu')}>
        <MenuSection />
      </LazyMount>
      <LazyMount fallback={sectionFallback('flipbook')}>
        <MenuFlipbook />
      </LazyMount>
      <LazyMount fallback={sectionFallback('about')}>
        <AboutSection />
      </LazyMount>
      <LazyMount fallback={<div className="min-h-[40vh] bg-[#0A0A0A]" />}>
        <Testimonials />
      </LazyMount>
      <LazyMount fallback={sectionFallback('reservation', 'min-h-[80vh]')}>
        <ReservationSection />
      </LazyMount>
    </>
  );
};

export default HomeBelowFold;

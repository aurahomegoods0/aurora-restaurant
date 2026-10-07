import React from 'react';
import dynamic from 'next/dynamic';
import Hero from '../components/hero/Hero';
import MenuSection from '../components/menu/MenuSection';
import AboutSection from '../components/about/AboutSection';
import ReservationSection from '../components/reservation/ReservationSection';

const MenuFlipbook = dynamic(
  () => import('../components/flipbook/MenuFlipbook'),
  {
    loading: () => (
      <section
        id="flipbook"
        className="bg-[#0A0A0A] px-4 py-24 text-center text-sm text-white/40"
        aria-busy="true"
      >
        Menyuni ochish…
      </section>
    ),
  },
);

const Testimonials = dynamic(
  () => import('../components/reviews/Testimonials'),
);

const HomePage: React.FC = () => {
  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#0A0A0A]">
      <Hero />
      <MenuSection />
      <MenuFlipbook />
      <AboutSection />
      <Testimonials />
      <ReservationSection />
    </main>
  );
};

export default HomePage;

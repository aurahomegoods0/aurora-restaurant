import React from 'react';
import Hero from '../components/hero/Hero';
import MenuSection from '../components/menu/MenuSection';
import MenuFlipbook from '../components/flipbook/MenuFlipbook';
import ReservationSection from '../components/reservation/ReservationSection';

const HomePage: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Hero />
      <MenuSection />
      <MenuFlipbook />
      <ReservationSection />
    </main>
  );
};

export default HomePage;
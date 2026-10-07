import React from 'react';
import Hero from '../components/hero/Hero';
import HomeBelowFold from '../components/home/HomeBelowFold';

const HomePage: React.FC = () => {
  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#0A0A0A]">
      <Hero />
      <HomeBelowFold />
    </main>
  );
};

export default HomePage;

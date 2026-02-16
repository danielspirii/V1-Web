
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#B1EF42] selection:text-black">
      <Navbar />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
};

export default App;

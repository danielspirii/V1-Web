
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Demo from './components/Demo';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-[#B1EF42] selection:text-black">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

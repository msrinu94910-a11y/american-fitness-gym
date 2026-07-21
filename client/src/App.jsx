import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import MobileBottomBar from './components/layout/MobileBottomBar';
import Footer from './components/layout/Footer';
import ToastContainer from './components/common/ToastContainer';
import { ArticleModal } from './components/common/Modals';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import MembershipsPage from './pages/MembershipsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />;
      case 'services':
        return <ServicesPage setActivePage={setActivePage} />;
      case 'about':
        return <AboutPage setActivePage={setActivePage} />;
      case 'memberships':
        return <MembershipsPage setActivePage={setActivePage} />;
      case 'blog':
        return <BlogPage />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage setActivePage={setActivePage} />;
      case 'register':
        return <RegisterPage setActivePage={setActivePage} />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        
        <main style={{ flex: 1 }}>
          {renderPage()}
        </main>

        <Footer setActivePage={setActivePage} />
        
        {/* Mobile Bottom App Navigation Bar */}
        <MobileBottomBar activePage={activePage} setActivePage={setActivePage} />

        {/* Global Modals & Notifications */}
        <ArticleModal />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}

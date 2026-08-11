import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import MobileBottomBar from './components/layout/MobileBottomBar';
import Footer from './components/layout/Footer';
import ToastContainer from './components/common/ToastContainer';
import { ArticleModal, DayPassModal, ClassReservationModal } from './components/common/Modals';

import HomePage from './pages/HomePage';
import ClassesPage from './pages/ClassesPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import MembershipsPage from './pages/MembershipsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MobileScannerPage from './pages/MobileScannerPage';

function MainAppLayout({ activePage, setActivePage }) {
  const { user } = useApp();
  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');
  const isAdminPage = activePage === 'scanner' || activePage === 'admin' || activePage === 'admin-scanner' || activePage === 'admin-dashboard' || (activePage === 'dashboard' && isAdmin);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />;
      case 'classes':
        return <ClassesPage />;
      case 'dashboard':
        // Strict Role Guard: Admin gets Admin Dashboard, User gets Member Dashboard
        return isAdmin 
          ? <MobileScannerPage setActivePage={setActivePage} /> 
          : <DashboardPage setActivePage={setActivePage} />;
      case 'admin-scanner':
      case 'scanner':
      case 'admin':
      case 'admin-dashboard':
        return <MobileScannerPage setActivePage={setActivePage} />;
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: isAdminPage ? '#090d16' : '#ffffff' }}>
      {!isAdminPage && <Navbar activePage={activePage} setActivePage={setActivePage} />}
      
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      {!isAdminPage && <Footer setActivePage={setActivePage} />}
      
      {/* Mobile Bottom App Navigation Bar */}
      {!isAdminPage && <MobileBottomBar activePage={activePage} setActivePage={setActivePage} />}

      {/* Global Modals & Notifications */}
      <DayPassModal />
      <ClassReservationModal setActivePage={setActivePage} />
      <ArticleModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('home');

  return (
    <AppProvider>
      <MainAppLayout activePage={activePage} setActivePage={setActivePage} />
    </AppProvider>
  );
}

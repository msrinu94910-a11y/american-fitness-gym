import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // User auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('afg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loginSession = (userData, token) => {
    setUser(userData);
    localStorage.setItem('afg_user', JSON.stringify(userData));
    localStorage.setItem('afg_token', token);
  };

  const logoutSession = () => {
    setUser(null);
    localStorage.removeItem('afg_user');
    localStorage.removeItem('afg_token');
    showToast('Logged out successfully', 'info');
  };

  // Modals state
  const [isDayPassOpen, setIsDayPassOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loginSession,
        logoutSession,
        toasts,
        showToast,
        removeToast,
        isDayPassOpen,
        openDayPass: () => setIsDayPassOpen(true),
        closeDayPass: () => setIsDayPassOpen(false),
        selectedArticle,
        openArticleModal: (article) => setSelectedArticle(article),
        closeArticleModal: () => setSelectedArticle(null)
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

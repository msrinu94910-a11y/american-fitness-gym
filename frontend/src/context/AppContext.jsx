import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile, fetchMemberBookings, bookClass, cancelBooking } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  // User auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('afg_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Verify session on startup
  useEffect(() => {
    const token = localStorage.getItem('afg_token');
    if (token) {
      fetchUserProfile()
        .then(res => {
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('afg_user', JSON.stringify(res.user));
          } else {
            // Invalid session
            localStorage.removeItem('afg_token');
            localStorage.removeItem('afg_user');
            setUser(null);
          }
        })
        .catch(() => {
          // If server offline or network error, retain local state
        });
    }
  }, []);

  // Fetch bookings when user changes
  const refreshBookings = async () => {
    if (!localStorage.getItem('afg_token')) {
      setUserBookings([]);
      return;
    }
    try {
      const res = await fetchMemberBookings();
      if (res.success) {
        setUserBookings(res.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load member bookings', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshBookings();
    } else {
      setUserBookings([]);
    }
  }, [user]);

  const loginSession = (userData, token) => {
    setUser(userData);
    localStorage.setItem('afg_user', JSON.stringify(userData));
    localStorage.setItem('afg_token', token);
    refreshBookings();
  };

  const logoutSession = () => {
    setUser(null);
    setUserBookings([]);
    localStorage.removeItem('afg_user');
    localStorage.removeItem('afg_token');
    showToast('Logged out successfully', 'info');
  };

  // Class Reservation modal & Day Pass modal
  const [isDayPassOpen, setIsDayPassOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const bookClassHandler = async (classId, preferredDate) => {
    if (!user) {
      showToast('Please sign in or register to reserve class seats.', 'warning');
      return { success: false, requireAuth: true };
    }
    try {
      const res = await bookClass({ classId, preferredDate });
      if (res.success) {
        showToast(res.message, 'success');
        refreshBookings();
        return { success: true };
      } else {
        showToast(res.message || 'Failed to reserve seat.', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Network error while reserving class.', 'error');
      return { success: false };
    }
  };

  const cancelBookingHandler = async (bookingId) => {
    try {
      const res = await cancelBooking(bookingId);
      if (res.success) {
        showToast(res.message, 'success');
        refreshBookings();
        return { success: true };
      } else {
        showToast(res.message || 'Failed to cancel booking.', 'error');
        return { success: false };
      }
    } catch (err) {
      showToast('Error cancelling booking.', 'error');
      return { success: false };
    }
  };

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
        setUser,
        loginSession,
        logoutSession,
        userBookings,
        refreshBookings,
        bookClassHandler,
        cancelBookingHandler,
        toasts,
        showToast,
        removeToast,
        isDayPassOpen,
        openDayPass: () => setIsDayPassOpen(true),
        closeDayPass: () => setIsDayPassOpen(false),
        selectedArticle,
        openArticleModal: (article) => setSelectedArticle(article),
        closeArticleModal: () => setSelectedArticle(null),
        selectedClass,
        openClassModal: (c) => setSelectedClass(c),
        closeClassModal: () => setSelectedClass(null)
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

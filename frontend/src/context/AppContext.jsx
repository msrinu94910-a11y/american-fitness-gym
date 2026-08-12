import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchUserProfile, fetchMemberBookings, bookClass, cancelBooking,
  fetchCmsContent, updateCmsHomepage, saveCmsService, deleteCmsService,
  saveCmsMembership, deleteCmsMembership, fetchUserNotifications
} from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [realtimeNoticePopup, setRealtimeNoticePopup] = useState(null);

  // User auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('afg_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Dynamic CMS State
  const defaultCms = {
    homepage: {
      welcomeTag: "⚡ WELCOME TO AMERICAN FITNESS GYM & ATHLETIC ARENA",
      headlineMain: "DOMINATE YOUR GOALS.",
      headlineSub: "ELEVATE YOUR PERFORMANCE.",
      description: "Step into American Fitness Gym—a 20,000 sq. ft. world-class strength arena and athletic performance center. Equipped with competition-grade Rogue Monster rigs, Eleiko calibrated plates, Woodway cardio engines, 1-on-1 certified master biomechanics coaches, an infrared recovery spa, and an organic fuel protein bar. Built for those who demand excellence 24/7/365.",
      heroImage: "/hero-gym-arena.png",
      ctaText: "Claim Your Free VIP Pass",
      amenities: [
        { color: "#0284C7", title: "20,000 Sq. Ft. Olympic Arena", text: "12 Rogue Rigs & Eleiko Plates" },
        { color: "#0D9488", title: "Organic Fuel & Smoothie Bar", text: "Organic Whey & Gourmet Meals" },
        { color: "#0891b2", title: "24/7 Mobile Keycard Access", text: "Open 365 Days a Year" },
        { color: "#d97706", title: "4.9 / 5.0 Member Rating", text: "Over 500+ Verified Reviews" },
        { color: "#059669", title: "1-on-1 Master Coaching", text: "Custom Biomechanics & Plans" }
      ]
    },
    services: [
      {
        id: 'personal-training',
        title: '1-on-1 Personal Training & Biomechanics',
        badge: 'MOST POPULAR',
        color: '#0284C7',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
        description: 'Customized 1-on-1 strength and biomechanics coaching tailored to your specific physical goals.',
        perks: [
          'Custom 12-week periodized strength programming',
          'Bar-path velocity and joint alignment analysis',
          'InBody 770 monthly body composition scans',
          'Direct 24/7 coach messaging and form checks'
        ]
      },
      {
        id: 'fuel-bar-service',
        title: 'Organic Fuel & Smoothie Bar',
        badge: 'NUTRITION HUB',
        color: '#0D9488',
        image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
        description: 'Recharge post-workout with fresh organic whey protein smoothies, pre-workout energy shots, cold brews, and macro-balanced gourmet meals.',
        perks: [
          '100% organic grass-fed whey and vegan plant proteins',
          'Custom pre & post workout electrolyte blends',
          'Fresh macro-balanced gourmet meal prep grab & go',
          'Cold-pressed green juices and organic espresso'
        ]
      },
      {
        id: 'body-scan',
        title: 'InBody 770 Clinical Body Scans',
        badge: 'CLINICAL GRADE',
        color: '#0891b2',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        description: 'Get precise scientific feedback on muscle mass, body fat percentage, visceral fat, and segmental lean balance.',
        perks: [
          'Multi-frequency bioimpedance technology',
          'Detailed 15-page segmental breakdown report',
          'Basal metabolic rate (BMR) calculation',
          'Monthly progress comparison overlay'
        ]
      },
      {
        id: 'nutrition',
        title: 'Custom Macro Nutrition Blueprints',
        badge: 'NUTRITION',
        color: '#d97706',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
        description: 'Customized macro nutrient targets calculated for your training volume, body weight, and body composition goals.',
        perks: [
          'Personalized daily protein, carb, and fat targets',
          'Weekly grocery list and meal preparation guide',
          'Supplement protocol recommendations',
          'Weekly accountability check-in video calls'
        ]
      },
      {
        id: 'hyrox-group',
        title: 'HYROX & Functional Group Classes',
        badge: 'HIGH INTENSITY',
        color: '#059669',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        description: 'High-octane hybrid endurance classes combining SkiErgs, heavy sled pushes, rowing, wall balls, and kettlebells.',
        perks: [
          'Coached by certified CrossFit L3 & Hyrox trainers',
          'Heart-rate telemetry display screens in class',
          'Scalable workouts for all fitness levels',
          'Supportive competitive team community'
        ]
      },
      {
        id: 'keycard-access',
        title: '24/7 Digital Mobile App Keycard Access',
        badge: '24/7 ACCESS',
        color: '#0284C7',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
        description: 'Enjoy 24-hour round-the-clock access to our 20,000 sq. ft. weight floor 365 days a year.',
        perks: [
          'Encrypted 1-tap mobile turnstile scanner',
          'High-definition security surveillance system',
          'Never closes on holidays or weekends',
          'Includes complimentary guest pass credits'
        ]
      },
      {
        id: 'recovery-spa',
        title: 'Infrared Sauna & Cold Plunge Recovery Spa',
        badge: 'RECOVERY SPA',
        color: '#e11d48',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Accelerate muscle repair, decrease systemic inflammation, and boost CNS recovery with private full-spectrum infrared saunas and 45°F cold plunge therapy.',
        perks: [
          'Private full-spectrum infrared sauna suites (140°F–170°F)',
          'Dual-filtration 45°F cold plunge contrast therapy tanks',
          'Normatec 3 compression boot recovery lounge access',
          'Red-light photobiomodulation therapy panels'
        ]
      }
    ],
    memberships: [
      {
        id: 'basic-plan',
        name: 'Basic Gym Access',
        tier: 'basic',
        monthlyPrice: 29,
        annualPrice: 24,
        badge: 'STARTER',
        description: 'Perfect for independent training with full access to gym floor and cardio equipment.',
        popular: false,
        features: [
          'Access to Main Weight Floor & Cardio Deck',
          'Locker Room & Shower Access',
          'Free Initial Fitness Assessment',
          '24/7 Facility Access Keycard',
          'Mobile App Workout Tracking'
        ],
        ctaText: 'Get Started'
      },
      {
        id: 'pro-plan',
        name: 'Pro Athlete',
        tier: 'pro',
        monthlyPrice: 59,
        annualPrice: 49,
        badge: 'MOST POPULAR',
        description: 'The complete athletic package including unlimited facility zones and recovery spa.',
        popular: true,
        features: [
          'Everything in Basic Plan',
          'Steam Room, Sauna & Hydromassage Spa',
          '1 Free Monthly Fitness Coaching Consultation',
          'Guest Pass (2 Guests per month)',
          'Free Smoothie at Fuel Bar on Sign-up'
        ],
        ctaText: 'Claim Pro Membership'
      },
      {
        id: 'vip-plan',
        name: 'VIP Elite',
        tier: 'vip',
        monthlyPrice: 99,
        annualPrice: 84,
        badge: 'VIP ELITE',
        description: 'All-inclusive premium experience with dedicated coach, private lockers, and custom nutrition.',
        popular: false,
        features: [
          'Everything in Pro Plan',
          '2 Monthly 1-on-1 Personal Coaching Sessions',
          'Customized Meal & Supplement Blueprint',
          'Permanent Reserved VIP Locker & Towel Service',
          'Unlimited Guest Passes (1 Guest every visit)',
          '15% Off All Gym Merchandise & Supplements'
        ],
        ctaText: 'Join VIP Elite'
      }
    ]
  };

  const [cmsData, setCmsData] = useState(defaultCms);

  // Fetch live CMS data from backend
  useEffect(() => {
    fetchCmsContent()
      .then(res => {
        if (res && res.success && res.data) {
          setCmsData(prev => ({
            homepage: { ...prev.homepage, ...(res.data.homepage || {}) },
            services: res.data.services && res.data.services.length ? res.data.services : prev.services,
            memberships: res.data.memberships && res.data.memberships.length ? res.data.memberships : prev.memberships
          }));
        }
      })
      .catch(() => {});
  }, []);

  const updateHomepageCMS = async (data) => {
    setCmsData(prev => ({
      ...prev,
      homepage: { ...prev.homepage, ...data }
    }));
    try {
      await updateCmsHomepage(data);
      showToast('Homepage hero content saved in real-time!', 'success');
    } catch (e) {
      showToast('Homepage content updated locally!', 'info');
    }
  };

  const saveServiceCMS = async (serviceData) => {
    const sId = serviceData.id || 'srv_' + Date.now();
    const updatedService = { ...serviceData, id: sId };
    setCmsData(prev => {
      const idx = prev.services.findIndex(s => s.id === sId);
      let newServices = [...prev.services];
      if (idx >= 0) {
        newServices[idx] = updatedService;
      } else {
        newServices.push(updatedService);
      }
      return { ...prev, services: newServices };
    });
    try {
      await saveCmsService(updatedService);
      showToast('Service saved live to database!', 'success');
    } catch (e) {
      showToast('Service saved locally!', 'info');
    }
  };

  const deleteServiceCMS = async (id) => {
    setCmsData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id)
    }));
    try {
      await deleteCmsService(id);
      showToast('Service removed from catalog!', 'success');
    } catch (e) {
      showToast('Service removed locally!', 'info');
    }
  };

  const saveMembershipCMS = async (membershipData) => {
    const mId = membershipData.id || 'mem_' + Date.now();
    const monthly = Number(membershipData.monthlyPrice) || 39;
    const annual = Number(membershipData.annualPrice) || Math.round(monthly * 0.8);
    const updatedMembership = { 
      ...membershipData, 
      id: mId,
      monthlyPrice: monthly,
      annualPrice: annual
    };
    setCmsData(prev => {
      const idx = prev.memberships.findIndex(m => m.id === mId);
      let newMemberships = [...prev.memberships];
      if (idx >= 0) {
        newMemberships[idx] = updatedMembership;
      } else {
        newMemberships.push(updatedMembership);
      }
      return { ...prev, memberships: newMemberships };
    });
    try {
      await saveCmsMembership(updatedMembership);
      showToast('Membership plan saved live to database!', 'success');
    } catch (e) {
      showToast('Membership plan saved locally!', 'info');
    }
  };

  const deleteMembershipCMS = async (id) => {
    setCmsData(prev => ({
      ...prev,
      memberships: prev.memberships.filter(m => m.id !== id)
    }));
    try {
      await deleteCmsMembership(id);
      showToast('Membership plan removed from database!', 'success');
    } catch (e) {
      showToast('Membership plan removed locally!', 'info');
    }
  };

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

  // Synthesized Web Audio Notification Chime
  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch (e) {}
  };

  const triggerRealtimeNotice = (noticePayload) => {
    if (!noticePayload) return;

    playAlertSound();

    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        lastNoticeSent: noticePayload.sentFormatted || noticePayload.lastNoticeSent || 'Just now',
        noticeCount: (prev.noticeCount || 0) + 1,
        lastNoticeDetails: noticePayload.lastNoticeDetails || {
          sentAt: noticePayload.sentAt || new Date().toLocaleString(),
          channel: 'SMS & Email (Multi-channel)',
          status: 'DELIVERED ✅',
          recipientEmail: prev.email,
          recipientPhone: prev.phone || '(555) 888-9900',
          message: noticePayload.message
        }
      };
      localStorage.setItem('afg_user', JSON.stringify(updated));
      return updated;
    });

    setRealtimeNoticePopup(noticePayload);

    // Trigger Toast Notification
    const id = Date.now();
    const formattedTime = noticePayload.sentFormatted || 'Just now';
    setToasts(prev => [
      ...prev,
      {
        id,
        message: `🚨 REAL-TIME ALERT: Expiry Notice message sent by Gym Admin (${formattedTime})!`,
        type: 'warning'
      }
    ]);
  };

  // Real-Time Event Listener (BroadcastChannel + SSE Stream + Polling Fallback)
  useEffect(() => {
    if (!user) return;

    // 1. Cross-Tab Instant Sync (0ms BroadcastChannel)
    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('AFG_NOTIFICATIONS_CHANNEL');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'EXPIRY_NOTICE_SENT') {
          const payload = event.data.payload;
          if (
            payload &&
            (payload.userId === user.id ||
              payload.membershipId === user.membershipId ||
              payload.membershipId === user.id ||
              payload.userEmail === user.email)
          ) {
            triggerRealtimeNotice(payload);
          }
        }
      };
    }

    // 2. Server-Sent Events (SSE Stream) Connection
    let eventSource = null;
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '/api';
      eventSource = new EventSource(`${apiBase}/events`);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'EXPIRY_NOTICE_SENT' && data.payload) {
            const p = data.payload;
            if (
              p.userId === user.id ||
              p.membershipId === user.membershipId ||
              p.membershipId === user.id ||
              p.userEmail === user.email
            ) {
              triggerRealtimeNotice(p);
            }
          }
        } catch (err) {}
      };
    } catch (err) {}

    // 3. Fast Poll Fallback (Every 3.5 Seconds)
    const interval = setInterval(async () => {
      try {
        const res = await fetchUserNotifications();
        if (res && res.success && res.lastNoticeSent) {
          if (res.lastNoticeSent !== user.lastNoticeSent) {
            triggerRealtimeNotice({
              sentFormatted: res.lastNoticeSent,
              sentAt: res.lastNoticeDetails?.sentAt,
              message: res.lastNoticeDetails?.message,
              lastNoticeDetails: res.lastNoticeDetails
            });
          }
        }
      } catch (e) {}
    }, 3500);

    return () => {
      if (channel) channel.close();
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [user?.id, user?.lastNoticeSent]);

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
        closeClassModal: () => setSelectedClass(null),
        cmsData,
        updateHomepageCMS,
        saveServiceCMS,
        deleteServiceCMS,
        saveMembershipCMS,
        deleteMembershipCMS,
        realtimeNoticePopup,
        closeRealtimeNoticePopup: () => setRealtimeNoticePopup(null),
        triggerRealtimeNotice
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

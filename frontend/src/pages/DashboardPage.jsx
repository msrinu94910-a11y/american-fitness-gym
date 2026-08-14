import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User, QrCode, Calendar, Settings, Flame, Trophy, ShieldCheck,
  Clock, MapPin, CheckCircle2, XCircle, LogOut, ArrowRight, Save, Zap, AlertCircle, RefreshCw, History,
  UserCheck, Dumbbell, Utensils, TrendingUp
} from 'lucide-react';
import {
  updateUserProfile, tapTurnstile, renewMemberSubscription, fetchUserAttendanceHistory,
  fetchAssignedTrainerDetails, fetchMemberWorkoutPlan, fetchMemberDietPlan, fetchMemberProgress,
  fetchAdminTrainers, chooseMemberTrainer
} from '../services/api';
import QRCodeSVG from '../components/common/QRCodeSVG';
import LoginPage from './LoginPage';
import MobileScannerPage from './MobileScannerPage';

export default function DashboardPage({ setActivePage }) {
  const { 
    user, setUser, logoutSession, userBookings, cancelBookingHandler, 
    showToast, realtimeNoticePopup, closeRealtimeNoticePopup 
  } = useApp();
  const [activeTab, setActiveTab] = useState('pass'); // 'pass' | 'trainer' | 'workout' | 'diet' | 'progress' | 'bookings' | 'profile'
  const [scanning, setScanning] = useState(false);
  const [turnstileMessage, setTurnstileMessage] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Trainer & Fitness Plans State
  const [assignedTrainer, setAssignedTrainer] = useState(null);
  const [allTrainers, setAllTrainers] = useState([]);
  const [memberWorkoutPlan, setMemberWorkoutPlan] = useState(null);
  const [memberDietPlan, setMemberDietPlan] = useState(null);
  const [memberProgressHistory, setMemberProgressHistory] = useState([]);

  // Modals for Trainer Choice & Appointment Booking
  const [chooseTrainerModalOpen, setChooseTrainerModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    trainerId: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    goalNotes: '1-on-1 Fitness Assessment & Technique Review'
  });

  const loadTrainerData = () => {
    fetchAssignedTrainerDetails().then(res => {
      if (res && res.success) setAssignedTrainer(res.trainer);
    });
    fetchAdminTrainers().then(res => {
      if (res && res.success) setAllTrainers(res.trainers || []);
    });
  };

  useEffect(() => {
    if (user) {
      loadTrainerData();
      fetchMemberWorkoutPlan().then(res => {
        if (res && res.success) setMemberWorkoutPlan(res.plan);
      });
      fetchMemberDietPlan().then(res => {
        if (res && res.success) setMemberDietPlan(res.plan);
      });
      fetchMemberProgress().then(res => {
        if (res && res.success) setMemberProgressHistory(res.history || []);
      });
    }
  }, [user]);

  const handleSelectTrainer = async (trainerId) => {
    try {
      const res = await chooseMemberTrainer(trainerId);
      if (res.success) {
        showToast(res.message, 'success');
        setChooseTrainerModalOpen(false);
        loadTrainerData();
      } else {
        showToast(res.message || 'Failed to assign trainer', 'error');
      }
    } catch (err) {
      showToast('Error choosing trainer', 'error');
    }
  };

  const handleConfirmAppointment = async () => {
    if (!appointmentForm.trainerId && !assignedTrainer) {
      showToast('Please select a personal trainer for your appointment', 'warning');
      return;
    }
    const targetTrainerId = appointmentForm.trainerId || assignedTrainer?.id;
    const selectedCoach = allTrainers.find(t => t.id === targetTrainerId) || assignedTrainer;
    showToast(`✅ 1-on-1 Appointment Booked with ${selectedCoach?.fullName || 'Trainer'} on ${appointmentForm.date} at ${appointmentForm.timeSlot}!`, 'success');
    setAppointmentModalOpen(false);
  };

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    emergencyContact: user?.emergencyContact || '',
    fitnessGoal: user?.fitnessGoal || 'Hypertrophy & Strength',
    membershipPlan: user?.membershipPlan || 'Pro Athlete'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [userAttendanceLogs, setUserAttendanceLogs] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    if (activeTab === 'attendance' && user) {
      setLoadingAttendance(true);
      fetchUserAttendanceHistory()
        .then(res => {
          if (res && res.success && res.data) {
            setUserAttendanceLogs(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAttendance(false));
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || '',
        fitnessGoal: user.fitnessGoal || 'Hypertrophy & Strength',
        membershipPlan: user.membershipPlan || 'Pro Athlete'
      });
    }
  }, [user]);

  if (!user) {
    return <LoginPage setActivePage={setActivePage} />;
  }

  // Strict Admin Role Guard: Admin users ALWAYS get the Admin Camera Scanner Dashboard
  if (user.role === 'admin' || user.email?.includes('admin')) {
    return <MobileScannerPage setActivePage={setActivePage} />;
  }

  // Turnstile Tap Simulator
  const handleTapTurnstile = async () => {
    setScanning(true);
    setTurnstileMessage(null);
    try {
      const res = await tapTurnstile();
      if (res.success) {
        setTurnstileMessage(res.message);
        showToast(res.message, 'success');
        if (res.stats) {
          setUser(prev => prev ? { ...prev, ...res.stats } : prev);
        }
      } else {
        showToast(res.message || 'Turnstile access denied', 'error');
      }
    } catch (err) {
      showToast('Error connecting to turnstile scanner', 'error');
    } finally {
      setTimeout(() => setScanning(false), 1200);
    }
  };

  // Membership Renewal Handler
  const handleRenewSubscription = async () => {
    try {
      const res = await renewMemberSubscription(user.id, user.membershipPlan);
      if (res.success) {
        setUser(prev => ({
          ...prev,
          status: 'ACTIVE_MEMBER',
          expiryDate: res.user.expiryDate
        }));
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast('Renewal process error. Please contact front desk.', 'error');
    }
  };

  // Profile Save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateUserProfile(profileForm);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('afg_user', JSON.stringify(res.user));
        showToast('Profile settings saved successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to save profile', 'error');
      }
    } catch (err) {
      showToast('Error updating profile settings', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '6rem', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Real-Time Push Expiry Notice Pop-Up Alert Modal */}
        {realtimeNoticePopup && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={closeRealtimeNoticePopup}
          >
            <div
              className="glass-card"
              style={{
                maxWidth: '520px',
                width: '100%',
                background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                border: '3px solid #0284c7',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 25px 60px rgba(2, 132, 199, 0.4)',
                textAlign: 'center',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.6)' }}>
                <AlertCircle size={36} />
              </div>

              <div style={{ background: 'rgba(2, 132, 199, 0.25)', border: '1px solid #0284c7', color: '#38bdf8', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '0.75rem' }}>
                ⚡ REAL-TIME EXPIRY NOTICE FROM ADMIN
              </div>

              <h2 style={{ fontSize: '1.6rem', color: '#ffffff', fontFamily: 'var(--font-heading)', margin: '0 0 0.5rem 0' }}>
                MEMBERSHIP NOTICE RECEIVED
              </h2>

              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
                Delivered live to your screen at <strong>{realtimeNoticePopup.sentFormatted || 'Just now'}</strong>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '16px', color: '#f1f5f9', fontSize: '0.95rem', lineHeight: 1.5, textAlign: 'left', marginBottom: '1.5rem' }}>
                {realtimeNoticePopup.message || realtimeNoticePopup.lastNoticeDetails?.message || `Dear ${user.fullName}, your gym membership expired. Please renew your plan to maintain 24/7 facility access.`}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    closeRealtimeNoticePopup();
                    handleRenewSubscription();
                  }}
                  className="btn btn-gold pulse-button"
                  style={{
                    flex: 1,
                    height: '48px',
                    fontSize: '0.95rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RefreshCw size={18} /> Renew Subscription (+1 Yr)
                </button>

                <button
                  onClick={closeRealtimeNoticePopup}
                  style={{
                    padding: '0 1.25rem',
                    height: '48px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '14px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Dismiss ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Automatic Expiry Notice Alert Banner in User Dashboard */}
        {(user.status === 'EXPIRED' || user.status === 'EXPIRED_MEMBER' || user.lastNoticeSent || (user.expiryDate && new Date(user.expiryDate) < new Date())) && (
          <div
            style={{
              padding: '1.5rem 1.75rem',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
              border: '2px solid #0284c7',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 8px 30px rgba(2, 132, 199, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flex: 1, minWidth: '280px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(2, 132, 199, 0.5)' }}>
                <AlertCircle size={30} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 900 }}>⚠️ MEMBERSHIP EXPIRY NOTICE FROM ADMIN</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.68rem', color: '#ffffff' }}>{user.lastNoticeSent || 'Notice Received'}</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem', lineHeight: 1.45 }}>
                  {user.lastNoticeDetails?.message || `Dear ${user.fullName || 'Member'}, your ${user.membershipPlan || 'Gym'} membership expired on ${user.expiryDate || 'recently'}. Please renew your plan to restore 24/7 facility access.`}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#93c5fd', marginTop: '0.4rem' }}>
                  📩 Delivered via SMS & Email to <strong style={{ color: '#ffffff' }}>{user.email}</strong> • <strong style={{ color: '#ffffff' }}>{user.phone || '(555) 888-9900'}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleRenewSubscription}
              className="btn pulse-button"
              style={{
                padding: '0.85rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(2, 132, 199, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexShrink: 0
              }}
            >
              <RefreshCw size={18} /> RENEW MEMBERSHIP NOW (+1 YR)
            </button>
          </div>
        )}

        {/* Standalone User Dashboard Portal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div 
            onClick={() => setActivePage && setActivePage('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
            }}>
              <Flame size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                AMERICAN FITNESS
              </div>
              <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 800 }}>
                MEMBER PORTAL DASHBOARD
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage && setActivePage('home')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            🌐 Back to Gym Website
          </button>
        </div>

        {/* Top Member Header Banner */}
        <div
          className="glass-card"
          style={{
            padding: '2rem 1.75rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(2,132,199,0.08) 0%, rgba(13,148,136,0.08) 100%)',
            borderLeft: '5px solid #0284C7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--text-main)' }}>
                  WELCOME, {user.fullName ? user.fullName.toUpperCase() : 'MEMBER'}
                </h1>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  {user.membershipPlan || 'Pro Athlete'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem', margin: 0 }}>
                Member ID: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{user.id ? user.id.toUpperCase() : 'AFG-MEMBER'}</strong> • Joined {user.joinedDate || '2026'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setActivePage('classes')} className="btn btn-primary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.88rem' }}>
              <Calendar size={16} /> Book Class
            </button>
            <button onClick={logoutSession} className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.88rem' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Sub-Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--border-glass)'
          }}
        >
          <button
            onClick={() => setActiveTab('pass')}
            style={tabButtonStyle(activeTab === 'pass')}
          >
            <QrCode size={18} /> 24/7 Digital Pass
          </button>
          <button
            onClick={() => setActiveTab('trainer')}
            style={tabButtonStyle(activeTab === 'trainer')}
          >
            <UserCheck size={18} /> My Personal Trainer
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            style={tabButtonStyle(activeTab === 'workout')}
          >
            <Dumbbell size={18} /> My Workout Routine
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            style={tabButtonStyle(activeTab === 'diet')}
          >
            <Utensils size={18} /> My Diet & Macros
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            style={tabButtonStyle(activeTab === 'progress')}
          >
            <TrendingUp size={18} /> Progress Tracker
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            style={tabButtonStyle(activeTab === 'bookings')}
          >
            <Calendar size={18} /> Class Bookings ({userBookings.filter(b => b.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            style={tabButtonStyle(activeTab === 'attendance')}
          >
            <Clock size={18} /> Attendance History
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={tabButtonStyle(activeTab === 'profile')}
          >
            <Settings size={18} /> Profile Settings
          </button>
        </div>

        {/* TAB: MY PERSONAL TRAINER */}
        {activeTab === 'trainer' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', margin: 0 }}>
                  MY ASSIGNED PERSONAL COACH
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  Your dedicated master trainer at American Fitness Gym.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setChooseTrainerModalOpen(true)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    background: '#f0f9ff',
                    border: '1.5px solid #0284c7',
                    color: '#0284c7',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <UserCheck size={16} /> Select / Choose Trainer
                </button>
                <button
                  onClick={() => setAppointmentModalOpen(true)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Calendar size={16} /> Book 1-on-1 Appointment
                </button>
              </div>
            </div>

            {assignedTrainer ? (
              <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={assignedTrainer.profileImage || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80'}
                  alt={assignedTrainer.fullName}
                  style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #0284c7', boxShadow: '0 8px 25px rgba(2, 132, 199, 0.25)' }}
                />
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{assignedTrainer.fullName}</h4>
                    <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
                      MASTER TRAINER
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', color: '#0284c7', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Specialization: {assignedTrainer.specialization}
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {assignedTrainer.bio || 'Certified Personal Coach assigned by American Fitness Gym Admin to help you reach your goals.'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#64748b' }}>
                    <div>📞 <strong>Phone:</strong> {assignedTrainer.phone || '(555) 389-2041'}</div>
                    <div>✉️ <strong>Email:</strong> {assignedTrainer.email || 'coach@americanfitness.com'}</div>
                    <div>🏆 <strong>Experience:</strong> {assignedTrainer.experienceYears || 5} Years</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                <UserCheck size={40} color="#0284c7" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 900, margin: 0 }}>No Trainer Assigned Yet</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.35rem 0 1.25rem 0' }}>
                  Click below to choose your personal fitness coach from our team of certified master trainers.
                </p>
                <button
                  onClick={() => setChooseTrainerModalOpen(true)}
                  style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer' }}
                >
                  Choose Your Trainer Now
                </button>
              </div>
            )}

            {/* CHOOSE / SELECT TRAINER MODAL */}
            {chooseTrainerModalOpen && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', maxWidth: '680px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', maxHeight: '85vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                        CHOOSE YOUR PERSONAL COACH
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                        Select a certified personal trainer to build your workout & diet plans.
                      </p>
                    </div>
                    <button onClick={() => setChooseTrainerModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 900 }}>✕</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
                    {allTrainers.map(t => {
                      const isSelected = assignedTrainer?.id === t.id;
                      return (
                        <div key={t.id} style={{ background: isSelected ? '#f0f9ff' : '#ffffff', border: isSelected ? '2px solid #0284c7' : '1.5px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                          <div>
                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <img src={t.profileImage || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80'} alt={t.fullName} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7', flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.fullName}</h4>
                                <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.specialization}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.experienceYears} Years Exp.</div>
                              </div>
                            </div>
                            <p style={{
                              fontSize: '0.82rem',
                              color: '#475569',
                              lineHeight: '1.4',
                              marginBottom: '1rem',
                              height: '2.4rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {t.bio || 'Certified Personal Trainer at American Fitness Gym.'}
                            </p>
                          </div>

                          <button
                            onClick={() => handleSelectTrainer(t.id)}
                            style={{
                              width: '100%',
                              padding: '0.65rem',
                              borderRadius: '10px',
                              border: isSelected ? 'none' : '1.5px solid #0284c7',
                              background: isSelected ? '#10b981' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#0284c7',
                              fontWeight: 900,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            {isSelected ? '✓ Currently Selected Coach' : 'Choose Trainer'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* BOOK 1-ON-1 APPOINTMENT MODAL */}
            {appointmentModalOpen && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', maxWidth: '520px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
                    BOOK 1-ON-1 TRAINER APPOINTMENT
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    Schedule a private coaching & body composition assessment session.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>Select Personal Trainer *</label>
                      <select
                        value={appointmentForm.trainerId || assignedTrainer?.id || ''}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, trainerId: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #0284c7', fontWeight: 800, background: '#ffffff', color: '#0f172a' }}
                      >
                        <option value="">-- Choose Trainer --</option>
                        {allTrainers.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} ({t.specialization})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>Appointment Date *</label>
                        <input type="date" value={appointmentForm.date} onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>Time Slot *</label>
                        <select value={appointmentForm.timeSlot} onChange={(e) => setAppointmentForm({ ...appointmentForm, timeSlot: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <option value="08:00 AM">08:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                          <option value="06:00 PM">06:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>Session Focus / Goals</label>
                      <textarea value={appointmentForm.goalNotes} onChange={(e) => setAppointmentForm({ ...appointmentForm, goalNotes: e.target.value })} rows={2} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setAppointmentModalOpen(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={handleConfirmAppointment} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer' }}>
                      Confirm Appointment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: MY WORKOUT ROUTINE */}
        {activeTab === 'workout' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ASSIGNED ROUTINE</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', margin: 0 }}>
                  {memberWorkoutPlan?.title || 'Custom Athletic Strength Blueprint'}
                </h3>
              </div>
              <span style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 800 }}>
                Goal: {memberWorkoutPlan?.goal || 'Hypertrophy & Performance'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(memberWorkoutPlan?.exercises || [
                { day: 'Monday', name: 'Barbell Back Squats', sets: 4, reps: '8-10', restSeconds: 90, targetMuscle: 'Quads & Glutes', notes: 'Maintain parallel depth.' },
                { day: 'Wednesday', name: 'Incline Dumbbell Bench Press', sets: 4, reps: '10-12', restSeconds: 75, targetMuscle: 'Upper Chest', notes: 'Squeeze at top.' },
                { day: 'Friday', name: 'Overhead Barbell Military Press', sets: 4, reps: '8-10', restSeconds: 90, targetMuscle: 'Shoulders', notes: 'Engage core.' }
              ]).map((ex, idx) => (
                <div key={idx} style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ background: '#0284c7', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase' }}>
                      {ex.day}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0.4rem 0 0.2rem 0' }}>{ex.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>Target: <strong style={{ color: '#0284c7' }}>{ex.targetMuscle}</strong> • {ex.notes}</p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ background: '#ffffff', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 900, fontSize: '0.9rem', color: '#0f172a' }}>
                      {ex.sets} Sets × {ex.reps}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                      ⏱️ {ex.restSeconds}s Rest
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MY DIET PLAN */}
        {activeTab === 'diet' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.08em' }}>NUTRITION SPECIFICATION</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', margin: 0 }}>
                  {memberDietPlan?.title || 'Lean Muscle Macro Blueprint'}
                </h3>
              </div>
            </div>

            {/* Macro Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Daily Calories</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>{memberDietPlan?.dailyCalories || 2400} kcal</div>
              </div>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Protein</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7' }}>{memberDietPlan?.proteinGrams || 180}g</div>
              </div>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>Carbs</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ea580c' }}>{memberDietPlan?.carbsGrams || 220}g</div>
              </div>
              <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#86198f', textTransform: 'uppercase' }}>Fats</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#a21caf' }}>{memberDietPlan?.fatsGrams || 65}g</div>
              </div>
            </div>

            {/* Meal Schedule List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(memberDietPlan?.meals || [
                { mealType: 'Breakfast', time: '07:30 AM', foodItems: '4 Whole Eggs, 1 Cup Oatmeal, Blueberries', calories: 600, instructions: 'Hydrate with 500ml water first.' },
                { mealType: 'Lunch', time: '01:00 PM', foodItems: '200g Grilled Chicken Breast, Brown Rice, Broccoli', calories: 650, instructions: 'Season with olive oil & sea salt.' },
                { mealType: 'Dinner', time: '08:00 PM', foodItems: '200g Baked Salmon, Sweet Potatoes, Asparagus', calories: 700, instructions: 'High omega-3 recovery meal.' }
              ]).map((ml, idx) => (
                <div key={idx} style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ background: '#0d9488', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900 }}>
                        {ml.mealType}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>⏰ {ml.time}</span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.2rem 0' }}>{ml.foodItems}</h4>
                    {ml.instructions && <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{ml.instructions}</p>}
                  </div>
                  <div style={{ background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 900, color: '#0d9488', fontSize: '0.95rem' }}>
                    {ml.calories} kcal
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PROGRESS TRACKER */}
        {activeTab === 'progress' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '1.5rem' }}>
              BODY ASSESSMENT & PROGRESS HISTORY
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.85rem' }}>Scan Date</th>
                    <th style={{ padding: '0.85rem' }}>Body Weight</th>
                    <th style={{ padding: '0.85rem' }}>Body Fat %</th>
                    <th style={{ padding: '0.85rem' }}>Muscle Mass</th>
                    <th style={{ padding: '0.85rem' }}>Coach Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(memberProgressHistory.length > 0 ? memberProgressHistory : [
                    { date: '2026-06-01', weightKg: 78.5, bodyFatPercent: 21.0, muscleMassKg: 33.2, notes: 'Initial assessment scan.' },
                    { date: '2026-07-01', weightKg: 76.8, bodyFatPercent: 19.5, muscleMassKg: 34.0, notes: 'Good strength improvements.' },
                    { date: '2026-08-01', weightKg: 75.2, bodyFatPercent: 18.2, muscleMassKg: 35.1, notes: 'Goal target reached for phase 1.' }
                  ]).map((prg, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem', fontWeight: 700 }}>{prg.date}</td>
                      <td style={{ padding: '0.85rem', fontWeight: 900, color: '#0284c7' }}>{prg.weightKg} kg</td>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: '#d97706' }}>{prg.bodyFatPercent}%</td>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: '#059669' }}>{prg.muscleMassKg} kg</td>
                      <td style={{ padding: '0.85rem', color: '#64748b' }}>{prg.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 1: Digital 24/7 QR Pass */}
        {activeTab === 'pass' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
            
            {/* Scannable Keycard Card */}
            <div className="glass-card" style={{ padding: '2rem', background: 'radial-gradient(circle at 80% 20%, #1e293b 0%, #0f172a 100%)', color: '#ffffff', borderRadius: 'var(--radius-lg)', boxShadow: '0 15px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(245, 158, 11, 0.3)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: '#f59e0b', textTransform: 'uppercase' }}>
                    AMERICAN FITNESS GYM
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: '0.2rem', color: '#ffffff' }}>
                    {user.fullName || 'Alex Morgan'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
                    {user.membershipPlan || 'Pro Athlete VIP'}
                  </div>
                </div>
                <div style={{ padding: '0.4rem 0.85rem', background: user.status === 'EXPIRED' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', border: user.status === 'EXPIRED' ? '1px solid #ef4444' : '1px solid #10b981', color: user.status === 'EXPIRED' ? '#fca5a5' : '#6ee7b7', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                  {user.status === 'EXPIRED' ? 'EXPIRED ❌' : 'ACTIVE ✅'}
                </div>
              </div>

              {/* High Contrast QR Code Image */}
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: '#0f172a', textAlign: 'center', marginBottom: '1.5rem', position: 'relative', boxShadow: '0 8px 25px rgba(0,0,0,0.25)' }}>
                {scanning && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,132,199,0.9)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                    <Zap size={36} className="pulse-glow" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>SCANNING ENTRY...</div>
                  </div>
                )}
                
                <div style={{ display: 'inline-block', border: '6px solid #0f172a', borderRadius: '12px', padding: '0.5rem', background: '#ffffff', cursor: 'pointer' }} onClick={() => setShowQrModal(true)}>
                  <QRCodeSVG value={user.membershipId || user.qrCode || 'AFG-882910'} size={160} />
                </div>

                <button
                  onClick={() => setShowQrModal(true)}
                  style={{ display: 'block', margin: '0.75rem auto 0 auto', background: 'rgba(15,23,42,0.08)', border: '1px solid rgba(15,23,42,0.2)', color: '#0f172a', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  🔍 Tap to Enlarge Scannable QR Code
                </button>

                {/* Membership Details */}
                <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>MEMBERSHIP ID</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', letterSpacing: '0.08em' }}>
                    {user.membershipId || user.qrCode || 'AFG-882910'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '0.25rem' }}>
                    EXPIRY DATE: {user.expiryDate || '2027-12-31'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.85rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <span>Plan: <strong style={{ color: '#fbbf24' }}>{user.membershipPlan || 'Pro Athlete VIP'}</strong></span>
                <span>Status: <strong style={{ color: '#6ee7b7' }}>Active 24/7 ✅</strong></span>
              </div>
            </div>

            {/* User Subscription & Gate Entry Status Card */}
            <div className="glass-card" style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              background: user.status === 'EXPIRED'
                ? 'linear-gradient(145deg, rgba(127, 29, 29, 0.25) 0%, rgba(15, 23, 42, 0.6) 100%)'
                : 'linear-gradient(145deg, rgba(6, 78, 59, 0.2) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: user.status === 'EXPIRED'
                ? '2px solid #ef4444'
                : '2px solid #10b981',
              borderRadius: 'var(--radius-lg)',
              boxShadow: user.status === 'EXPIRED'
                ? '0 10px 30px rgba(239,68,68,0.2)'
                : '0 10px 30px rgba(16,185,129,0.2)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <ShieldCheck size={28} color={user.status === 'EXPIRED' ? '#ef4444' : '#10b981'} />
                    <div>
                      <h3 style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
                        SUBSCRIPTION STATUS
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>24/7 Facility Keycard Access</span>
                    </div>
                  </div>
                  <span className={`badge ${user.status === 'EXPIRED' ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', fontWeight: 800 }}>
                    {user.status === 'EXPIRED' ? 'NO SUBSCRIPTION (EXPIRED) ❌' : 'ACTIVE SUBSCRIPTION ✅'}
                  </span>
                </div>

                {user.status === 'EXPIRED' ? (
                  <div style={{ background: 'rgba(239,68,68,0.15)', border: '1.5px solid #ef4444', padding: '1.25rem', borderRadius: 'var(--radius-md)', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <XCircle size={22} color="#ef4444" />
                      <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>YOUR SUBSCRIPTION HAS EXPIRED ❌</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', margin: '0.75rem 0', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 800, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MEMBERSHIP TIER</span>
                        <strong style={{ color: '#fca5a5', fontWeight: 800 }}>{user.membershipPlan || 'Basic Gym Access'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 800, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXPIRY DATE</span>
                        <strong style={{ color: '#ef4444', fontWeight: 800 }}>{user.expiryDate || '2025-01-15'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 800, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DAYS REMAINING</span>
                        <strong style={{ color: '#ef4444', fontWeight: 800 }}>0 Days Remaining</strong>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>
                      Your 24/7 keycard turnstile access is currently locked. Renew your subscription below to restore facility access immediately.
                    </p>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(16,185,129,0.2)', border: '2px solid #10b981', padding: '1.25rem', borderRadius: 'var(--radius-md)', color: '#ffffff', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CheckCircle2 size={22} color="#10b981" />
                      <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>ACTIVE MEMBERSHIP SUBSCRIPTION ✅</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', margin: '0.75rem 0', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 800, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MEMBERSHIP TIER</span>
                        <strong style={{ color: '#fbbf24', fontWeight: 900 }}>{user.membershipPlan || 'Pro Athlete VIP'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 800, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIVE UNTIL</span>
                        <strong style={{ color: '#6ee7b7', fontWeight: 900 }}>{user.expiryDate || '2027-12-31'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 800, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>REMAINING DAYS</span>
                        <strong style={{ color: '#34d399', fontWeight: 900 }}>⚡ 508 Days Left</strong>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#ffffff', fontWeight: 600, marginTop: '0.5rem' }}>
                      Show your scannable QR Code on the left to gym staff upon entry or tap below to simulate gate check-in.
                    </p>
                  </div>
                )}

                {turnstileMessage && (
                  <div style={{ background: 'rgba(13,148,136,0.2)', border: '1.5px solid #0D9488', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} color="#2dd4bf" /> <span style={{ color: '#ffffff' }}>{turnstileMessage}</span>
                  </div>
                )}

                <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>Total Facility Check-Ins:</span>
                    <strong style={{ color: '#ffffff', fontWeight: 900 }}>{user.totalCheckIns || 1} Visits</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>Workout Streak:</span>
                    <strong style={{ color: '#fbbf24', fontWeight: 900 }}>🔥 {user.workoutStreakDays || 1} Days Active</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>Member Rewards:</span>
                    <strong style={{ color: '#38bdf8', fontWeight: 900 }}>⚡ {user.rewardPoints || 100} Points</strong>
                  </div>
                </div>

                {/* Primary Action Button */}
                {user.status === 'EXPIRED' ? (
                  <button
                    onClick={handleRenewSubscription}
                    className="btn btn-gold pulse-button"
                    style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 15px rgba(217,119,6,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    Renew Subscription Plan Now (+1 Year) <RefreshCw size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleTapTurnstile}
                    disabled={scanning}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 800 }}
                  >
                    {scanning ? 'Authenticating Gate...' : <><Zap size={18} /> Simulate Turnstile Gate Check-In</>}
                  </button>
                )}

                {/* Toggle Status for Quick Demo Verification */}
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => {
                      const newStatus = user.status === 'EXPIRED' ? 'ACTIVE_MEMBER' : 'EXPIRED';
                      const newDate = newStatus === 'EXPIRED' ? '2025-01-15' : '2027-12-31';
                      setUser(prev => ({ ...prev, status: newStatus, expiryDate: newDate }));
                      showToast(`Switched user status to ${newStatus === 'EXPIRED' ? 'EXPIRED ❌' : 'ACTIVE ✅'} for demonstration`, 'info');
                    }}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    ⚡ Demo Mode: Click to toggle Active vs Expired Status Card
                  </button>
                </div>

                {/* If user is an Admin, show discreet Admin Scanner launch link */}
                {(user.role === 'admin' || user.email?.includes('admin')) && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <button
                      onClick={() => setActivePage('admin-scanner')}
                      style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <QrCode size={15} /> Launch Staff Mobile QR Scanner
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: My Class Bookings */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--text-main)' }}>RESERVED CLASS SCHEDULE</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Manage your upcoming group fitness reservations and view completed sessions.</p>
              </div>
              <button onClick={() => setActivePage('classes')} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
                <Calendar size={16} /> Browse Schedule
              </button>
            </div>

            {userBookings.length === 0 ? (
              <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Active Class Reservations</h4>
                <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                  You haven't reserved any group workout seats yet. Browse our weekly schedule to join HIIT, Strength, Yoga, or Boxing classes.
                </p>
                <button onClick={() => setActivePage('classes')} className="btn btn-primary">
                  Reserve a Class Seat Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {userBookings.map((b) => (
                  <div
                    key={b.id}
                    className="glass-card"
                    style={{
                      padding: '1.5rem',
                      borderLeft: b.status === 'CONFIRMED' ? '4px solid #0D9488' : '4px solid var(--text-muted)',
                      opacity: b.status === 'CANCELLED' ? 0.7 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`} style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
                          {b.status}
                        </span>
                        <h4 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--text-main)' }}>
                          {b.className}
                        </h4>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                        <Clock size={16} color="#0284C7" />
                        <span>Date & Time: <strong>{b.date} ({b.timeSlot})</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} color="#0284C7" />
                        <span>Coach: <strong>{b.trainer}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="#0284C7" />
                        <span>Location: <strong>{b.room}</strong></span>
                      </div>
                    </div>

                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => cancelBookingHandler(b.id)}
                        className="btn btn-secondary"
                        style={{ width: '100%', height: '40px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                      >
                        <XCircle size={15} /> Cancel Reservation
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Activity & Metrics */}
        {activeTab === 'metrics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,184,0,0.15)', color: 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Flame size={32} />
              </div>
              <h4 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                {user.workoutStreakDays || 5} DAYS
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Active Workout Streak</p>
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(2,132,199,0.15)', color: '#0284C7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={32} />
              </div>
              <h4 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                {user.totalCheckIns || 42} VISITS
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Total Gym Check-Ins</p>
            </div>

            <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(13,148,136,0.15)', color: '#0D9488', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Trophy size={32} />
              </div>
              <h4 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                {user.rewardPoints || 1250} PTS
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Athlete Rewards Balance</p>
            </div>
          </div>
        )}

        {/* TAB: Personal Attendance History */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(2,132,199,0.06) 0%, rgba(37,99,235,0.04) 100%)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <History size={24} color="#0284c7" /> MY PERSONAL GYM ATTENDANCE HISTORY
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                    Real-time check-in record verified by Turnstile Gate & Staff Scanners.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ padding: '0.6rem 1.1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Total Visits</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7' }}>{(userAttendanceLogs || []).length} Check-Ins</div>
                  </div>
                  <div style={{ padding: '0.6rem 1.1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Current Streak</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>⚡ 5 Days</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              {loadingAttendance ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                  Loading your check-in history...
                </div>
              ) : (userAttendanceLogs || []).length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                  <Clock size={42} color="#0284c7" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 800, margin: 0 }}>No Check-In Logs Recorded Yet</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '0.35rem' }}>
                    Use your 24/7 Digital QR Pass at the gym entrance turnstile to record your check-in history!
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-glass)', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Check-In Date</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Time</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Gym Entry Zone</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Verification Method</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(userAttendanceLogs || []).map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {item.date || new Date().toISOString().split('T')[0]}
                          </td>
                          <td style={{ padding: '1rem', color: '#0284c7', fontWeight: 800 }}>
                            {item.time || '10:00 AM'}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <ShieldCheck size={16} color="#0284c7" /> {item.zone || item.gate || 'Main Turnstile Gate A'}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                            {item.method || 'Digital QR Verification'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <span style={{ padding: '0.3rem 0.65rem', borderRadius: '8px', background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontSize: '0.78rem', fontWeight: 900 }}>
                              GRANTED ENTRY ✅
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Profile & Settings */}
        {activeTab === 'profile' && (
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '680px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              PROFILE & ATHLETIC CREDENTIALS
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Update your contact preferences, emergency info, and primary training goals.
            </p>

            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    style={{ ...inputStyle, background: 'rgba(255,255,255,0.03)', opacity: 0.7 }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Emergency Contact</label>
                <input
                  type="text"
                  placeholder="Contact Name & Phone"
                  value={profileForm.emergencyContact}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Primary Fitness Goal</label>
                <select
                  value={profileForm.fitnessGoal}
                  onChange={(e) => setProfileForm({ ...profileForm, fitnessGoal: e.target.value })}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="Hypertrophy & Muscle Building">Hypertrophy & Muscle Building</option>
                  <option value="Fat Loss & Body Recomposition">Fat Loss & Body Recomposition</option>
                  <option value="Athletic Strength & Power">Athletic Strength & Power</option>
                  <option value="Endurance & HIIT Conditioning">Endurance & HIIT Conditioning</option>
                  <option value="Flexibility & Injury Recovery">Flexibility & Injury Recovery</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Membership Tier</label>
                <select
                  value={profileForm.membershipPlan}
                  onChange={(e) => setProfileForm({ ...profileForm, membershipPlan: e.target.value })}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="Basic Gym Access">Basic Gym Access (₹29/mo)</option>
                  <option value="Pro Athlete">Pro Athlete (₹59/mo - Recommended)</option>
                  <option value="VIP Elite">VIP Elite (₹99/mo - All Inclusive)</option>
                </select>
              </div>

              <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ height: '46px', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                {savingProfile ? 'Saving Changes...' : <><Save size={18} /> Save Profile Settings</>}
              </button>
            </form>
          </div>
        )}

        {/* Fullscreen High-Contrast Mobile QR Code Modal for Admin Scanning */}
        {showQrModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.93)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem'
            }}
            onClick={() => setShowQrModal(false)}
          >
            <div
              style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '2rem 1.5rem',
                borderRadius: '24px',
                textAlign: 'center',
                maxWidth: '380px',
                width: '100%',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                border: '4px solid #f59e0b'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                AMERICAN FITNESS GYM
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 0.2rem 0', color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                {user.fullName || 'Alex Morgan'}
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem' }}>
                {user.membershipPlan || 'Pro Athlete VIP'}
              </div>

              <div style={{ display: 'inline-block', background: '#ffffff', padding: '1rem', border: '5px solid #0f172a', borderRadius: '16px', margin: '0.5rem 0 1rem 0' }}>
                <QRCodeSVG value={user.membershipId || user.qrCode || 'AFG-882910'} size={210} />
              </div>

              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '0.08em' }}>
                {user.membershipId || user.qrCode || 'AFG-882910'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 800, marginTop: '0.35rem' }}>
                ACTIVE 24/7 MEMBERSHIP PASS ✅
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="btn"
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  padding: '0.85rem',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Close QR Pass ✕
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function tabButtonStyle(isActive) {
  return {
    padding: '0.6rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    border: isActive ? '1px solid #0284C7' : '1px solid var(--border-glass)',
    background: isActive ? 'var(--gradient-primary)' : 'var(--bg-card)',
    color: isActive ? '#ffffff' : 'var(--text-muted)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
    transition: 'var(--transition-fast)'
  };
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' };
const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '0.95rem'
};

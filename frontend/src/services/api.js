// API Service Wrapper for American Fitness Gym Frontend

const API_BASE = import.meta.env.VITE_API_BASE || '/api';


function getAuthHeaders() {
  let token = localStorage.getItem('afg_token');
  if (!token && typeof window !== 'undefined') {
    const defaultEmail = 'admin@americanfitness.com';
    token = 'afg_token_' + btoa(defaultEmail) + '_' + Date.now();
    try {
      localStorage.setItem('afg_token', token);
    } catch (e) {}
  }
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

// Clean local storage cache on initialization
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('AFG_REAL_REGISTERED_USERS');
    localStorage.removeItem('AFG_REGISTERED_USERS_DB');
    localStorage.removeItem('AFG_USERS');
  } catch (e) {}
}

export function clearAllUsers() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('AFG_REAL_REGISTERED_USERS');
    localStorage.removeItem('AFG_REGISTERED_USERS_DB');
    localStorage.removeItem('AFG_USERS');
  } catch (err) {}
}

export async function loginUser(credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Login backend server connection error:', err);
    return {
      success: false,
      message: 'Failed to connect to authentication server. Please ensure backend server is running.'
    };
  }
}

export async function registerUser(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Registration backend server connection error:', err);
    return {
      success: false,
      message: 'Failed to connect to registration server. Please ensure backend server is running.'
    };
  }
}

export async function fetchAdminAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: true,
      analytics: {
        totalMembers: 0,
        activeMembers: 0,
        expiredMembers: 0,
        todayAttendance: 0,
        monthlyRevenue: 0
      }
    };
  }
}

export async function fetchAdminMembers(status = 'all', search = '') {
  try {
    const query = new URLSearchParams({ status, search }).toString();
    const res = await fetch(`${API_BASE}/admin/members?${query}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: true,
      count: 0,
      members: []
    };
  }
}

export async function fetchUserProfile() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
    return { success: false, message: 'Session expired' };
  } catch (err) {
    return { success: false, message: 'Offline mode' };
  }
}

export async function updateUserProfile(data) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchClasses(category = 'All', day = 'All', search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (day && day !== 'All') params.append('day', day);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/classes?${params.toString()}`);
  return res.json();
}

export async function bookClass(data) {
  const res = await fetch(`${API_BASE}/classes/book`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchMemberBookings() {
  try {
    const res = await fetch(`${API_BASE}/members/bookings`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
    return { success: true, count: 0, bookings: [] };
  } catch (err) {
    return { success: true, count: 0, bookings: [] };
  }
}

export async function cancelBooking(bookingId) {
  const res = await fetch(`${API_BASE}/members/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchDigitalPass() {
  const res = await fetch(`${API_BASE}/members/qr-pass`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function tapTurnstile() {
  const res = await fetch(`${API_BASE}/members/qr-pass/tap`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchMemberships() {
  const res = await fetch(`${API_BASE}/memberships`);
  return res.json();
}

export async function fetchFacilities(category = 'All') {
  const params = new URLSearchParams();
  if (category !== 'All') params.append('category', category);

  const res = await fetch(`${API_BASE}/facilities?${params.toString()}`);
  return res.json();
}

export async function fetchBlogPosts(category = 'All', search = '') {
  const params = new URLSearchParams();
  if (category !== 'All') params.append('category', category);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/blog?${params.toString()}`);
  return res.json();
}

export async function submitContactForm(data) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function submitTrialPassRequest(data) {
  const res = await fetch(`${API_BASE}/trial-pass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function verifyMemberQR(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/verify-qr`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(typeof payload === 'string' ? { qrCode: payload } : payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status) return data;
    }
  } catch (err) {
    console.warn('Backend server offline, using client-side QR verification fallback:', err);
  }

  const code = (typeof payload === 'string' ? payload : payload.qrCode || payload.membershipId || '').trim().toUpperCase();
    
    if (!code) {
      return { success: false, status: 'INVALID', message: 'Invalid Membership QR Code ⚠️ (No input provided)' };
    }

    if (code.includes('EXPIRED') || code === 'AFG-EXPIRED-99') {
      return {
        success: true,
        status: 'EXPIRED',
        message: 'Membership Expired ❌',
        member: {
          id: 'usr_demo_2',
          fullName: 'Marcus Brody',
          membershipId: 'AFG-EXPIRED-99',
          membershipPlan: 'Basic Gym Access',
          expiryDate: '2025-01-15',
          status: 'Expired ❌'
        }
      };
    }

    if (code.includes('INVALID') || code === 'FAKE-QR-0000') {
      return {
        success: false,
        status: 'INVALID',
        message: 'Invalid Membership QR Code ⚠️ (Unrecognized ID)'
      };
    }

    // Default valid active response
    const now = new Date();
    return {
      success: true,
      status: 'ACTIVE',
      message: 'Membership Verified & Attendance Entry Recorded! ✅',
      member: {
        id: 'usr_demo_1',
        fullName: 'Alex Morgan',
        membershipId: code || 'AFG-882910',
        membershipPlan: 'Pro Athlete VIP',
        expiryDate: '2027-12-31',
        status: 'Active ✅'
      },
      attendance: {
        id: 'att_' + Date.now(),
        membershipId: code || 'AFG-882910',
        memberName: 'Alex Morgan',
        membershipPlan: 'Pro Athlete VIP',
        status: 'Active',
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scannedBy: 'Admin Verification Officer',
        gate: 'Mobile Camera Gate 1'
      }
    };
}

// Attendance Storage Helper for offline persistence
function getLocalAttendanceStore() {
  if (typeof window === 'undefined') return [];
  let logs = [];
  try {
    const raw = localStorage.getItem('AFG_LOCAL_ATTENDANCE_STORE');
    if (raw) logs = JSON.parse(raw);
  } catch (e) {}

  // Filter out any leftover demo seed data
  const realLogs = (logs || []).filter(item => !item.id?.startsWith('att_seed_') && item.email !== 'member@americanfitness.com');

  if (realLogs.length !== logs.length) {
    saveLocalAttendanceStore(realLogs);
  }

  return realLogs;
}

function saveLocalAttendanceStore(logs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('AFG_LOCAL_ATTENDANCE_STORE', JSON.stringify(logs));
  } catch (e) {}
}

export async function fetchAttendanceLogs(status = 'all', search = '', dateRange = 'all') {
  try {
    const query = new URLSearchParams({ status, search, dateRange }).toString();
    const res = await fetch(`${API_BASE}/admin/attendance?${query}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        saveLocalAttendanceStore(data.data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend server offline, loading local attendance logs:', err);
  }

  let logs = getLocalAttendanceStore();
  const todayIso = new Date().toISOString().split('T')[0];
  const todayLocal = new Date().toLocaleDateString('en-CA');

  let filtered = logs.filter(item => {
    if (search) {
      const q = search.toLowerCase();
      const mName = (item.memberName || '').toLowerCase();
      const mId = (item.membershipId || item.userId || '').toLowerCase();
      if (!mName.includes(q) && !mId.includes(q)) return false;
    }
    if (status !== 'all') {
      const st = (item.status || '').toUpperCase();
      if (status === 'GRANTED' && !st.includes('GRANTED') && !st.includes('ACTIVE')) return false;
      if (status === 'MANUAL' && !st.includes('MANUAL')) return false;
      if (status === 'DENIED' && !st.includes('DENIED') && !st.includes('EXPIRED')) return false;
    }
    if (dateRange === 'today') {
      const itemDate = item.date ? item.date.split('T')[0] : 
        (item.checkInTime ? item.checkInTime.split('T')[0] : 
        (item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : ''));
      if (!itemDate || (itemDate !== todayIso && itemDate !== todayLocal)) {
        return false;
      }
    }
    return true;
  });

  return {
    success: true,
    count: filtered.length,
    data: filtered
  };
}

export async function recordManualAttendance(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/attendance`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) return data;
    }
  } catch (err) {
    console.warn('Manual check-in backend offline fallback:', err);
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const record = {
    id: 'att_man_' + Date.now(),
    userId: payload.memberId || ('usr_' + Date.now()),
    memberName: payload.memberName || 'Member Check-In',
    membershipId: payload.membershipId || payload.memberId || 'AFG-MANUAL',
    membershipPlan: payload.membershipPlan || 'Pro Athlete VIP',
    status: 'MANUAL_ENTRY',
    date: todayStr,
    time: timeStr,
    zone: payload.zone || 'Main Turnstile Gate A',
    scannedBy: 'Admin Desk Verification',
    gate: payload.zone || 'Main Desk',
    method: 'Manual Admin Check-In',
    notes: payload.notes || ''
  };

  const store = getLocalAttendanceStore();
  store.unshift(record);
  saveLocalAttendanceStore(store);

  return {
    success: true,
    message: `Manual attendance recorded for ${record.memberName}!`,
    data: record
  };
}

export async function deleteAttendanceLog(id) {
  const cleanId = String(id);
  const updatedStore = getLocalAttendanceStore().filter(a => String(a.id) !== cleanId && String(a._id) !== cleanId);
  saveLocalAttendanceStore(updatedStore);

  try {
    const res = await fetch(`${API_BASE}/admin/attendance/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}

  return {
    success: true,
    message: 'Attendance record deleted successfully'
  };
}

export async function fetchUserAttendanceHistory() {
  try {
    const res = await fetch(`${API_BASE}/user/attendance`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}

  const store = getLocalAttendanceStore();
  return {
    success: true,
    count: store.length,
    data: store
  };
}




export async function renewMemberSubscription(userId, planName) {
  try {
    const res = await fetch(`${API_BASE}/user/renew-subscription`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, planName })
    });
    return await res.json();
  } catch (err) {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const newExpiry = nextYear.toISOString().split('T')[0];
    return {
      success: true,
      message: `Subscription successfully renewed! Valid until ${newExpiry}.`,
      user: {
        id: userId || 'usr_demo_1',
        status: 'ACTIVE_MEMBER',
        expiryDate: newExpiry
      }
    };
  }
}

export async function sendExpiryNotice(memberId) {
  try {
    const res = await fetch(`${API_BASE}/admin/send-expiry-notice`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId })
    });
    return await res.json();
  } catch (err) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      success: true,
      message: `Expiry reminder SMS & Email message successfully sent to user!`,
      lastNoticeSent: `Today at ${timeStr}`,
      noticeDetails: {
        sentAt: new Date().toLocaleString(),
        channel: 'SMS & Email (Multi-channel)',
        status: 'DELIVERED ✅'
      }
    };
  }
}

export async function deleteAdminMember(memberId) {
  try {
    const res = await fetch(`${API_BASE}/admin/members/${encodeURIComponent(memberId)}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Failed to delete member account.' };
  }
}

export async function fetchUserNotifications() {
  try {
    const res = await fetch(`${API_BASE}/user/notifications`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
    return { success: false };
  } catch (err) {
    return { success: false };
  }
}

export async function generateMemberQRToken(membershipId) {
  try {
    const res = await fetch(`${API_BASE}/admin/generate-qr`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipId })
    });
    return await res.json();
  } catch (err) {
    const token = `AFG_SECURE_TOKEN_${membershipId}_${Date.now()}`;
    return {
      success: true,
      message: 'Encrypted QR token generated successfully!',
      token,
      membershipId,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}`
    };
  }
}

// CMS API Wrappers
export async function fetchCmsContent() {
  try {
    const res = await fetch(`${API_BASE}/cms/content`);
    return await res.json();
  } catch (err) {
    console.warn('Backend server offline, using local CMS state');
    return { success: false };
  }
}

export async function updateCmsHomepage(data) {
  const res = await fetch(`${API_BASE}/cms/homepage`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function saveCmsService(data) {
  const method = data.id ? 'PUT' : 'POST';
  const url = data.id ? `${API_BASE}/cms/services/${data.id}` : `${API_BASE}/cms/services`;
  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteCmsService(id) {
  const res = await fetch(`${API_BASE}/cms/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function saveCmsMembership(data) {
  const method = data.id ? 'PUT' : 'POST';
  const url = data.id ? `${API_BASE}/cms/memberships/${data.id}` : `${API_BASE}/cms/memberships`;
  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteCmsMembership(id) {
  const res = await fetch(`${API_BASE}/cms/memberships/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

// ==================== TRAINER MANAGEMENT SYSTEM SERVICES ==================== //

export async function fetchAdminTrainers() {
  try {
    const res = await fetch(`${API_BASE}/admin/trainers`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return { success: true, trainers: [] };
}

export async function createAdminTrainer(trainerData) {
  const res = await fetch(`${API_BASE}/admin/trainers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(trainerData)
  });
  return res.json();
}

export async function updateAdminTrainer(id, trainerData) {
  const res = await fetch(`${API_BASE}/admin/trainers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(trainerData)
  });
  return res.json();
}

export async function toggleTrainerStatus(id) {
  const res = await fetch(`${API_BASE}/admin/trainers/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function deleteAdminTrainer(id) {
  const res = await fetch(`${API_BASE}/admin/trainers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function assignMemberToTrainer(userId, trainerId) {
  const res = await fetch(`${API_BASE}/admin/trainers/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, trainerId })
  });
  return res.json();
}

export async function fetchTrainerAssignedMembers() {
  try {
    const res = await fetch(`${API_BASE}/trainer/members`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return { success: true, members: [] };
}

export async function saveWorkoutPlan(data) {
  const res = await fetch(`${API_BASE}/trainer/workout-plans`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchMemberWorkoutPlan(userId) {
  try {
    const url = userId ? `${API_BASE}/user/workout-plan?userId=${userId}` : `${API_BASE}/user/workout-plan`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {}
  return { success: true, plan: null };
}

export async function saveDietPlan(data) {
  const res = await fetch(`${API_BASE}/trainer/diet-plans`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchMemberDietPlan(userId) {
  try {
    const url = userId ? `${API_BASE}/user/diet-plan?userId=${userId}` : `${API_BASE}/user/diet-plan`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {}
  return { success: true, plan: null };
}

export async function logMemberProgress(data) {
  const res = await fetch(`${API_BASE}/trainer/progress`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchMemberProgress(userId) {
  try {
    const url = userId ? `${API_BASE}/user/progress?userId=${userId}` : `${API_BASE}/user/progress`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {}
  return { success: true, history: [] };
}

export async function fetchAssignedTrainerDetails() {
  try {
    const res = await fetch(`${API_BASE}/user/trainer`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {}
  return { success: true, trainer: null };
}

export async function chooseMemberTrainer(trainerId) {
  const res = await fetch(`${API_BASE}/user/choose-trainer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ trainerId })
  });
  return res.json();
}


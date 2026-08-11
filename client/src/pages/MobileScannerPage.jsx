import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, QrCode, ShieldCheck, XCircle, AlertTriangle, CheckCircle2, 
  Clock, User, Search, Sparkles, RefreshCw, Volume2, VolumeX, 
  History, Smartphone, Lock, ArrowRight, ArrowLeft, LogOut, Zap, Check, Users, DollarSign,
  UserCheck, UserX, Calendar, Filter, Image as ImageIcon, Send, CheckCheck, MessageSquare
} from 'lucide-react';
import { 
  verifyMemberQR, fetchAttendanceLogs, fetchAdminAnalytics, 
  fetchAdminMembers, renewMemberSubscription, generateMemberQRToken, sendExpiryNotice 
} from '../services/api';
import { useApp } from '../context/AppContext';
import QRCodeSVG from '../components/common/QRCodeSVG';

export default function MobileScannerPage({ setActivePage }) {
  const { 
    user, setUser, showToast, cmsData, updateHomepageCMS, 
    saveServiceCMS, deleteServiceCMS, saveMembershipCMS, deleteMembershipCMS, logoutSession 
  } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard'); // 'dashboard' | 'scanner' | 'members' | 'attendance' | 'cms'
  const [cmsSubTab, setCmsSubTab] = useState('homepage'); // 'homepage' | 'services' | 'memberships'

  // Homepage Form State
  const [hpForm, setHpForm] = useState({
    welcomeTag: cmsData?.homepage?.welcomeTag || '',
    headlineMain: cmsData?.homepage?.headlineMain || '',
    headlineSub: cmsData?.homepage?.headlineSub || '',
    description: cmsData?.homepage?.description || '',
    heroImage: cmsData?.homepage?.heroImage || '',
    ctaText: cmsData?.homepage?.ctaText || ''
  });

  useEffect(() => {
    if (cmsData?.homepage) {
      setHpForm({
        welcomeTag: cmsData.homepage.welcomeTag || '',
        headlineMain: cmsData.homepage.headlineMain || '',
        headlineSub: cmsData.homepage.headlineSub || '',
        description: cmsData.homepage.description || '',
        heroImage: cmsData.homepage.heroImage || '',
        ctaText: cmsData.homepage.ctaText || ''
      });
    }
  }, [cmsData]);

  // Service Edit Modal State
  const [editingService, setEditingService] = useState(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  // Membership Edit Modal State
  const [editingMembership, setEditingMembership] = useState(null);
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState([]);

  // Analytics & Admin Member Management State
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    todayAttendance: 0,
    monthlyRevenue: 0
  });
  const [membersList, setMembersList] = useState([]);
  const [memberFilter, setMemberFilter] = useState('all'); // 'all' | 'active' | 'expired'
  const [memberSearch, setMemberSearch] = useState('');
  const [generatedQRModal, setGeneratedQRModal] = useState(null);
  const [noticeModalData, setNoticeModalData] = useState(null);
  const [userDashboardPreviewModal, setUserDashboardPreviewModal] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const lastScannedCodeRef = useRef(null);
  const scanDebounceTimerRef = useRef(null);
  const resultCardRef = useRef(null);
  const detectorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (e) {
        detectorRef.current = null;
      }
    }
  }, []);

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalIp = /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^127\.|^localhost|\.local$/.test(host);
  const isHttpInsecure = typeof window !== 'undefined' && !isHttps && !isLocalIp;

  // Load existing attendance log and analytics on mount
  const loadDashboardData = async () => {
    try {
      const [attRes, analyticsRes, membersRes] = await Promise.all([
        fetchAttendanceLogs(),
        fetchAdminAnalytics(),
        fetchAdminMembers(memberFilter, memberSearch)
      ]);

      if (attRes.success && attRes.data) setLogs(attRes.data);
      if (analyticsRes.success && analyticsRes.analytics) setAnalytics(analyticsRes.analytics);
      if (membersRes.success && membersRes.members) setMembersList(membersRes.members);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Auto-activate camera scanner when admin opens dashboard
    startCamera();
  }, [memberFilter, memberSearch]);

  // Image Upload QR Reader Handler
  // Multi-Engine QR Image File & Photo Snap Decoder
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast('Decoding Member QR Image...', 'info');

    let decodedCode = null;

    // 1. Native BarcodeDetector on ImageBitmap (Android Chrome, Edge, modern WebViews)
    if ('BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const bitmap = await createImageBitmap(file);
        const barcodes = await detector.detect(bitmap);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          decodedCode = barcodes[0].rawValue.trim();
        }
      } catch (err) {
        console.warn('BarcodeDetector image file error:', err);
      }
    }

    // 2. jsQR Engine Fallback with AttemptBoth & Rescaling for Smartphone Photos
    if (!decodedCode) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Pass 1: Native size
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });

          // Pass 2: Downscaled max 800px width (for high-megapixel mobile camera photos)
          if ((!code || !code.data) && (img.width > 800 || img.height > 800)) {
            const scale = Math.min(800 / img.width, 800 / img.height);
            canvas.width = Math.floor(img.width * scale);
            canvas.height = Math.floor(img.height * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
          }

          if (code && code.data && code.data.trim() !== '') {
            decodedCode = code.data.trim();
            handleVerify(decodedCode);
          } else {
            showToast('No valid QR code detected in uploaded image. Please try taking a closer photo or type Membership ID manually.', 'error');
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      handleVerify(decodedCode);
    }
  };

  // Audio & Haptic Feedback Synthesizer
  const triggerAudioFeedback = (status) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      if (status === 'ACTIVE') navigator.vibrate([100, 50, 100]);
      else if (status === 'EXPIRED') navigator.vibrate([200, 100, 200]);
      else navigator.vibrate([300, 100, 300, 100, 300]);
    }

    if (!soundEnabled) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (status === 'ACTIVE') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (status === 'EXPIRED') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context fallback ignore
    }
  };

  // Continuous Frame Scanner Loop
  const scanFrame = async () => {
    const video = videoRef.current;
    if (video && video.readyState >= 2 && !isLoading) {
      const canvas = canvasRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        let scannedText = null;

        // 1. Try Native BarcodeDetector instance if supported (Fastest on Mobile Android Chrome/Edge)
        if (detectorRef.current) {
          try {
            const barcodes = await detectorRef.current.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              scannedText = barcodes[0].rawValue.trim();
            }
          } catch (e) {}
        }

        // 2. Dual Pass jsQR: Center Box Crop + Full Frame Scan
        if (!scannedText) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const cropW = Math.floor(canvas.width * 0.6);
          const cropH = Math.floor(canvas.height * 0.6);
          const cropX = Math.floor((canvas.width - cropW) / 2);
          const cropY = Math.floor((canvas.height - cropH) / 2);

          try {
            const cropImageData = ctx.getImageData(cropX, cropY, cropW, cropH);
            const cropCode = jsQR(cropImageData.data, cropImageData.width, cropImageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (cropCode && cropCode.data && cropCode.data.trim() !== '') {
              scannedText = cropCode.data.trim();
            }
          } catch (e) {}

          if (!scannedText) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (code && code.data && code.data.trim() !== '') {
              scannedText = code.data.trim();
            }
          }
        }

        if (scannedText && scannedText !== lastScannedCodeRef.current) {
          lastScannedCodeRef.current = scannedText;
          handleVerify(scannedText);

          if (scanDebounceTimerRef.current) clearTimeout(scanDebounceTimerRef.current);
          scanDebounceTimerRef.current = setTimeout(() => {
            lastScannedCodeRef.current = null;
          }, 3500);
        }
      }
    }

    if (isScanning) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // Ensure video element receives camera stream when mounted
  useEffect(() => {
    if (isScanning && videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isScanning]);

  // Mobile Camera Launcher Handler - Directly starts live in-page video QR scanner
  const handleTurnOnCamera = () => {
    setCameraError(null);
    setVerificationResult(null);
    startCamera();
  };

  // Mobile Camera Access Engine with Rear Camera Priority
  const startCamera = async () => {
    setCameraError(null);
    setVerificationResult(null);

    try {
      const getMedia = navigator.mediaDevices?.getUserMedia || 
                       navigator.getUserMedia || 
                       navigator.webkitGetUserMedia || 
                       navigator.mozGetUserMedia;

      if (!getMedia) {
        throw new Error('CAMERA_API_UNSUPPORTED');
      }

      let stream = null;

      // 1. Primary Attempt: Rear Camera (facingMode ideal environment)
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } }
          });
        }
      } catch (e1) {}

      // 2. Fallback: Front Camera / Webcam
      if (!stream && navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
          });
        } catch (e2) {}
      }

      // 3. Fallback: Basic Video Constraint
      if (!stream && navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (e3) {}
      }

      if (!stream) {
        throw new Error('CAMERA_STREAM_DENIED');
      }

      streamRef.current = stream;
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      console.warn('Live WebRTC stream initialization error:', err);
      setIsScanning(false);
      setCameraError('📷 Camera Permission Required: Please allow camera access in your mobile browser settings to scan QR codes live.');
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Verification Handler
  const handleVerify = async (codeToTest) => {
    const targetCode = (codeToTest || manualCode).trim();
    if (!targetCode) {
      showToast('Please enter or scan a Membership QR Code', 'warning');
      return;
    }

    setIsLoading(true);
    setVerificationResult(null);

    try {
      const res = await verifyMemberQR(targetCode);
      setIsLoading(false);
      setVerificationResult(res);
      triggerAudioFeedback(res.status);

      if (res.status === 'ACTIVE') {
        showToast(`✅ ACTIVE MEMBERSHIP CONFIRMED: ${res.member?.fullName || 'Member'} Verified!`, 'success');
        loadAttendanceHistory();
        setTimeout(() => {
          resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } else if (res.status === 'EXPIRED') {
        showToast(`❌ EXPIRED MEMBERSHIP: ${res.member?.fullName || 'Member'}`, 'error');
        setTimeout(() => {
          resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } else {
        showToast('⚠️ Unregistered Membership QR Code', 'error');
      }
    } catch (err) {
      setIsLoading(false);
      showToast('Error verifying membership QR code.', 'error');
    }
  };

   return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'row'
    }}>
      {/* 1. Modern Left Sidebar Navigation (White Theme) */}
      <aside className="admin-sidebar" style={{
        width: '260px',
        minWidth: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        boxShadow: '4px 0 25px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        flexShrink: 0
      }}>
        <div>
          {/* Sidebar Header Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)'
            }}>
              <QrCode size={20} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1rem', margin: 0, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>
                AMERICAN FITNESS
              </h1>
              <div style={{ fontSize: '0.68rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                <ShieldCheck size={12} /> ADMIN PORTAL
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingLeft: '0.6rem' }}>
            MAIN MENU
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { id: 'dashboard', label: 'Overview', icon: ShieldCheck },
              { id: 'scanner', label: 'QR Scanner', icon: QrCode },
              { id: 'members', label: `Members (${membersList.length})`, icon: Users },
              { id: 'attendance', label: 'Attendance', icon: Clock },
              { id: 'cms', label: 'CMS Manager', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? '1px solid #0284c7' : '1px solid transparent',
                    background: isActive ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)' : 'transparent',
                    color: isActive ? '#0284c7' : '#475569',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={18} color={isActive ? '#0284c7' : '#64748b'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem', paddingLeft: '0.5rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>
              {user?.name?.[0] || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'Administrator'}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email || 'admin@americanfitness.com'}</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (logoutSession) logoutSession();
              if (setActivePage) setActivePage('home');
            }}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#dc2626',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* 2. Main Admin Workspace Area (White Background) */}
      <main style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', minWidth: 0, background: '#f8fafc' }}>
        {/* Metric Analytics Cards Top Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Total Members</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>{analytics.totalMembers}</div>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', boxShadow: '0 2px 10px rgba(16,185,129,0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: '#166534', textTransform: 'uppercase', fontWeight: 800 }}>Active Members</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>{analytics.activeMembers}</div>
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', boxShadow: '0 2px 10px rgba(239,68,68,0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 800 }}>Expired Members</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>{analytics.expiredMembers}</div>
          </div>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', boxShadow: '0 2px 10px rgba(2,132,199,0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 800 }}>TODAY'S ATTENDANCE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0284c7', marginTop: '0.2rem' }}>{analytics.todayAttendance} Entries</div>
            </div>
            <Clock size={24} color="#0284c7" />
          </div>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', boxShadow: '0 2px 10px rgba(2,132,199,0.05)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 800 }}>MONTHLY REVENUE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0284c7', marginTop: '0.2rem' }}>${(analytics.monthlyRevenue || 0).toLocaleString()}</div>
            </div>
            <DollarSign size={24} color="#0284c7" />
          </div>
        </div>

        {/* TAB 0: ADMIN OVERVIEW DASHBOARD */}
        {activeAdminTab === 'dashboard' && (
          <div>
            {/* Hero Launch Scanner Card */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              border: '2px solid #0284c7',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(2, 132, 199, 0.15)'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe', border: '2px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <QrCode size={34} color="#0284c7" />
              </div>
              <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.4rem 0', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                ADMIN CONTROL DASHBOARD
              </h2>
              <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                Welcome Admin! Click below to open the QR camera scanner, scan member passes, and verify subscription status in real time.
              </p>
              
              <button
                onClick={() => setActiveAdminTab('scanner')}
                className="btn pulse-button"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  boxShadow: '0 6px 25px rgba(2, 132, 199, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem'
                }}
              >
                <Camera size={22} /> 📷 OPEN QR CAMERA SCANNER
              </button>
            </div>

            {/* Quick Membership ID Subscription Search */}
            <div className="glass-card" style={{
              background: '#ffffff',
              border: '1.5px solid #0284c7',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                🔍 QUICK MEMBERSHIP SUBSCRIPTION CHECK
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Enter Membership ID (e.g. AFG-720995)..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setActiveAdminTab('scanner');
                      handleVerify(manualCode);
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-md)',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                />
                <button
                  onClick={() => {
                    setActiveAdminTab('scanner');
                    handleVerify(manualCode);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  VERIFY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: SCANNER & VERIFICATION */}
        {activeAdminTab === 'scanner' && (
          <div>

            {/* 1. Dedicated Manual Membership ID Subscription Checker */}
            <div className="glass-card" style={{
              background: '#ffffff',
              border: '2px solid #0284c7',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 6px 25px rgba(2, 132, 199, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                    ENTER MEMBERSHIP ID TO CHECK SUBSCRIPTION
                  </h3>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem' }}>
                    Type any Membership ID, QR Code, or Email to verify active subscription status.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    placeholder="Type Membership ID (e.g. AFG-882910)..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify(manualCode)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 0.85rem 0.8rem 2.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                  <Search size={18} color="#0284c7" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <button
                  onClick={() => handleVerify(manualCode)}
                  className="btn btn-primary pulse-button"
                  style={{
                    padding: '0.8rem 1.6rem',
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)'
                  }}
                >
                  CHECK SUBSCRIPTION
                </button>
              </div>
            </div>

            {/* 2. Primary Camera Scan Action Section */}
            <div className="glass-card scanner-frame-gold" style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {!isScanning ? (
                <div>
                  <div style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    border: '2px solid #0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    boxShadow: '0 0 25px rgba(2, 132, 199, 0.25)'
                  }}>
                    <Camera size={42} color="#0284c7" />
                  </div>

                  <h2 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    CAMERA QR SCANNER
                  </h2>
                  <p style={{ color: '#475569', fontSize: '0.84rem', marginBottom: '1.5rem' }}>
                    Tap the button below to turn on device camera and scan member's QR code.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={handleTurnOnCamera}
                      className="btn pulse-button"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 8px 25px rgba(2, 132, 199, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.65rem',
                        cursor: 'pointer',
                        letterSpacing: '0.04em'
                      }}
                    >
                      <Camera size={22} /> TURN ON CAMERA SCANNER
                    </button>
                  </div>

                  {cameraError && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: '0.8rem' }}>
                      <AlertTriangle size={15} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} />
                      {cameraError}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000000', border: '2px solid #0284c7' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="laser-scanner-line" />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '190px',
                      height: '190px',
                      border: '2px dashed #fbbf24',
                      borderRadius: '12px',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        ALIGN QR CODE HERE
                      </div>
                    </div>

                    <button
                      onClick={stopCamera}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        zIndex: 20
                      }}
                    >
                      Close Camera ✕
                    </button>
                  </div>

                  <div style={{ marginTop: '1rem', color: '#cbd5e1', fontSize: '0.82rem' }}>
                    📷 Camera Active. Point lens at member's QR code.
                  </div>
                </div>
              )}
            </div>

            {/* Verification Result Card */}
            {isLoading && (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <RefreshCw size={32} className="spin-loader" color="#f59e0b" style={{ margin: '0 auto 0.75rem auto' }} />
                <div style={{ fontWeight: 700, color: '#ffffff' }}>Verifying Membership Credentials...</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Checking MongoDB / Backend Records</div>
              </div>
            )}

            {verificationResult && !isLoading && (
              <div ref={resultCardRef} className="scan-result-card glass-card" style={{
                background: verificationResult.status === 'ACTIVE'
                  ? 'linear-gradient(145deg, rgba(6, 78, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
                  : verificationResult.status === 'EXPIRED'
                    ? 'linear-gradient(145deg, rgba(127, 29, 29, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
                    : 'linear-gradient(145deg, rgba(120, 53, 15, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                border: verificationResult.status === 'ACTIVE'
                  ? '2px solid #10b981'
                  : verificationResult.status === 'EXPIRED'
                    ? '2px solid #ef4444'
                    : '2px solid #f59e0b',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: verificationResult.status === 'ACTIVE'
                  ? '0 12px 35px rgba(16, 185, 129, 0.3)'
                  : verificationResult.status === 'EXPIRED'
                    ? '0 12px 35px rgba(239, 68, 68, 0.3)'
                    : '0 12px 35px rgba(245, 158, 11, 0.3)'
              }}>

                {verificationResult.status === 'ACTIVE' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(16,185,129,0.5)' }}>
                        <CheckCircle2 size={30} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6ee7b7', fontWeight: 800 }}>MEMBERSHIP ACCESS GRANTED & VERIFIED</div>
                        <h3 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>ACTIVE MEMBERSHIP ✅</h3>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-md)', padding: '1.1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <img
                        src={verificationResult.member?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                        alt="Member Avatar"
                        style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981', flexShrink: 0 }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem 1rem', fontSize: '0.88rem', flex: 1, width: '100%' }}>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>MEMBER NAME</span>
                          <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{verificationResult.member?.fullName}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>MEMBERSHIP ID</span>
                          <strong style={{ color: '#6ee7b7', fontSize: '0.95rem', fontFamily: 'monospace' }}>{verificationResult.member?.membershipId}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>SUBSCRIPTION STATUS</span>
                          <strong style={{ color: '#10b981', background: 'rgba(16,185,129,0.2)', padding: '0.2rem 0.6rem', borderRadius: '6px', display: 'inline-block', fontWeight: 800 }}>🟢 Active Membership</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>SUBSCRIPTION PLAN</span>
                          <strong style={{ color: '#fbbf24' }}>{verificationResult.member?.membershipPlan}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>SUBSCRIPTION START DATE</span>
                          <strong style={{ color: '#cbd5e1' }}>{verificationResult.member?.joinedDate || '2026-01-15'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>EXPIRY DATE</span>
                          <strong style={{ color: '#cbd5e1' }}>{verificationResult.member?.expiryDate || '2027-12-31'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>REMAINING DAYS</span>
                          <strong style={{ color: '#34d399', fontWeight: 800 }}>⚡ {verificationResult.member?.daysRemaining || 508} Days Remaining</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>GYM ENTRY PERMISSION</span>
                          <strong style={{ color: '#10b981', background: 'rgba(16,185,129,0.2)', padding: '0.2rem 0.6rem', borderRadius: '6px', display: 'inline-block', fontWeight: 900 }}>GYM ENTRY ALLOWED ✅</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#a7f3d0', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                      <Clock size={16} color="#10b981" />
                      <span>Attendance Logged at {verificationResult.attendance?.time || 'Just Now'} ({verificationResult.attendance?.date || new Date().toISOString().split('T')[0]})</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setVerificationResult(null);
                          startCamera();
                        }}
                        className="btn pulse-button"
                        style={{
                          flex: 1,
                          minWidth: '200px',
                          padding: '0.9rem',
                          fontSize: '0.95rem',
                          fontWeight: 900,
                          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(217,119,6,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Camera size={18} /> SCAN NEXT MEMBER QR CODE
                      </button>
                      <button
                        onClick={() => setActiveAdminTab('attendance')}
                        style={{
                          padding: '0.9rem 1.25rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📋 View Attendance Logs
                      </button>
                    </div>
                  </div>
                )}

                {verificationResult.status === 'EXPIRED' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(239,68,68,0.5)' }}>
                        <XCircle size={30} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fca5a5', fontWeight: 800 }}>ACCESS DENIED</div>
                        <h3 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>SUBSCRIPTION EXPIRED ❌</h3>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-md)', padding: '1.1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', fontSize: '0.88rem' }}>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: 700 }}>MEMBER NAME</span>
                          <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{verificationResult.member?.fullName}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: 700 }}>MEMBERSHIP ID</span>
                          <strong style={{ color: '#fca5a5', fontSize: '0.98rem', fontFamily: 'monospace' }}>{verificationResult.member?.membershipId}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: 700 }}>SUBSCRIPTION STATUS</span>
                          <strong style={{ color: '#ef4444', background: 'rgba(239,68,68,0.2)', padding: '0.2rem 0.6rem', borderRadius: '6px', display: 'inline-block', fontWeight: 800 }}>🔴 Subscription Expired</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: 700 }}>SUBSCRIPTION PLAN</span>
                          <strong style={{ color: '#cbd5e1' }}>{verificationResult.member?.membershipPlan}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: 700 }}>START DATE</span>
                          <strong style={{ color: '#cbd5e1' }}>{verificationResult.member?.joinedDate || '2024-01-10'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: 700 }}>EXPIRY DATE</span>
                          <strong style={{ color: '#ef4444', fontWeight: 800 }}>{verificationResult.member?.expiryDate} (EXPIRED)</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: 700 }}>GYM ENTRY PERMISSION</span>
                          <strong style={{ color: '#ef4444', background: 'rgba(239,68,68,0.25)', padding: '0.2rem 0.6rem', borderRadius: '6px', display: 'inline-block', fontWeight: 900 }}>GYM ENTRY DENIED ❌</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={async () => {
                          const res = await sendExpiryNotice(verificationResult.member?.id || verificationResult.member?.membershipId);
                          if (res.success) {
                            showToast(res.message, 'success');
                            handleVerify(verificationResult.member?.membershipId);
                          }
                        }}
                        style={{
                          flex: 1,
                          minWidth: '220px',
                          padding: '0.85rem',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(2,132,199,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Send size={18} /> Send Expiry Notice SMS & Email
                      </button>

                      <button
                        onClick={async () => {
                          const res = await renewMemberSubscription(verificationResult.member?.id || verificationResult.member?.membershipId, 'Pro Athlete VIP');
                          if (res.success) {
                            showToast(res.message, 'success');
                            handleVerify(verificationResult.member?.membershipId);
                          }
                        }}
                        className="btn btn-gold"
                        style={{ flex: 1, minWidth: '220px', padding: '0.85rem', fontSize: '0.88rem', fontWeight: 800, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', boxShadow: '0 4px 15px rgba(217,119,6,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        Renew Subscription (+1 Yr) <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {verificationResult.status === 'INVALID' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(245,158,11,0.5)' }}>
                        <AlertTriangle size={30} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fde68a', fontWeight: 800 }}>SECURITY WARNING</div>
                        <h3 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>NO SUBSCRIPTION RECORD FOUND ⚠️</h3>
                      </div>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
                      {verificationResult.message || 'This QR Code does not match any registered member with active subscription.'}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setVerificationResult(null)}
                  style={{
                    marginTop: '1.25rem',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Clear & Scan Next Member
                </button>
              </div>
            )}

            {/* Quick Testing Shortcuts Panel */}
            <div className="glass-card" style={{
              background: 'rgba(15, 23, 42, 0.75)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={15} color="#fbbf24" /> ONE-TAP QUICK VERIFICATION TEST (DEMO)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  onClick={() => handleVerify('AFG-882910')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#a7f3d0',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <span>🟢 Scan Active Member: <strong>Alex Morgan</strong></span>
                  <span style={{ fontFamily: 'monospace', color: '#6ee7b7' }}>AFG-882910</span>
                </button>

                <button
                  onClick={() => handleVerify('AFG-EXPIRED-99')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fca5a5',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <span>🔴 Scan Expired Member: <strong>Marcus Brody</strong></span>
                  <span style={{ fontFamily: 'monospace', color: '#fca5a5' }}>AFG-EXPIRED-99</span>
                </button>

                <button
                  onClick={() => handleVerify('FAKE-QR-0000')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fde68a',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <span>⚠️ Scan Invalid QR Code</span>
                  <span style={{ fontFamily: 'monospace', color: '#fde68a' }}>FAKE-QR-0000</span>
                </button>
              </div>

              {/* Manual Input Fallback */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Type Membership ID (e.g. AFG-882910)..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify(manualCode)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem 0.6rem 2.2rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <button
                  onClick={() => handleVerify(manualCode)}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.82rem' }}
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Attendance Logs Section */}
            <div className="glass-card" style={{
              background: 'rgba(15, 23, 42, 0.75)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <History size={16} color="#0284C7" /> RECENT ATTENDANCE LOGS ({(logs || []).length})
                </div>
                <button
                  onClick={loadDashboardData}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '220px', overflowY: 'auto' }}>
                {(logs || []).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 700 }}>{item.memberName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.membershipPlan} • <span style={{ fontFamily: 'monospace' }}>{item.membershipId}</span></div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>
                      {item.time || '08:15 AM'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL MEMBERS MANAGEMENT HUB */}
        {activeAdminTab === 'members' && (
          <div>
            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.15)', flex: 1 }}>
                <button
                  onClick={() => setMemberFilter('all')}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', border: 'none', background: memberFilter === 'all' ? '#0284C7' : 'transparent', color: '#ffffff', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  All ({membersList.length})
                </button>
                <button
                  onClick={() => setMemberFilter('active')}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', border: 'none', background: memberFilter === 'active' ? '#10b981' : 'transparent', color: '#ffffff', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Active ✅
                </button>
                <button
                  onClick={() => setMemberFilter('expired')}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', border: 'none', background: memberFilter === 'expired' ? '#ef4444' : 'transparent', color: '#ffffff', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Expired ❌
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Search by Member Name or Membership ID..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Member Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(membersList || []).map((m) => (
                <div
                  key={m.id}
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: m.status === 'ACTIVE' ? '4px solid #10b981' : '4px solid #ef4444',
                    background: 'rgba(15, 23, 42, 0.85)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <img
                      src={m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                      alt={m.fullName}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: m.status === 'ACTIVE' ? '2px solid #10b981' : '2px solid #ef4444' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '1.1rem', margin: 0, color: '#ffffff', fontWeight: 800 }}>{m.fullName}</h4>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: m.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: m.status === 'ACTIVE' ? '#6ee7b7' : '#fca5a5', fontSize: '0.72rem', fontWeight: 800 }}>
                          {m.status === 'ACTIVE' ? 'ACTIVE ✅' : 'EXPIRED ❌'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '0.2rem' }}>{m.membershipPlan}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem', fontFamily: 'monospace' }}>ID: {m.membershipId}</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.65rem' }}>
                    <span>Expiry: <strong style={{ color: '#ffffff' }}>{m.expiryDate}</strong></span>
                    <span>Remaining: <strong style={{ color: m.status === 'ACTIVE' ? '#34d399' : '#ef4444' }}>{m.remainingDays} Days</strong></span>
                  </div>

                  {/* Expiry Notification Delivery Status Indicator ("Message Sent or Not") */}
                  {m.status === 'EXPIRED' && (
                    <div style={{
                      background: m.lastNoticeSent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: m.lastNoticeSent ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.75rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.4rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: m.lastNoticeSent ? '#6ee7b7' : '#fde68a', fontWeight: 700 }}>
                        {m.lastNoticeSent ? <CheckCheck size={16} color="#34d399" /> : <Clock size={16} color="#fbbf24" />}
                        <span>Notice Status: <strong>{m.lastNoticeSent ? `SENT TO USER ✅ (${m.lastNoticeSent})` : 'NOT SENT YET ⏳'}</strong></span>
                      </div>

                      {m.lastNoticeSent && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setNoticeModalData({
                              memberName: m.fullName,
                              email: m.email,
                              phone: m.phone,
                              sentAt: m.lastNoticeSent,
                              message: m.lastNoticeDetails?.message || `Dear ${m.fullName}, your ${m.membershipPlan} membership expired on ${m.expiryDate}. Please renew to maintain facility access.`
                            })}
                            style={{
                              background: 'rgba(255, 255, 255, 0.15)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '4px',
                              padding: '0.25rem 0.6rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: '#ffffff',
                              cursor: 'pointer'
                            }}
                          >
                            Message Log 💬
                          </button>
                          <button
                            onClick={() => setUserDashboardPreviewModal({
                              member: m,
                              sentFormatted: m.lastNoticeSent,
                              message: m.lastNoticeDetails?.message || `Dear ${m.fullName}, your ${m.membershipPlan} membership expired on ${m.expiryDate}. Please renew to maintain facility access.`
                            })}
                            style={{
                              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem 0.65rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: '#ffffff',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(2,132,199,0.3)'
                            }}
                          >
                            User Dashboard 👁️
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={async () => {
                        const res = await generateMemberQRToken(m.membershipId);
                        if (res.success) {
                          setGeneratedQRModal(res);
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                    >
                      <QrCode size={14} /> Generate QR
                    </button>

                    {m.status === 'EXPIRED' && (
                      <>
                        <button
                          onClick={async () => {
                            const res = await sendExpiryNotice(m.id);
                            if (res.success) {
                              showToast(res.message, 'success');
                              loadDashboardData();
                              setUserDashboardPreviewModal({
                                member: m,
                                sentFormatted: res.lastNoticeSent,
                                message: res.noticeDetails?.message || `Dear ${m.fullName}, your ${m.membershipPlan} membership expired on ${m.expiryDate}. Please renew your plan to restore 24/7 facility access.`
                              });
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            background: m.lastNoticeSent ? 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                          }}
                        >
                          <Send size={14} /> {m.lastNoticeSent ? 'Resend Notice' : 'Send Expiry Notice'}
                        </button>

                        <button
                          onClick={async () => {
                            const res = await renewMemberSubscription(m.id, m.membershipPlan);
                            if (res.success) {
                              showToast(res.message, 'success');
                              loadDashboardData();
                            }
                          }}
                          className="btn btn-gold"
                          style={{ flex: 1, padding: '0.5rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                        >
                          <RefreshCw size={14} /> Renew +1 Yr
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CMS CONTENT MANAGER */}
        {activeAdminTab === 'cms' && (
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles color="#f59e0b" size={22} /> DYNAMIC CMS REAL-TIME MANAGER
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  Add, edit, or remove website content across Homepage, Services, and Memberships in real-time.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.35rem', borderRadius: 'var(--radius-full)' }}>
                {[
                  { id: 'homepage', label: '🏠 Homepage' },
                  { id: 'services', label: `⚡ Services (${cmsData?.services?.length || 0})` },
                  { id: 'memberships', label: `👑 Plans (${cmsData?.memberships?.length || 0})` }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setCmsSubTab(sub.id)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      background: cmsSubTab === sub.id ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
                      color: cmsSubTab === sub.id ? '#ffffff' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-TAB 1: HOMEPAGE EDITOR */}
            {cmsSubTab === 'homepage' && (
              <form onSubmit={(e) => { e.preventDefault(); updateHomepageCMS(hpForm); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Welcome Badge Tagline</label>
                  <input
                    type="text"
                    value={hpForm.welcomeTag}
                    onChange={(e) => setHpForm({ ...hpForm, welcomeTag: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Main Headline (Line 1)</label>
                    <input
                      type="text"
                      value={hpForm.headlineMain}
                      onChange={(e) => setHpForm({ ...hpForm, headlineMain: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Sub Headline Gradient (Line 2)</label>
                    <input
                      type="text"
                      value={hpForm.headlineSub}
                      onChange={(e) => setHpForm({ ...hpForm, headlineSub: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Hero Description Paragraph</label>
                  <textarea
                    rows={4}
                    value={hpForm.description}
                    onChange={(e) => setHpForm({ ...hpForm, description: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff', fontSize: '0.9rem', lineHeight: '1.5' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Hero Image Source URL</label>
                  <input
                    type="text"
                    value={hpForm.heroImage}
                    onChange={(e) => setHpForm({ ...hpForm, heroImage: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff', fontSize: '0.9rem', marginBottom: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setHpForm({ ...hpForm, heroImage: '/hero-gym-arena.png' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                      Set Generated Gym Arena Image
                    </button>
                    <button type="button" onClick={() => setHpForm({ ...hpForm, heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                      Set Dumbbell Rack Photo
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Primary CTA Button Label</label>
                  <input
                    type="text"
                    value={hpForm.ctaText}
                    onChange={(e) => setHpForm({ ...hpForm, ctaText: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff', fontSize: '0.9rem' }}
                  />
                </div>

                <button type="submit" className="btn btn-gold" style={{ padding: '0.9rem', fontSize: '1rem', fontWeight: 800 }}>
                  💾 Save Homepage Content Live
                </button>
              </form>
            )}

            {/* SUB-TAB 2: SERVICES MANAGER */}
            {cmsSubTab === 'services' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4 style={{ color: '#ffffff', fontSize: '1.1rem', margin: 0 }}>Active Fitness Services</h4>
                  <button
                    onClick={() => {
                      setEditingService({
                        id: '',
                        title: '',
                        badge: 'NEW OFFERING',
                        iconName: 'Sparkles',
                        color: '#0284C7',
                        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
                        description: '',
                        perksText: 'Custom programming\n24/7 Coaching support'
                      });
                      setServiceModalOpen(true);
                    }}
                    className="btn btn-gold"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    + Add New Service
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {cmsData?.services?.map((s) => (
                    <div key={s.id} className="glass-card" style={{ padding: '1rem', background: 'rgba(30,41,59,0.7)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column' }}>
                      <img src={s.image} alt={s.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: s.color || '#0284C7', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{s.badge}</div>
                      <h4 style={{ color: '#ffffff', fontSize: '1.05rem', margin: '0 0 0.4rem 0', fontWeight: 800 }}>{s.title}</h4>
                      <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.4', flex: 1, marginBottom: '0.85rem' }}>{s.description}</p>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setEditingService({
                              ...s,
                              perksText: Array.isArray(s.perks) ? s.perks.join('\n') : ''
                            });
                            setServiceModalOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteServiceCMS(s.id)}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.4)' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: MEMBERSHIPS MANAGER */}
            {cmsSubTab === 'memberships' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4 style={{ color: '#ffffff', fontSize: '1.1rem', margin: 0 }}>Membership Plans</h4>
                  <button
                    onClick={() => {
                      setEditingMembership({
                        id: '',
                        name: '',
                        tier: 'custom',
                        monthlyPrice: 49,
                        annualPrice: 39,
                        badge: 'SPECIAL',
                        popular: false,
                        description: '',
                        ctaText: 'Join Plan',
                        featuresText: '24/7 Access to Main Weight Floor\nLocker Room Access'
                      });
                      setMembershipModalOpen(true);
                    }}
                    className="btn btn-gold"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    + Add New Plan
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {cmsData?.memberships?.map((m) => (
                    <div key={m.id} className="glass-card" style={{ padding: '1.25rem', background: 'rgba(30,41,59,0.7)', borderRadius: 'var(--radius-md)', border: m.popular ? '2px solid #f59e0b' : '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>{m.badge}</span>
                        {m.popular && <span style={{ background: '#f59e0b', color: '#000000', fontSize: '0.65rem', fontWeight: 900, padding: '0.15rem 0.5rem', borderRadius: '10px' }}>POPULAR</span>}
                      </div>
                      <h4 style={{ color: '#ffffff', fontSize: '1.2rem', margin: '0 0 0.4rem 0', fontWeight: 900 }}>{m.name}</h4>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '0.65rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Monthly Rate</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8' }}>${m.monthlyPrice}</span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/mo</span>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1rem' }}>
                          <span style={{ fontSize: '0.68rem', color: '#6ee7b7', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Annual Rate</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399' }}>${m.annualPrice || Math.round(m.monthlyPrice * 0.8)}</span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/mo</span>
                        </div>
                      </div>
                      <p style={{ color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: '1.4' }}>{m.description}</p>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setEditingMembership({
                              ...m,
                              featuresText: Array.isArray(m.features) ? m.features.join('\n') : ''
                            });
                            setMembershipModalOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem' }}
                        >
                          ✏️ Edit Plan
                        </button>
                        <button
                          onClick={() => deleteMembershipCMS(m.id)}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.4)' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* SERVICE EDIT MODAL */}
      {serviceModalOpen && editingService && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '550px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: 'rgba(15, 23, 42, 0.98)', border: '1px solid #f59e0b', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
              {editingService.id ? 'Edit Service' : 'Add New Fitness Service'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const perks = editingService.perksText ? editingService.perksText.split('\n').filter(Boolean) : [];
              saveServiceCMS({ ...editingService, perks });
              setServiceModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Service Title</label>
                <input type="text" required value={editingService.title} onChange={(e) => setEditingService({ ...editingService, title: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Badge Text</label>
                  <input type="text" value={editingService.badge} onChange={(e) => setEditingService({ ...editingService, badge: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Theme Color (Hex)</label>
                  <input type="text" value={editingService.color} onChange={(e) => setEditingService({ ...editingService, color: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#38bdf8' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Image Source URL</label>
                <input type="text" value={editingService.image} onChange={(e) => setEditingService({ ...editingService, image: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Description</label>
                <textarea rows={3} value={editingService.description} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Key Perks / Highlights (1 per line)</label>
                <textarea rows={4} value={editingService.perksText} onChange={(e) => setEditingService({ ...editingService, perksText: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setServiceModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBERSHIP EDIT MODAL */}
      {membershipModalOpen && editingMembership && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '550px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: 'rgba(15, 23, 42, 0.98)', border: '1px solid #f59e0b', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
              {editingMembership.id ? 'Edit Membership Plan' : 'Add New Membership Plan'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const features = editingMembership.featuresText ? editingMembership.featuresText.split('\n').filter(Boolean) : [];
              saveMembershipCMS({ ...editingMembership, features });
              setMembershipModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Plan Name</label>
                <input type="text" required value={editingMembership.name} onChange={(e) => setEditingMembership({ ...editingMembership, name: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Monthly Price ($)</label>
                  <input type="number" required value={editingMembership.monthlyPrice} onChange={(e) => setEditingMembership({ ...editingMembership, monthlyPrice: Number(e.target.value) })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Annual Price ($/mo)</label>
                  <input type="number" required value={editingMembership.annualPrice} onChange={(e) => setEditingMembership({ ...editingMembership, annualPrice: Number(e.target.value) })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Badge Text</label>
                  <input type="text" value={editingMembership.badge} onChange={(e) => setEditingMembership({ ...editingMembership, badge: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                  <input type="checkbox" id="popCheck" checked={editingMembership.popular} onChange={(e) => setEditingMembership({ ...editingMembership, popular: e.target.checked })} />
                  <label htmlFor="popCheck" style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Mark as Popular</label>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Description</label>
                <textarea rows={2} value={editingMembership.description} onChange={(e) => setEditingMembership({ ...editingMembership, description: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', marginBottom: '0.3rem' }}>Features List (1 per line)</label>
                <textarea rows={4} value={editingMembership.featuresText} onChange={(e) => setEditingMembership({ ...editingMembership, featuresText: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30,41,59,0.8)', border: '1px solid var(--border-glass)', color: '#ffffff' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setMembershipModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Encrypted QR Code Modal */}
      {generatedQRModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>ENCRYPTED MEMBER QR</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1.25rem' }}>JWT Signed Encrypted Barcode for {generatedQRModal.membershipId}</p>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '1.25rem' }}>
              <QRCodeSVG value={generatedQRModal.token || generatedQRModal.membershipId} size={180} />
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.72rem', color: '#fbbf24', marginBottom: '1.25rem', wordBreak: 'break-all' }}>
              {generatedQRModal.token}
            </div>

            <button
              onClick={() => setGeneratedQRModal(null)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Notice Delivery Message Details Modal */}
      {noticeModalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid #bae6fd', color: '#0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCheck size={24} color="#16a34a" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 900, color: '#0f172a' }}>Expiry Message Delivery Log</h3>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>STATUS: DELIVERED TO USER ✅</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>RECIPIENT:</span>
                <strong style={{ color: '#0f172a' }}>{noticeModalData.memberName}</strong>
              </div>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>EMAIL ADDRESS:</span>
                <strong style={{ color: '#0284c7' }}>{noticeModalData.email}</strong>
              </div>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>PHONE NUMBER:</span>
                <strong style={{ color: '#0f172a' }}>{noticeModalData.phone || '(555) 888-9900'}</strong>
              </div>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>DELIVERY TIME:</span>
                <strong style={{ color: '#15803d' }}>{noticeModalData.sentAt}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>CHANNELS:</span>
                <strong style={{ color: '#2563eb' }}>SMS & Email (Multi-channel)</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Delivered Message Content</label>
              <div style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: 1.5 }}>
                {noticeModalData.message}
              </div>
            </div>

            <button
              onClick={() => setNoticeModalData(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Close Log Window
            </button>
          </div>
        </div>
      )}

      {/* Live User Dashboard Preview Modal */}
      {userDashboardPreviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '850px', width: '100%', padding: '2rem', borderRadius: 'var(--radius-lg)', background: '#0f172a', border: '2px solid #0284c7', maxHeight: '92vh', overflowY: 'auto' }}>
            {/* Modal Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.08em' }}>AUTOMATIC USER DASHBOARD PREVIEW</div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    LIVE USER DASHBOARD — {userDashboardPreviewModal.member?.fullName?.toUpperCase()}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setUserDashboardPreviewModal(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            {/* 1. Live Expiry Notice Banner (Rendered in User Dashboard) */}
            <div style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.3) 100%)',
              border: '2px solid #ef4444',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 8px 30px rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ef4444', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(239,68,68,0.5)' }}>
                  <AlertCircle size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fca5a5', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>⚠️ MEMBERSHIP EXPIRY NOTICE FROM ADMIN</span>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.68rem', color: '#ffffff' }}>{userDashboardPreviewModal.sentFormatted}</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {userDashboardPreviewModal.message}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.35rem' }}>
                    📩 Delivered via SMS & Email to <strong>{userDashboardPreviewModal.member?.email}</strong> • <strong>{userDashboardPreviewModal.member?.phone || '(555) 888-9900'}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  const res = await renewMemberSubscription(userDashboardPreviewModal.member?.id, userDashboardPreviewModal.member?.membershipPlan);
                  if (res.success) {
                    showToast(res.message, 'success');
                    setUserDashboardPreviewModal(null);
                    loadDashboardData();
                  }
                }}
                className="btn pulse-button"
                style={{
                  padding: '0.85rem 1.4rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.9rem',
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

            {/* 2. User Profile Card Simulation */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <img
                src={userDashboardPreviewModal.member?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt="Member Avatar"
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ef4444' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.3rem', margin: 0, color: '#ffffff', fontWeight: 900 }}>{userDashboardPreviewModal.member?.fullName}</h4>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(239,68,68,0.25)', color: '#fca5a5', fontWeight: 900, fontSize: '0.8rem' }}>
                    SUBSCRIPTION EXPIRED ❌
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#fbbf24', marginTop: '0.2rem' }}>Plan: {userDashboardPreviewModal.member?.membershipPlan}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.1rem', fontFamily: 'monospace' }}>
                  Member ID: {userDashboardPreviewModal.member?.membershipId} • Expiry: {userDashboardPreviewModal.member?.expiryDate}
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setUser(userDashboardPreviewModal.member);
                  localStorage.setItem('afg_user', JSON.stringify(userDashboardPreviewModal.member));
                  if (setActivePage) setActivePage('dashboard');
                }}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <User size={18} /> Switch & View Full Member Portal As {userDashboardPreviewModal.member?.fullName?.split(' ')[0]}
              </button>
              <button
                onClick={() => setUserDashboardPreviewModal(null)}
                style={{
                  padding: '0.85rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

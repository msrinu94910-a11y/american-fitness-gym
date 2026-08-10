import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, QrCode, ShieldCheck, XCircle, AlertTriangle, CheckCircle2, 
  Clock, User, Search, Sparkles, RefreshCw, Volume2, VolumeX, 
  History, Smartphone, Lock, ArrowRight, Zap, Check, Users, DollarSign,
  UserCheck, UserX, Calendar, Filter, Image as ImageIcon
} from 'lucide-react';
import { 
  verifyMemberQR, fetchAttendanceLogs, fetchAdminAnalytics, 
  fetchAdminMembers, renewMemberSubscription, generateMemberQRToken 
} from '../services/api';
import { useApp } from '../context/AppContext';
import QRCodeSVG from '../components/common/QRCodeSVG';

export default function MobileScannerPage({ setActivePage }) {
  const { user, showToast } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard'); // 'dashboard' | 'scanner' | 'members' | 'attendance'
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState([]);

  // Analytics & Admin Member Management State
  const [analytics, setAnalytics] = useState({
    totalMembers: 148,
    activeMembers: 132,
    expiredMembers: 16,
    todayAttendance: 42,
    monthlyRevenue: 14850
  });
  const [membersList, setMembersList] = useState([]);
  const [memberFilter, setMemberFilter] = useState('all'); // 'all' | 'active' | 'expired'
  const [memberSearch, setMemberSearch] = useState('');
  const [generatedQRModal, setGeneratedQRModal] = useState(null);

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

          // Pass 2A: Center 60% Crop Scan (Targeted for "ALIGN QR CODE HERE" yellow box)
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

          // Pass 2B: Full Frame Scan if center crop didn't find anything
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

          // Debounce same code for 3.5 seconds
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

  // Mobile Camera Launcher Handler - Directly starts live WebRTC video stream
  const handleTurnOnCamera = () => {
    setCameraError(null);
    setVerificationResult(null);

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isHttps && !isLocalhost) {
      showToast('🔄 Redirecting to secure connection (HTTPS) for live scanner...', 'info');
      setTimeout(() => {
        window.location.href = window.location.href.replace('http:', 'https:');
      }, 800);
      return;
    }

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

      // 4. Fallback: Legacy getUserMedia API
      if (!stream && getMedia) {
        try {
          stream = await new Promise((resolve, reject) => {
            getMedia.call(navigator, { video: true }, resolve, reject);
          });
        } catch (e4) {}
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
      console.warn('Live WebRTC stream initialization error, launching native camera:', err);
      setIsScanning(false);
      showToast('📷 Opening smartphone camera...', 'info');
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
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
      background: 'radial-gradient(circle at 50% 10%, #1e293b 0%, #090d16 80%)',
      color: '#f8fafc',
      paddingBottom: '5rem',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Mobile Scanner Sticky Top Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(9, 13, 22, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(217, 119, 6, 0.25)',
        padding: '0.9rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)'
          }}>
            <QrCode size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)', letterSpacing: '0.03em' }}>
              MOBILE QR SCANNER
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <ShieldCheck size={13} /> ADMIN VERIFICATION GATEWAY
            </div>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: soundEnabled ? '#fbbf24' : '#94a3b8',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer'
          }}
          title="Toggle Scan Sound Effects"
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{soundEnabled ? 'SOUND ON' : 'MUTED'}</span>
        </button>
      </div>

      <div className="container" style={{ maxWidth: '600px', padding: '1.25rem 1rem 0 1rem' }}>
        
        {/* KPI Analytics Metric Cards Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.65rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.75rem 0.6rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Members</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', marginTop: '0.1rem' }}>{analytics.totalMembers || 148}</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem 0.6rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>Active Members</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-heading)', marginTop: '0.1rem' }}>{analytics.activeMembers || 132}</div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 0.6rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>Expired</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-heading)', marginTop: '0.1rem' }}>{analytics.expiredMembers || 16}</div>
          </div>
        </div>

        {/* Secondary KPI Bar: Today Attendance & Monthly Revenue */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#7dd3fc', fontWeight: 700 }}>TODAY'S ATTENDANCE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>{analytics.todayAttendance || 42} Entries</div>
            </div>
            <Clock size={22} color="#38bdf8" />
          </div>
          <div style={{ background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#fde68a', fontWeight: 700 }}>MONTHLY REVENUE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fbbf24' }}>${(analytics.monthlyRevenue || 14850).toLocaleString()}</div>
            </div>
            <DollarSign size={22} color="#fbbf24" />
          </div>
        </div>

        {/* Admin Navigation Sub-Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.9)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          marginBottom: '1.5rem',
          gap: '0.25rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveAdminTab('dashboard')}
            style={{
              flex: 1,
              height: '38px',
              minWidth: '100px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeAdminTab === 'dashboard' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
              color: activeAdminTab === 'dashboard' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <ShieldCheck size={14} /> Overview
          </button>
          <button
            onClick={() => setActiveAdminTab('scanner')}
            style={{
              flex: 1,
              height: '38px',
              minWidth: '110px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeAdminTab === 'scanner' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
              color: activeAdminTab === 'scanner' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Camera size={14} /> QR Scanner
          </button>
          <button
            onClick={() => setActiveAdminTab('members')}
            style={{
              flex: 1,
              height: '38px',
              minWidth: '110px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeAdminTab === 'members' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
              color: activeAdminTab === 'members' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Users size={14} /> Members ({membersList.length || 148})
          </button>
          <button
            onClick={() => setActiveAdminTab('attendance')}
            style={{
              flex: 1,
              height: '38px',
              minWidth: '110px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeAdminTab === 'attendance' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
              color: activeAdminTab === 'attendance' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Clock size={14} /> Attendance
          </button>
        </div>

        {/* TAB 0: ADMIN OVERVIEW DASHBOARD */}
        {activeAdminTab === 'dashboard' && (
          <div>
            {/* Hero Launch Scanner Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '2px solid #f59e0b',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(245, 158, 11, 0.25)'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.25)', border: '2px solid #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <QrCode size={34} color="#fbbf24" />
              </div>
              <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.4rem 0', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                ADMIN CONTROL DASHBOARD
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
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
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  boxShadow: '0 6px 25px rgba(217, 119, 6, 0.45)',
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
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
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
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(245,158,11,0.5)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
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
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
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
            {/* Mobile Camera Instant Scanner Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '2px solid #10b981',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                📱 SMARTPHONE SCANNER MODE
              </div>
              <div style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.85rem' }}>
                Tap below to open your mobile camera & scan member QR code!
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn pulse-button"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem'
                }}
              >
                <Camera size={22} /> 📷 SNAP PHOTO OF MEMBER QR CODE
              </button>
            </div>

            {/* 1. Dedicated Manual Membership ID Subscription Checker */}
            <div className="glass-card" style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              border: '2px solid #f59e0b',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 12px 35px rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={20} color="#fbbf24" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    ENTER MEMBERSHIP ID TO CHECK SUBSCRIPTION
                  </h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
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
                      background: 'rgba(0, 0, 0, 0.55)',
                      border: '1.5px solid rgba(245, 158, 11, 0.6)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Search size={18} color="#fbbf24" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <button
                  onClick={() => handleVerify(manualCode)}
                  className="btn btn-primary pulse-button"
                  style={{
                    padding: '0.8rem 1.6rem',
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    boxShadow: '0 6px 20px rgba(217, 119, 6, 0.35)'
                  }}
                >
                  CHECK SUBSCRIPTION
                </button>
              </div>
            </div>

            {/* 2. Primary Camera Scan Action Section */}
            <div className="glass-card scanner-frame-gold" style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
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
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0) 70%)',
                    border: '2px solid rgba(245, 158, 11, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    boxShadow: '0 0 30px rgba(217, 119, 6, 0.3)'
                  }}>
                    <Camera size={42} color="#f59e0b" />
                  </div>

                  <h2 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
                    CAMERA QR SCANNER
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginBottom: '1.5rem' }}>
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
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 10px 30px rgba(217, 119, 6, 0.4)',
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

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.85rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: 'var(--radius-md)',
                      color: '#fbbf24',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
                    }}>
                      <ImageIcon size={18} color="#fbbf24" />
                      <span>UPLOAD / SNAP PHOTO OF QR CODE</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {cameraError && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '0.8rem' }}>
                      <AlertTriangle size={15} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} />
                      {cameraError}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000000', border: '2px solid rgba(245, 158, 11, 0.8)' }}>
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
                          <strong style={{ color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>ACTIVE HAS SUBSCRIPTION</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>SUBSCRIPTION PLAN</span>
                          <strong style={{ color: '#fbbf24' }}>{verificationResult.member?.membershipPlan}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>REMAINING DAYS</span>
                          <strong style={{ color: '#34d399', fontWeight: 800 }}>⚡ {verificationResult.member?.daysRemaining || 508} Days Remaining</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: 700 }}>EXPIRY DATE</span>
                          <strong style={{ color: '#cbd5e1' }}>{verificationResult.member?.expiryDate || '2027-12-31'}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#a7f3d0', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                      <Clock size={16} color="#10b981" />
                      <span>Attendance Checked In Automatically at {verificationResult.attendance?.time || 'Just Now'}</span>
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
                        <h3 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>NO ACTIVE MEMBERSHIP (EXPIRED) ❌</h3>
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
                          <strong style={{ color: '#ef4444', background: 'rgba(239,68,68,0.2)', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>NO MEMBERSHIP / EXPIRED</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: 700 }}>EXPIRY DATE</span>
                          <strong style={{ color: '#ef4444', fontWeight: 800 }}>{verificationResult.member?.expiryDate} (EXPIRED)</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const res = await renewMemberSubscription(verificationResult.member?.id || verificationResult.member?.membershipId, 'Pro Athlete VIP');
                        if (res.success) {
                          showToast(res.message, 'success');
                          handleVerify(verificationResult.member?.membershipId);
                        }
                      }}
                      className="btn btn-gold"
                      style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem', fontWeight: 800, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', boxShadow: '0 4px 15px rgba(217,119,6,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      Renew Subscription Now (+1 Year) <ArrowRight size={18} />
                    </button>
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

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.85rem' }}>
                    <span>Expiry: <strong style={{ color: '#ffffff' }}>{m.expiryDate}</strong></span>
                    <span>Remaining: <strong style={{ color: m.status === 'ACTIVE' ? '#34d399' : '#ef4444' }}>{m.remainingDays} Days</strong></span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={async () => {
                        const res = await generateMemberQRToken(m.membershipId);
                        if (res.success) {
                          setGeneratedQRModal(res);
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                    >
                      <QrCode size={14} /> Generate QR
                    </button>
                    {m.status === 'EXPIRED' && (
                      <button
                        onClick={async () => {
                          const res = await renewMemberSubscription(m.id, m.membershipPlan);
                          if (res.success) {
                            showToast(res.message, 'success');
                            loadDashboardData();
                          }
                        }}
                        className="btn btn-gold"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                      >
                        <RefreshCw size={14} /> Renew +1 Yr
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

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
    </div>
  );
}

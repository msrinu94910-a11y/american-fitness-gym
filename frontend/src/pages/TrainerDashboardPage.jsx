import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Dumbbell, Utensils, TrendingUp, Calendar, CheckCircle2, 
  Plus, Edit, Trash2, Award, Activity, LogOut, Search, UserCheck, ShieldCheck, Clock
} from 'lucide-react';
import { 
  fetchTrainerAssignedMembers, saveWorkoutPlan, fetchMemberWorkoutPlan,
  saveDietPlan, fetchMemberDietPlan, logMemberProgress, fetchMemberProgress 
} from '../services/api';

export default function TrainerDashboardPage({ setActivePage }) {
  const { user, setUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview'); // overview, members, workout, diet, progress, profile
  const [members, setMembers] = useState([]);
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected member for plan building / progress tracking
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Workout Builder State
  const [workoutTitle, setWorkoutTitle] = useState('Custom Athletic Strength Blueprint');
  const [workoutGoal, setWorkoutGoal] = useState('Hypertrophy & Mobility');
  const [exercises, setExercises] = useState([
    { day: 'Monday', name: 'Barbell Back Squats', sets: 4, reps: '8-10', restSeconds: 90, targetMuscle: 'Quads & Glutes', notes: 'Maintain parallel depth.' },
    { day: 'Wednesday', name: 'Incline Dumbbell Bench Press', sets: 4, reps: '10-12', restSeconds: 75, targetMuscle: 'Upper Chest', notes: 'Squeeze at top.' }
  ]);

  // Diet Builder State
  const [dietTitle, setDietTitle] = useState('Lean Muscle & High Energy Macro Plan');
  const [calories, setCalories] = useState(2400);
  const [protein, setProtein] = useState(180);
  const [carbs, setCarbs] = useState(220);
  const [fats, setFats] = useState(65);
  const [water, setWater] = useState(3.5);
  const [meals, setMeals] = useState([
    { mealType: 'Breakfast', time: '07:30 AM', foodItems: '4 Whole Eggs, 1 Cup Oatmeal, Blueberries', calories: 600, proteinGrams: 40, carbsGrams: 55, fatsGrams: 20, instructions: 'Hydrate first thing.' },
    { mealType: 'Lunch', time: '01:00 PM', foodItems: '200g Grilled Chicken Breast, Brown Rice, Broccoli', calories: 650, proteinGrams: 55, carbsGrams: 65, fatsGrams: 12, instructions: 'Season with olive oil.' }
  ]);

  // Progress Entry State
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [muscleMassKg, setMuscleMassKg] = useState('');
  const [progressNotes, setProgressNotes] = useState('');
  const [progressHistory, setProgressHistory] = useState([]);

  useEffect(() => {
    loadTrainerData();
  }, []);

  const loadTrainerData = async () => {
    setLoading(true);
    try {
      const res = await fetchTrainerAssignedMembers();
      if (res.success) {
        setMembers(res.members || []);
        setTrainerInfo(res.trainer || null);
        if (res.members && res.members.length > 0) {
          setSelectedMemberId(res.members[0].id);
        }
      }
    } catch (err) {
      showToast('Failed to load trainer data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMemberForPlans = async (memberId) => {
    setSelectedMemberId(memberId);
    try {
      const [wpRes, dpRes, prgRes] = await Promise.all([
        fetchMemberWorkoutPlan(memberId),
        fetchMemberDietPlan(memberId),
        fetchMemberProgress(memberId)
      ]);

      if (wpRes.success && wpRes.plan) {
        setWorkoutTitle(wpRes.plan.title || 'Personalized Workout Routine');
        setWorkoutGoal(wpRes.plan.goal || 'General Fitness');
        if (wpRes.plan.exercises && wpRes.plan.exercises.length > 0) {
          setExercises(wpRes.plan.exercises);
        }
      }

      if (dpRes.success && dpRes.plan) {
        setDietTitle(dpRes.plan.title || 'Nutrition Blueprint');
        setCalories(dpRes.plan.dailyCalories || 2400);
        setProtein(dpRes.plan.proteinGrams || 180);
        setCarbs(dpRes.plan.carbsGrams || 220);
        setFats(dpRes.plan.fatsGrams || 65);
        if (dpRes.plan.meals && dpRes.plan.meals.length > 0) {
          setMeals(dpRes.plan.meals);
        }
      }

      if (prgRes.success && prgRes.history) {
        setProgressHistory(prgRes.history);
      }
    } catch (err) {}
  };

  const handleSaveWorkout = async () => {
    if (!selectedMemberId) {
      showToast('Please select a member first', 'warning');
      return;
    }
    try {
      const res = await saveWorkoutPlan({
        userId: selectedMemberId,
        title: workoutTitle,
        goal: workoutGoal,
        exercises
      });
      if (res.success) {
        showToast('Workout Plan updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to save workout plan', 'error');
      }
    } catch (err) {
      showToast('Error saving workout plan', 'error');
    }
  };

  const handleSaveDiet = async () => {
    if (!selectedMemberId) {
      showToast('Please select a member first', 'warning');
      return;
    }
    try {
      const res = await saveDietPlan({
        userId: selectedMemberId,
        title: dietTitle,
        dailyCalories: calories,
        proteinGrams: protein,
        carbsGrams: carbs,
        fatsGrams: fats,
        waterLiters: water,
        meals
      });
      if (res.success) {
        showToast('Diet Plan updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to save diet plan', 'error');
      }
    } catch (err) {
      showToast('Error saving diet plan', 'error');
    }
  };

  const handleLogProgress = async () => {
    if (!selectedMemberId || !weightKg) {
      showToast('Please enter member weight (kg)', 'warning');
      return;
    }
    try {
      const res = await logMemberProgress({
        userId: selectedMemberId,
        weightKg,
        bodyFatPercent,
        muscleMassKg,
        notes: progressNotes
      });
      if (res.success) {
        showToast('Progress record added successfully!', 'success');
        setWeightKg('');
        setBodyFatPercent('');
        setMuscleMassKg('');
        setProgressNotes('');
        handleSelectMemberForPlans(selectedMemberId);
      } else {
        showToast(res.message || 'Failed to log progress', 'error');
      }
    } catch (err) {
      showToast('Error logging progress', 'error');
    }
  };

  const addExerciseRow = () => {
    setExercises([
      ...exercises,
      { day: 'Friday', name: 'New Exercise', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Full Body', notes: '' }
    ]);
  };

  const removeExerciseRow = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const addMealRow = () => {
    setMeals([
      ...meals,
      { mealType: 'Snack', time: '04:00 PM', foodItems: 'Protein Shake & Almonds', calories: 250, proteinGrams: 25, carbsGrams: 15, fatsGrams: 8, instructions: '' }
    ]);
  };

  const removeMealRow = (idx) => {
    setMeals(meals.filter((_, i) => i !== idx));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('AFG_AUTH_USER');
    localStorage.removeItem('AFG_AUTH_TOKEN');
    showToast('Logged out of Trainer Portal', 'info');
    setActivePage('login');
  };

  const activeMembersCount = members.filter(m => m.status === 'ACTIVE_MEMBER' || !m.status).length;
  const currentSelectedMember = members.find(m => m.id === selectedMemberId) || members[0];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navigation */}
      <header style={{ background: '#0f172a', color: '#ffffff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0284c7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>AMERICAN FITNESS GYM</h1>
              <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.68rem', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '8px', textTransform: 'uppercase' }}>
                TRAINER PORTAL
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Coach: {trainerInfo?.fullName || user?.fullName || 'Master Trainer'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setActivePage('home')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
            🌐 Main Website
          </button>
          <button onClick={handleLogout} style={{ background: '#dc2626', border: 'none', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{ width: '260px', background: '#0f172a', borderRight: '1px solid #1e293b', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.75rem 0.5rem 0.75rem' }}>
            TRAINER NAVIGATION
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '12px', border: 'none',
              background: activeTab === 'overview' ? 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : '#94a3b8', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Activity size={18} /> Overview Dashboard
          </button>

          <button
            onClick={() => setActiveTab('members')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '12px', border: 'none',
              background: activeTab === 'members' ? 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)' : 'transparent',
              color: activeTab === 'members' ? '#ffffff' : '#94a3b8', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Users size={18} /> Assigned Members ({members.length})
          </button>

          <button
            onClick={() => setActiveTab('workout')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '12px', border: 'none',
              background: activeTab === 'workout' ? 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)' : 'transparent',
              color: activeTab === 'workout' ? '#ffffff' : '#94a3b8', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Dumbbell size={18} /> Workout Plan Builder
          </button>

          <button
            onClick={() => setActiveTab('diet')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '12px', border: 'none',
              background: activeTab === 'diet' ? 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)' : 'transparent',
              color: activeTab === 'diet' ? '#ffffff' : '#94a3b8', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Utensils size={18} /> Diet Plan Builder
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '12px', border: 'none',
              background: activeTab === 'progress' ? 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)' : 'transparent',
              color: activeTab === 'progress' ? '#ffffff' : '#94a3b8', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <TrendingUp size={18} /> Client Progress Logger
          </button>
        </aside>

        {/* Dynamic View Area */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '1.5rem' }}>
                COACH DASHBOARD OVERVIEW
              </h2>

              {/* Stats Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Assigned Clients</span>
                    <Users size={22} color="#0284c7" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{members.length}</div>
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>Active Training Clients</span>
                </div>

                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Active Memberships</span>
                    <UserCheck size={22} color="#059669" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{activeMembersCount}</div>
                  <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>Valid Gym Subscriptions</span>
                </div>

                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Assigned Workouts</span>
                    <Dumbbell size={22} color="#2563eb" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{members.length} Plans</div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Custom Routines Active</span>
                </div>

                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Diet Plans</span>
                    <Utensils size={22} color="#d97706" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{members.length} Diets</div>
                  <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>Macro Target Specs</span>
                </div>
              </div>

              {/* Client Quick Roster Table */}
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Assigned Members Roster</h3>
                  <button onClick={() => setActiveTab('members')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}>
                    View Full Roster →
                  </button>
                </div>

                {members.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No members currently assigned by Admin.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                          <th style={{ padding: '0.75rem' }}>Member Name</th>
                          <th style={{ padding: '0.75rem' }}>Email / Contact</th>
                          <th style={{ padding: '0.75rem' }}>Membership Plan</th>
                          <th style={{ padding: '0.75rem' }}>Status</th>
                          <th style={{ padding: '0.75rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{m.fullName}</td>
                            <td style={{ padding: '0.75rem', color: '#64748b' }}>{m.email}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0284c7' }}>{m.membershipPlan || 'Pro Athlete VIP'}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900 }}>
                                ACTIVE
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <button
                                onClick={() => {
                                  handleSelectMemberForPlans(m.id);
                                  setActiveTab('workout');
                                }}
                                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                              >
                                Edit Plans
                              </button>
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

          {/* TAB 2: ASSIGNED MEMBERS */}
          {activeTab === 'members' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '1.5rem' }}>
                MY ASSIGNED CLIENTS ({members.length})
              </h2>

              {members.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '2px dashed #cbd5e1', padding: '3rem 1.5rem', textAlign: 'center' }}>
                  <Users size={40} color="#0284c7" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>No Assigned Clients Yet</h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.4rem', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
                    When Gym Admin assigns members to you or members choose you as their personal coach from their dashboard, they will appear here automatically.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {members.map(m => (
                  <div key={m.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{m.fullName}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>{m.membershipPlan}</span>
                      </div>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900 }}>
                        ACTIVE
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      <div>✉️ {m.email}</div>
                      <div>📞 {m.phone || '(555) 000-0000'}</div>
                      <div>🎯 Goal: {m.fitnessGoal || 'Hypertrophy & Performance'}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          handleSelectMemberForPlans(m.id);
                          setActiveTab('workout');
                        }}
                        style={{ flex: 1, background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.55rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        🏋️ Workout
                      </button>
                      <button
                        onClick={() => {
                          handleSelectMemberForPlans(m.id);
                          setActiveTab('diet');
                        }}
                        style={{ flex: 1, background: '#0d9488', color: '#ffffff', border: 'none', padding: '0.55rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        🥗 Diet Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* TAB 3: WORKOUT PLAN BUILDER */}
          {activeTab === 'workout' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    WORKOUT ROUTINE BUILDER
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Create & assign custom workout programs for clients</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>Select Client:</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMemberForPlans(e.target.value)}
                    style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 800, background: '#ffffff', color: '#0f172a' }}
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>Routine Title</label>
                    <input
                      type="text"
                      value={workoutTitle}
                      onChange={(e) => setWorkoutTitle(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>Training Goal</label>
                    <input
                      type="text"
                      value={workoutGoal}
                      onChange={(e) => setWorkoutGoal(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Exercise Movements</h3>
                  <button onClick={addExerciseRow} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0284c7', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Plus size={16} /> Add Exercise
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {exercises.map((ex, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1.5fr 80px 100px 1.2fr 40px', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <input
                        type="text"
                        value={ex.day}
                        onChange={(e) => {
                          const updated = [...exercises];
                          updated[idx].day = e.target.value;
                          setExercises(updated);
                        }}
                        placeholder="Day"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...exercises];
                          updated[idx].name = e.target.value;
                          setExercises(updated);
                        }}
                        placeholder="Exercise Name"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                      />
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => {
                          const updated = [...exercises];
                          updated[idx].sets = Number(e.target.value);
                          setExercises(updated);
                        }}
                        placeholder="Sets"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) => {
                          const updated = [...exercises];
                          updated[idx].reps = e.target.value;
                          setExercises(updated);
                        }}
                        placeholder="Reps (e.g. 10-12)"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        value={ex.notes}
                        onChange={(e) => {
                          const updated = [...exercises];
                          updated[idx].notes = e.target.value;
                          setExercises(updated);
                        }}
                        placeholder="Coaching notes / form guidance"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <button onClick={() => removeExerciseRow(idx)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveWorkout} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)' }}>
                  💾 Save Workout Plan for {currentSelectedMember?.fullName}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DIET PLAN BUILDER */}
          {activeTab === 'diet' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    NUTRITION & MACRO BUILDER
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Prescribe daily caloric and macronutrient targets for client goals</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>Select Client:</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMemberForPlans(e.target.value)}
                    style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 800, background: '#ffffff', color: '#0f172a' }}
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Calories (kcal)</label>
                    <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Protein (g)</label>
                    <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Carbs (g)</label>
                    <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Fats (g)</label>
                    <input type="number" value={fats} onChange={(e) => setFats(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Meal Breakdown Schedule</h3>
                  <button onClick={addMealRow} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0d9488', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Plus size={16} /> Add Meal
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {meals.map((ml, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 100px 1.8fr 80px 40px', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <input
                        type="text"
                        value={ml.mealType}
                        onChange={(e) => {
                          const updated = [...meals];
                          updated[idx].mealType = e.target.value;
                          setMeals(updated);
                        }}
                        placeholder="Meal Type"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                      />
                      <input
                        type="text"
                        value={ml.time}
                        onChange={(e) => {
                          const updated = [...meals];
                          updated[idx].time = e.target.value;
                          setMeals(updated);
                        }}
                        placeholder="Time"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        value={ml.foodItems}
                        onChange={(e) => {
                          const updated = [...meals];
                          updated[idx].foodItems = e.target.value;
                          setMeals(updated);
                        }}
                        placeholder="Food items & quantities"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <input
                        type="number"
                        value={ml.calories}
                        onChange={(e) => {
                          const updated = [...meals];
                          updated[idx].calories = Number(e.target.value);
                          setMeals(updated);
                        }}
                        placeholder="kcal"
                        style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                      <button onClick={() => removeMealRow(idx)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveDiet} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', color: '#ffffff', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(13, 148, 136, 0.3)' }}>
                  🥗 Save Diet Plan for {currentSelectedMember?.fullName}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: CLIENT PROGRESS LOGGER */}
          {activeTab === 'progress' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    CLIENT PROGRESS LOGGER
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Record weight, body fat %, and muscle mass check-ins</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>Select Client:</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMemberForPlans(e.target.value)}
                    style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 800, background: '#ffffff', color: '#0f172a' }}
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  Log New Assessment Scan for {currentSelectedMember?.fullName}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Body Weight (kg) *</label>
                    <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g. 76.5" style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Body Fat %</label>
                    <input type="number" step="0.1" value={bodyFatPercent} onChange={(e) => setBodyFatPercent(e.target.value)} placeholder="e.g. 18.5" style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Muscle Mass (kg)</label>
                    <input type="number" step="0.1" value={muscleMassKg} onChange={(e) => setMuscleMassKg(e.target.value)} placeholder="e.g. 34.5" style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Assessment & Progress Notes</label>
                  <input type="text" value={progressNotes} onChange={(e) => setProgressNotes(e.target.value)} placeholder="e.g. Strength increased by 5%, visible waist reduction." style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>

                <button onClick={handleLogProgress} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                  📈 Record Progress Entry
                </button>
              </div>

              {/* Progress History Table */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  Progress History Records
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '0.65rem' }}>Scan Date</th>
                        <th style={{ padding: '0.65rem' }}>Weight</th>
                        <th style={{ padding: '0.65rem' }}>Body Fat %</th>
                        <th style={{ padding: '0.65rem' }}>Muscle Mass</th>
                        <th style={{ padding: '0.65rem' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressHistory.map((prg, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.65rem', fontWeight: 700 }}>{prg.date}</td>
                          <td style={{ padding: '0.65rem', fontWeight: 800, color: '#0284c7' }}>{prg.weightKg} kg</td>
                          <td style={{ padding: '0.65rem' }}>{prg.bodyFatPercent}%</td>
                          <td style={{ padding: '0.65rem' }}>{prg.muscleMassKg} kg</td>
                          <td style={{ padding: '0.65rem', color: '#64748b' }}>{prg.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

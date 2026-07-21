import React, { useState } from 'react';
import { Calculator, Flame, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { calculateBmi } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function BmiCalculator() {
  const [formData, setFormData] = useState({ heightCm: '178', weightKg: '76', age: '26', gender: 'male', activityLevel: 'moderate' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useApp();

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await calculateBmi(formData);
      if (res.success) {
        setResult(res);
        showToast('BMI & Calorie Target computed successfully!', 'success');
      }
    } catch (err) {
      showToast('Error calculating BMI', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '5rem 0', background: 'var(--bg-card)', position: 'relative', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          
          {/* Form Column */}
          <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(255,56,56,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calculator size={22} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>Fitness & Calorie Calculator</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Calculate your Body Mass Index (BMI) and daily total energy expenditure (TDEE) to get a custom training recommendation.
            </p>

            <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Height (cm)</label>
                  <input
                    type="number"
                    required
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Age (years)</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Weekly Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  style={inputStyle}
                >
                  <option value="sedentary">Sedentary (Office / Little exercise)</option>
                  <option value="moderate">Moderate (Workout 3-4 days/week)</option>
                  <option value="active">High Active (Workout 5-6 days/week)</option>
                  <option value="athlete">Elite Athlete (Heavy daily training)</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Computing Metric Analysis...' : 'Calculate My Metrics'}
              </button>
            </form>
          </div>

          {/* Result Column */}
          <div>
            {!result ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(15,23,42,0.02)', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                <Activity size={48} color="var(--accent-red)" style={{ opacity: 0.6, marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Enter Your Stats</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Fill in your measurements to get your personalized athletic breakdown and recommended gym program.
                </p>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '2.5rem', border: `1px solid ${result.color}` }}>
                <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>Calculated Results</span>
                <h3 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                  Your BMI: <span style={{ color: result.color }}>{result.bmi}</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Health Status</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: result.color }}>{result.category}</div>
                  </div>
                  <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Maintenance (TDEE)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{result.tdee} kcal</div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Recommended Training Plan:</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{result.recommendation}</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: '8px', background: '#3B82F6', borderRadius: '4px' }} title="Underweight" />
                  <div style={{ flex: 1, height: '8px', background: '#10B981', borderRadius: '4px' }} title="Normal" />
                  <div style={{ flex: 1, height: '8px', background: '#F59E0B', borderRadius: '4px' }} title="Overweight" />
                  <div style={{ flex: 1, height: '8px', background: '#EF4444', borderRadius: '4px' }} title="Obese" />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' };
const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-dark)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '0.95rem'
};

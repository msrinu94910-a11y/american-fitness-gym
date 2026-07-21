import React, { useState, useEffect } from 'react';
import { Search, Clock, User, ArrowRight, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchBlogPosts } from '../services/api';

const DEFAULT_BLOG_POSTS = [
  {
    id: 'hypertrophy-guide-2026',
    title: 'The Ultimate Guide to Hypertrophy: Building Lean Muscle Mass',
    category: 'Workouts',
    author: 'Marcus Vance',
    date: 'July 15, 2026',
    readTime: '6 min read',
    summary: 'Discover the science of mechanical tension, metabolic stress, and progressive overload to maximize muscle growth efficiency.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    content: `
      Building muscular hypertrophy requires more than just lifting heavy weights. It requires a strategic balance of mechanical tension, muscle damage, and metabolic stress.

      ### 1. Progressive Overload
      The fundamental driver of muscle growth is progressive overload. Increase the weight, reps, or control tempo over time to continuously force adaptation.

      ### 2. Optimal Volume & Frequency
      Research shows that 10 to 20 working sets per muscle group per week yields optimal hypertrophy for most lifters.

      ### 3. Nutrition & Sleep
      Muscle is built outside the gym. Consume 1.6 - 2.2g of protein per kg of bodyweight daily and prioritize 7 to 9 hours of deep sleep.
    `
  },
  {
    id: 'post-workout-recovery-hacks',
    title: '5 Post-Workout Recovery Strategies backed by Sports Science',
    category: 'Recovery',
    author: 'Chloe Bennett',
    date: 'July 10, 2026',
    readTime: '4 min read',
    summary: 'Learn why cold plunges, sauna thermal therapy, and active mobility routines accelerate muscular repair and reduce soreness.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    content: `
      Optimizing recovery allows you to train with higher intensity and frequency while preventing burnout.

      ### Key Recovery Pillar: Contrast Water Therapy
      Alternating between the Finnish sauna and cold plunge tub stimulates vasodilation and vasoconstriction, flushing out metabolic waste and reducing inflammation.
    `
  },
  {
    id: 'protein-timing-nutrition',
    title: 'Nutrition Myth-Busting: Does the Anabolic Window Really Exist?',
    category: 'Nutrition',
    author: 'Elena Rostova',
    date: 'July 02, 2026',
    readTime: '5 min read',
    summary: 'We dive deep into scientific studies regarding post-workout nutrient timing, daily protein totals, and meal distribution.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    content: `
      The infamous "30-minute anabolic window" has been widely misunderstood. While consuming protein post-workout is beneficial, total daily protein intake is far more critical for muscle synthesis than hyper-precise timing.
    `
  }
];

export default function BlogPage() {
  const [posts, setPosts] = useState(DEFAULT_BLOG_POSTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { openArticleModal } = useApp();

  useEffect(() => {
    fetchBlogPosts(activeCategory, searchQuery)
      .then((res) => {
        if (res && res.success && res.data && res.data.length > 0) {
          setPosts(res.data);
        }
      })
      .catch(() => {
        // Fallback seamlessly
      });
  }, [activeCategory, searchQuery]);

  const filteredPosts = posts.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Workouts', 'Recovery', 'Nutrition'];

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem', background: '#ffffff' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Fitness Knowledge Hub</span>
          <h2 className="section-title">INSIGHTS & <span className="gradient-text">TRAINING GUIDES</span></h2>
          <p className="section-subtitle">
            Scientific workout routines, nutrition blueprints, and recovery protocols curated by certified sports specialists.
          </p>

          {/* Search Bar & Category Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', marginTop: '2rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f1f5f9',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: activeCategory === cat ? '#0284C7' : '#f1f5f9',
                    border: '1px solid var(--border-glass)',
                    color: activeCategory === cat ? '#ffffff' : 'var(--text-main)',
                    padding: '0.45rem 1.1rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredPosts.map((post) => (
            <div key={post.id} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className="badge badge-gold" style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ffffff' }}>
                  {post.category}
                </span>
              </div>

              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> {post.author}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {post.readTime}</span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: '1.3' }}>
                  {post.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                  {post.summary}
                </p>

                <button
                  onClick={() => openArticleModal(post)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '0 1.25rem' }}
                >
                  Read Full Article <ArrowRight size={16} color="#0284C7" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

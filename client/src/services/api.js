// API Service Wrapper for American Fitness Gym Frontend

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json();
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
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

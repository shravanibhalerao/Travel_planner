const API = 'http://localhost:8082';

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error('Login failed');

  const data = await res.json();

  // ── DEBUG: see exactly what backend returns ───────────────────────────────
  console.log('Login response:', data);

  // ── Store ONLY the raw token string (no "Bearer " prefix) ─────────────────
  // Check your AuthController to see the exact field name:
  // common names: token, accessToken, jwt, jwtToken
  const token = data.token        // ← most common
             || data.accessToken
             || data.jwt
             || data.jwtToken;

  if (!token) {
    console.error('❌ No token found in response:', data);
    throw new Error('No token in response');
  }

  // ── Validate before storing ───────────────────────────────────────────────
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('❌ Token is malformed:', token, '| Parts:', parts.length);
    throw new Error('Malformed token received from server');
  }

  console.log('✅ Valid token received, parts:', parts.length);

  // ── Store clean token (no Bearer prefix) ──────────────────────────────────
  localStorage.setItem('token', token);

  return data;
}

// ── GET TOKEN ─────────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem('token');
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.location.href = '/login';
}

// ── AUTHENTICATED FETCH (use this for all protected API calls) ────────────────
export async function authFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    console.warn('⚠️ No token found — redirecting to login');
    window.location.href = '/login';
    return;
  }

  // Send token as "Bearer <token>" — never store "Bearer" in localStorage
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,   // ← always add "Bearer " here, never in storage
  };

  const res = await fetch(`${API}${url}`, { ...options, headers });

  if (res.status === 401) {
    console.warn('⚠️ 401 Unauthorized — token may be expired');
    logout();
    return;
  }

  return res;
}
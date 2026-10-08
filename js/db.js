// Supabase connection. The publishable key is designed to be public; Row Level Security
// (supabase/schema.sql) is what protects the data.
const SB_URL = 'https://cewxfmputkmrkymfvfsq.supabase.co';
const SB_KEY = 'sb_publishable__piZTnhB-t8-yKL-ymKdRA_kyHL241l';
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY, { auth: { storageKey: 'fh.auth', persistSession: true, autoRefreshToken: true } }) : null;

// Current signed-in user + their profile row (null if signed out). Redirects are the caller's job.
async function currentUser() {
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  return session ? session.user : null;
}
async function myProfile() {
  const u = await currentUser();
  if (!u) return null;
  const { data } = await sb.from('profiles').select('*').eq('user_id', u.id).maybeSingle();
  return data;
}
const isApproved = p => !!p && p.status === 'approved';
const isAdmin = p => isApproved(p) && p.role === 'admin';
const isStaff = p => isApproved(p) && (p.role === 'admin' || p.role === 'super');

// Page guard: sends signed-out people to the login page, shows the "waiting" screen to unapproved people.
async function guard(opts) {
  opts = opts || {};
  const u = await currentUser();
  if (!u) { location.replace('login.html'); return null; }
  const p = await myProfile();
  if (!p || p.status !== 'approved') { location.replace('login.html?wait=' + (p && p.status === 'blocked' ? 'blocked' : '1')); return null; }
  if (opts.admin && !isAdmin(p)) { location.replace('./'); return null; }
  if (opts.staff && !isStaff(p)) { location.replace('./'); return null; }
  afterGuard();
  return p;
}

// ---- Notifications: unread count, phone icon badge, and "opening a page clears its dot" ----
const PAGE_TILE = { 'profile.html': 'profile', 'cabinet.html': 'cabinet', 'mycharities.html': 'charities', 'network.html': 'network',
  'board.html': 'board', 'diary.html': 'diary', 'queue.html': 'queue', 'movement.html': 'movement', 'shop.html': 'mech', 'sponsors.html': 'sponsors', 'contacts.html': 'contacts' };
async function unreadCount() {
  const { count } = await sb.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
  return count || 0;
}
function setAppBadge(n) {
  try { if (navigator.setAppBadge) { if (n > 0) navigator.setAppBadge(n); else navigator.clearAppBadge(); } } catch (e) {}
}
async function refreshBadge() { const n = await unreadCount(); setAppBadge(n); return n; }
async function afterGuard() {
  try {
    const tile = PAGE_TILE[location.pathname.split('/').pop()];
    if (tile) await sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('tile', tile).is('read_at', null);
    refreshBadge();
  } catch (e) {}
}

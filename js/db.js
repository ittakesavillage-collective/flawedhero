// Supabase connection. The publishable key is designed to be public; Row Level Security
// (supabase/schema.sql) is what protects the data.
const SB_URL = '__SB_URL__';
const SB_KEY = '__SB_KEY__';
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
  return p;
}

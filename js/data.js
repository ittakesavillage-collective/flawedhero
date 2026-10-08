// Flawed Hero content. Bump VERSION here AND the CACHE name in sw.js together.
const VERSION = '0.1.9';

// 24px line icons, drawn with currentColor
const ICONS = {
  profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  board:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  cabinet:'<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 20h8"/>',
  diary:'<path d="M6 3h12v18H6zM6 7H4M6 12H4M6 17H4M10 8h5M10 12h5"/>',
  charities:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  network:'<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M11 7l-5 9M13 7l5 9M7.2 18h9.6"/>',
  movement:'<circle cx="15" cy="4.5" r="2"/><path d="M9 21l2.5-6-3-2.5 2-4.5 3.5 2 2.5 3M13 14l2 4.5 3 .5M8 8.5l-3 2"/>',
  sponsors:'<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.5 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z"/>',
  contacts:'<path d="M5 4h12a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2zM19 8h2M19 12h2M19 16h2M12 11.5a2 2 0 1 0 .01 0M8.5 16c.6-1.6 1.9-2.3 3.5-2.3s2.9.7 3.5 2.3"/>',
  mech:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.6 17.2a1.9 1.9 0 0 0 2.7 2.7l5.7-5.7a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.3-.5-.5-2.3z"/>'
};
const svg = (k, cls) => '<svg viewBox="0 0 24 24" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') +
  ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[k] + '</svg>';

// Home grid: 2 columns x 5 rows, in this order. My Profile is the only live page for now.
const TILES = [
  {id:'profile', name:'My Profile', href:'profile.html'},
  {id:'board', name:'Message Board'},
  {id:'cabinet', name:'Hero’s Cabinet', href:'cabinet.html'},
  {id:'diary', name:'Diary'},
  {id:'charities', name:'My Charities'},
  {id:'network', name:'Charity Network'},
  {id:'movement', name:'My Movement'},
  {id:'sponsors', name:'Flawed Hero Sponsors'},
  {id:'contacts', name:'Useful Contacts', href:'contacts.html'},
  {id:'mech', name:'Merch & Shop'}
];

const STATUS = { suggested:'Suggested', accepted:'Accepted', planned:'Planned', building:'Being built', done:'Done', denied:'Denied', later:'Much later' };
const ago = t => {
  const s = (Date.now() - new Date(t)) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

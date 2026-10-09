// Medal tiers and drawing. The colour of a medal depends on how many times that event has been completed.
// Ladder (Michael, 2026-10-08): 1 = silver, 3 = gold, 5 = platinum, 10 = diamond (names/steps can change here only).
const TIERS = [
  { name: 'Silver',   min: 1,  hi: '#F4F7FA', lo: '#8E99A6', ring: '#C9D1DA' },
  { name: 'Gold',     min: 3,  hi: '#FFE08A', lo: '#C28A12', ring: '#F0B93A' },
  { name: 'Platinum', min: 5,  hi: '#EAF6FB', lo: '#6F9FBA', ring: '#B7D7E8' },
  { name: 'Diamond',  min: 10, hi: '#C8F6FF', lo: '#2F9FE0', ring: '#7FD9FF' }
];
const tierFor = n => { let t = null; TIERS.forEach(x => { if (n >= x.min) t = x; }); return t; };

// Phil's own medal designs go here, one image per event+year (put the file in assets/medals/ and add a line):
//   'fh-marathon:2025': 'assets/medals/fh-marathon-2025.png'
// A design replaces the drawn medal. Years not yet completed show the design as a dark shadow.
// Give BOTH sides to get the slowly turning, glinting medal:
//   'fh-marathon:2025': { front: 'assets/medals/fh-2025-front.png', back: 'assets/medals/fh-2025-back.png' }
// (a plain string still works and shows a still picture)
const MEDAL_ART = {
  'fh-marathon:2024': { front: 'assets/medals/fh-2024-front.png', back: 'assets/medals/fh-2024-back.png' },
  'fh-marathon:2025': { front: 'assets/medals/fh-2025-front.png', back: 'assets/medals/fh-2025-back.png' },
  'fh-marathon:2026': { front: 'assets/medals/fh-2026-front.png', back: 'assets/medals/fh-2026-back.png' }
};

let _mid = 0;
// A medal on a ribbon. tier = null draws the empty, shadowy placeholder.
function medalSvg(tier) {
  const id = 'm' + (++_mid);
  const ribbon = tier ? '#E53E2F' : '#2A2230', ribbon2 = tier ? '#B52A1E' : '#221B29';
  const fill = tier ? 'url(#g' + id + ')' : '#16121C';
  const stroke = tier ? tier.ring : '#4A3F52';
  return '<svg viewBox="0 0 100 130" aria-hidden="true">' +
    (tier ? '<defs><linearGradient id="g' + id + '" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="' + tier.hi + '"/><stop offset=".55" stop-color="' + tier.lo + '"/><stop offset="1" stop-color="' + tier.hi + '"/></linearGradient>' +
      '<radialGradient id="s' + id + '" cx=".35" cy=".3" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' : '') +
    '<path d="M28 4h18l14 44H40z" fill="' + ribbon + '"/><path d="M72 4H54L40 48h20z" fill="' + ribbon2 + '"/>' +
    '<circle cx="50" cy="84" r="38" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (tier ? 4 : 2.5) + '"' + (tier ? '' : ' stroke-dasharray="5 5"') + '/>' +
    (tier ? '<circle cx="50" cy="84" r="29" fill="none" stroke="' + tier.ring + '" stroke-width="1.5" opacity=".7"/><circle cx="50" cy="84" r="38" fill="url(#s' + id + ')"/>' +
      '<path d="M43 98V71h16M43 83h12" fill="none" stroke="#7A5A10" stroke-opacity=".55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' : '') +
    '</svg>';
}
// A real medal design that has both sides, turning slowly with a glint across it
function coin(art) {
  const f = esc(art.front), b = esc(art.back || art.front);
  return '<div class="stage"><div class="coin">' +
    '<div class="face front" style="--img:url(\'' + f + '\')"><img src="' + f + '" alt=""></div>' +
    '<div class="face back" style="--img:url(\'' + b + '\')"><img src="' + b + '" alt=""></div></div></div>';
}
function slot(tier, label, sub, art) {
  const still = art && (typeof art === 'string' ? art : art.front);
  // won + both sides = the turning medal; not won yet = a dark still shadow of the design
  const pic = art && tier && typeof art === 'object' ? coin(art) : still ? '<img class="art" src="' + esc(still) + '" alt="">' : medalSvg(tier);
  return '<div class="slot' + (tier ? '' : ' empty') + '"><div' + (tier ? ' class="shine"' : '') + '>' + pic + '</div><b>' + esc(label) + '</b>' +
    (sub || tier ? '<small>' + esc(sub || '') + (sub && tier ? ' &middot; ' : '') + (tier ? tier.name : '') + '</small>' : '') + '</div>';
}
function progress(n) {
  const next = TIERS.find(t => n < t.min);
  if (!next) return '<p class="note">Top tier reached. Legend.</p>';
  const prev = [...TIERS].reverse().find(t => n >= t.min);
  const from = prev ? prev.min : 0, pct = Math.round(((n - from) / (next.min - from)) * 100);
  const need = next.min - n;
  return '<div class="prog" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div style="width:' + pct + '%"></div></div>' +
    '<p class="note">' + need + ' more finish' + (need === 1 ? '' : 'es') + ' to ' + next.name + '.</p>';
}

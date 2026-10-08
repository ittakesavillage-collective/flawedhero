// Shared bits for My Charities / Charity Network / the approvals tab.
const logoUrl = path => path ? SB_URL + '/storage/v1/object/public/charity-logos/' + path : '';
const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

// Logos sit on a white tile so any official logo reads, whatever its colours
function logoTile(c, big) {
  const size = big ? 72 : 56;
  return '<div class="logo" style="width:' + size + 'px;height:' + size + 'px">' +
    (c.logo_path ? '<img src="' + esc(logoUrl(c.logo_path)) + '" alt="" loading="lazy">' : '<span>' + esc(initials(c.name)) + '</span>') + '</div>';
}
const safeUrl = u => { u = String(u || '').trim(); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { return new URL(u).href; } catch (e) { return ''; } };

// Shrink a chosen logo on the phone (max 400px, PNG so transparency survives) before upload
function shrinkLogo(file) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, 400 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); c.toBlob(b => b ? res(b) : rej(new Error('no blob')), 'image/png');
    };
    img.onerror = () => rej(new Error('That file isn’t a picture we can read.'));
    img.src = url;
  });
}
async function uploadLogo(file, uid) {
  const blob = await shrinkLogo(file), path = uid + '/' + Date.now() + '.png';
  const { error } = await sb.storage.from('charity-logos').upload(path, blob, { contentType: 'image/png' });
  if (error) throw error;
  return path;
}

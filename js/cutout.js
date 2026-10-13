// Cut a medal out of a photo, in the browser (nothing is sent anywhere until you save).
// Works best on a plain surface that contrasts with the medal. 'tol' = how different from the background a pixel must be (default 45).
// Handles a hanging ribbon: the medal body sets the size, the ribbon is kept as a short stub above it.

const CUT_WORK = 1000;   // the photo is shrunk to this width to work on

function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read that picture.')); i.src = src; });
}

// separable box max (grow) / min (shrink) with radius r on a 0/1 mask; outside the picture counts as 0
function morph(m, w, h, r, grow) {
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let acc = grow ? 0 : 1;
    for (let k = -r; k <= r; k++) { const xx = x + k, v = xx >= 0 && xx < w ? m[y * w + xx] : 0; acc = grow ? (acc | v) : (acc & v); }
    tmp[y * w + x] = acc;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let acc = grow ? 0 : 1;
    for (let k = -r; k <= r; k++) { const yy = y + k, v = yy >= 0 && yy < h ? tmp[yy * w + x] : 0; acc = grow ? (acc | v) : (acc & v); }
    out[y * w + x] = acc;
  }
  return out;
}
function labelComponents(m, w, h) {
  const lab = new Int32Array(w * h), q = new Int32Array(w * h), info = [null];
  let n = 0;
  for (let s = 0; s < w * h; s++) {
    if (!m[s] || lab[s]) continue;
    n++; let head = 0, tail = 0; q[tail++] = s; lab[s] = n;
    const inf = { size: 0, y0: h, y1: 0, x0: w, x1: 0 };
    while (head < tail) {
      const p = q[head++], y = (p / w) | 0, x = p - y * w; inf.size++;
      if (y < inf.y0) inf.y0 = y; if (y > inf.y1) inf.y1 = y; if (x < inf.x0) inf.x0 = x; if (x > inf.x1) inf.x1 = x;
      if (x > 0 && m[p - 1] && !lab[p - 1]) { lab[p - 1] = n; q[tail++] = p - 1; }
      if (x < w - 1 && m[p + 1] && !lab[p + 1]) { lab[p + 1] = n; q[tail++] = p + 1; }
      if (y > 0 && m[p - w] && !lab[p - w]) { lab[p - w] = n; q[tail++] = p - w; }
      if (y < h - 1 && m[p + w] && !lab[p + w]) { lab[p + w] = n; q[tail++] = p + w; }
    }
    info.push(inf);
  }
  return { lab, info };
}

function fillHoles(m, w, h) {
  const outside = new Uint8Array(w * h), q = new Int32Array(w * h); let head = 0, tail = 0;
  const seed = p => { if (!m[p] && !outside[p]) { outside[p] = 1; q[tail++] = p; } };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (head < tail) {
    const p = q[head++], y = (p / w) | 0, x = p - y * w;
    if (x > 0) seed(p - 1); if (x < w - 1) seed(p + 1); if (y > 0) seed(p - w); if (y < h - 1) seed(p + w);
  }
  const out = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) out[i] = outside[i] ? 0 : 1; return out;
}

const medianOf = a => { a.sort((x, y) => x - y); return a[a.length >> 1]; };

// -> { rgba: ImageData-sized canvas of the whole photo with the cut-out alpha, body: {t,b,x0,x1} in that canvas }
function cutoutPhoto(img, tol) {
  const s = Math.min(1, CUT_WORK / img.naturalWidth), w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h), px = data.data;
  // background colour = the middle colour of a ring around the edge of the photo
  const rs = [], gs = [], bs = [], ring = Math.max(6, Math.round(w * 0.025));
  for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
    if (x < ring || y < ring || x >= w - ring || y >= h - ring) { const i = (y * w + x) * 4; rs.push(px[i]); gs.push(px[i + 1]); bs.push(px[i + 2]); }
  }
  // "different from the background" counts colour much more than brightness, so shadows (same colour, just darker) don't count as medal
  const br = medianOf(rs), bg = medianOf(gs), bb = medianOf(bs), t2 = tol * tol;
  const bY = 0.299 * br + 0.587 * bg + 0.114 * bb, bcr = br - bY, bcb = bb - bY;
  let m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2], Y = 0.299 * r + 0.587 * g + 0.114 * b;
    const dcr = (r - Y) - bcr, dcb = (b - Y) - bcb, dY = 0.45 * (Y - bY);
    m[i] = dcr * dcr + dcb * dcb + dY * dY > t2 ? 1 : 0;
  }
  m = morph(morph(m, w, h, 2, true), w, h, 2, false);    // close small gaps
  m = morph(morph(m, w, h, 2, false), w, h, 2, true);    // drop specks
  const { lab, info } = labelComponents(m, w, h);
  let big = 1; for (let k = 1; k < info.length; k++) if (info[k].size > info[big].size) big = k;
  const L = info[big]; if (!L) throw new Error('Could not find the medal. Try a plainer background.');
  const body = new Uint8Array(w * h), keep = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) { if (lab[i] === big) { body[i] = 1; keep[i] = 1; } }
  const Lh = L.y1 - L.y0;
  for (let k = 1; k < info.length; k++) {
    const c = info[k];
    // the ribbon: a piece above the medal, inside its width (not the table or mat edges)
    if (k !== big && c.size >= 0.01 * L.size && c.x0 >= L.x0 && c.x1 <= L.x1 && c.y1 <= L.y0 + 0.2 * Lh) {
      for (let i = 0; i < w * h; i++) if (lab[i] === k) keep[i] = 1;
      if (L.y0 - c.y1 < 0.15 * Lh) {                       // bridge the shadow where the ribbon passes through the tab
        const src = Math.max(0, c.y1 - 4);
        for (let y = c.y1 + 1; y < L.y0 + 6; y++) for (let x = c.x0; x <= c.x1; x++) {
          keep[y * w + x] = 1; const d = (y * w + x) * 4, sIdx = (src * w + x) * 4; px[d] = px[sIdx]; px[d + 1] = px[sIdx + 1]; px[d + 2] = px[sIdx + 2];
        }
      }
    }
  }
  const mask = fillHoles(keep, w, h), bodyFilled = fillHoles(body, w, h);
  const edge = morph(mask, w, h, 1, false);                // pull the edge in a touch, then soften it
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x; let sum = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += edge[i + dy * w + dx];
    px[i * 4 + 3] = Math.round(255 * sum / 9);
  }
  for (let x = 0; x < w; x++) { px[x * 4 + 3] = 0; px[((h - 1) * w + x) * 4 + 3] = 0; }
  for (let y = 0; y < h; y++) { px[y * w * 4 + 3] = 0; px[(y * w + w - 1) * 4 + 3] = 0; }
  ctx.putImageData(data, 0, 0);
  // body box = the widest part (so ribbon length never changes the size)
  const widths = new Int32Array(h); let wmax = 0;
  for (let y = 0; y < h; y++) { let c = 0; for (let x = 0; x < w; x++) c += bodyFilled[y * w + x]; widths[y] = c; if (c > wmax) wmax = c; }
  let t = 0, b = h - 1; while (widths[t] <= wmax / 2) t++; while (widths[b] <= wmax / 2) b--;
  let x0 = w, x1 = 0; for (let y = t; y <= b; y++) for (let x = 0; x < w; x++) if (bodyFilled[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
  return { canvas: cv, body: { t, b, x0, x1 } };
}

// Turn front + back photos into two matching transparent canvases, lined up on the medal body
function buildMedalPair(imgFront, imgBack, tol) {
  const TARGET_W = 560, STUB = 0.32, parts = {};
  for (const [side, img] of [['front', imgFront], ['back', imgBack]]) {
    const { canvas, body } = cutoutPhoto(img, tol);
    const bw = body.x1 - body.x0, bh = body.b - body.t, sc = TARGET_W / bw;
    const top = Math.max(0, body.t - STUB * bh), left = Math.max(0, body.x0 - 0.04 * bw), right = Math.min(canvas.width, body.x1 + 0.04 * bw), bottom = Math.min(canvas.height, body.b + 0.04 * bh);
    const out = document.createElement('canvas'); out.width = Math.round((right - left) * sc); out.height = Math.round((bottom - top) * sc);
    const o = out.getContext('2d'); o.imageSmoothingQuality = 'high'; o.drawImage(canvas, left, top, right - left, bottom - top, 0, 0, out.width, out.height);
    parts[side] = { out, bodyTop: (body.t - top) * sc };
  }
  const above = Math.max(parts.front.bodyTop, parts.back.bodyTop);
  const below = Math.max(parts.front.out.height - parts.front.bodyTop, parts.back.out.height - parts.back.bodyTop);
  const W = Math.max(parts.front.out.width, parts.back.out.width), H = Math.round(above + below), res = {};
  for (const side of ['front', 'back']) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    c.getContext('2d').drawImage(parts[side].out, Math.round((W - parts[side].out.width) / 2), Math.round(above - parts[side].bodyTop));
    res[side] = c;
  }
  return res;
}
const canvasToPng = c => new Promise(r => c.toBlob(r, 'image/png'));

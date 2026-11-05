// Install splash: people using Flawed Hero in a normal browser tab (not from the home screen) get a 4-second "get the full app"
// screen with what they would miss. Skipped for installed phones, once per visit, and after 5 showings. ?splash=1 previews it.
// Waits for the poster splash (index.html) to finish first. Shared by index.html and login.html.
(function () {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const force = new URLSearchParams(location.search).has('splash');
  if (standalone && !force) return;
  // Eligibility is checked again at the moment it would show, and only THEN counted, so a quick redirect to the sign-in page
  // (which loads this file too) doesn't use up the showing.
  const eligible = () => {
    if (force) return true;
    try { return sessionStorage.getItem('fh.installSplash') !== '1' && (+localStorage.getItem('fh.splashCount') || 0) < 5; } catch (e) { return true; }
  };
  if (!eligible()) return;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const how = ios ? 'On iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>.' : 'On Android: tap the <b>&#8942;</b> menu, then <b>Install app</b>.';
  const show = () => {
    if (!eligible()) return;
    try { sessionStorage.setItem('fh.installSplash', '1'); localStorage.setItem('fh.splashCount', String((+localStorage.getItem('fh.splashCount') || 0) + 1)); } catch (e) {}
    const el = document.createElement('div');
    el.id = 'isplash'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Get the full Flawed Hero app');
    el.innerHTML = '<img src="icons/icon-192.png" alt="" width="84" height="84">'
      + '<h2>Get the full Flawed Hero app</h2>'
      + '<ul><li>Alerts when something happens, even when the app is closed</li><li>Your medals, news and events in one place</li><li>Opens full screen, like any other app</li></ul>'
      + '<p class="how">' + how + '</p>'
      + '<div class="btns"><a class="btn" href="install.html" id="isplashgo">Show me how</a><button class="btn ghost" id="isplashx">Not now</button></div>'
      + '<div class="timer"><i></i></div>';
    document.body.appendChild(el);
    const t = setTimeout(close, 4000);
    function close() { clearTimeout(t); el.classList.add('out'); setTimeout(() => el.remove(), 350); }
    document.getElementById('isplashx').onclick = close;
    document.getElementById('isplashgo').onclick = () => clearTimeout(t);
  };
  // On the home page the poster holds for 3 seconds first; show ours straight after it
  const poster = document.getElementById('splash');
  setTimeout(show, poster ? 3500 : 0);
})();

# Flawed Hero

The app for **The Flawed Hero Marathon 2027** (Broadway, 25 April 2027), part of the It Takes a Village collective.
Live at https://ittakesavillagecollective.co.uk/flawedhero/ (GitHub Pages). Owned by Michael; a gift to Phil Roberton.

Public repo: no secrets in here. The Supabase publishable key is designed to be public; Row Level Security
(`supabase/schema.sql`) protects the data.

- `index.html` splash (poster, 3s) + 10-button home. `!` = admin only, everyone else gets `+` (development queue)
- `login.html` register / sign in / waiting-for-approval. `profile.html` My Profile. `queue.html` development queue
- `admin.html` members approval (admin + super user) and queue management (admin only)
- `soon.html?p=` Coming Soon placeholder for the 9 unbuilt buttons
- `js/data.js` VERSION + tiles; `js/db.js` Supabase + guard; `sw.js` network-first (bump CACHE with VERSION)
- Palette/tokens: top of `css/app.css` (from the 2027 event poster; keep for the event season)

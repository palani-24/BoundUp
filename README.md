# BoundUp Instagram-Style Frontend + Backend Starter

This version redesigns BoundUp into a polished Instagram-inspired social app while keeping the original BoundUp identity. It does not copy Instagram assets, logos, proprietary code, or branding.

## Open the app

Start from:

```
frontend/index.html
```

Or run locally:

```bash
cd frontend
python -m http.server 8000
```

Then open:

```
http://localhost:8000/index.html
```

## Main pages

- Splash / Welcome
- Login / Sign Up
- Home feed with stories, create post, likes, comments, saves, suggestions
- Explore grid
- Reels page
- Chat page
- Profile page
- Settings page with theme + language
- Download page
- Favorites / History / About

## Working demo functions

- Like/unlike posts
- Save/remove posts in favorites
- Add comments
- Create demo post
- Search explore posts
- Follow/unfollow suggestions
- Chat send + AI typing reply
- Theme toggle
- Language dropdown
- Download progress animation
- Local cache clear / logout

## Backend

The existing Node.js + Express + MongoDB starter backend is kept in `/backend` for future real API integration.

## v7 Logo Update
The website now uses the custom BoundUp logo image provided by the user. The splash screen uses the full uploaded logo, while navigation, favicon, and PWA icons use a cropped BoundUp B icon generated from the same logo.

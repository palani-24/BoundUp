# BoundUp Mobile App Blueprint

This document converts the BoundUp web concept into a cross-platform Android and iOS social media mobile application roadmap.

## Stack

- React Native / Expo or React Native CLI
- React Navigation
- Zustand or Redux Toolkit
- React Native Reanimated + Gesture Handler
- Axios + Socket.IO Client
- Firebase Cloud Messaging
- React Native Vision Camera, Video and Image Picker
- Node.js + Express + Socket.IO backend
- MongoDB Atlas + Mongoose
- Cloudinary for media storage
- Redis for caching and queues

## Core modules

1. Authentication: signup, login, guest mode, Google, Apple, OTP, email verification, forgot password, logout.
2. Home Feed: image, video and text posts, infinite scroll, recommendations, likes, comments, saves, shares, reports, follows, hashtags and mentions.
3. Stories: upload, highlights, archive, reactions, replies, viewers and 24-hour expiry.
4. Reels: vertical videos, auto-play, remix, music, downloads if allowed, AI recommendations and creator analytics.
5. Chat: direct and group chat, voice messages, media sharing, typing, online status, read receipts, reactions, editing, deletion, pinned messages and archives.
6. Calls: WebRTC voice/video calls, group calls, screen sharing, mute, camera switch, speaker mode and call history.
7. Notifications: FCM push notifications for likes, comments, follows, messages, mentions, story views, live alerts, calls and system announcements.
8. Profile: profile picture, cover, bio, username, display name, website, location, profession, education, skills, social links, stats, posts, reels, saved, tagged, highlights and verification.
9. Privacy & Security: JWT, refresh tokens, 2FA, encrypted chats, device management, login history, block/mute/restrict, private account, reporting, rate limiting and RBAC.
10. Search & Explore: people, posts, reels, stories, hashtags, locations, AI suggestions, trending, categories and creators.
11. Media: images, videos, audio, documents, multiple uploads, compression and Cloudinary storage.
12. Admin Dashboard: users, moderation, reports, analytics, notifications, ads, verification, bans and platform monitoring.
13. AI: recommendations, spam detection, fake account detection, image and comment moderation, smart search, personalized feed and trending prediction.

## Backend endpoints to build

- `/api/auth`
- `/api/users`
- `/api/profiles`
- `/api/posts`
- `/api/stories`
- `/api/reels`
- `/api/chat`
- `/api/calls`
- `/api/notifications`
- `/api/search`
- `/api/media`
- `/api/admin`
- `/api/ai`
- `/api/mobile/blueprint`
- `/api/mobile/interest`

## Deployment

- Android build: Expo EAS or native Gradle build
- iOS build: Expo EAS or Xcode build
- Backend: Render / AWS / Google Cloud
- Database: MongoDB Atlas
- Storage: Cloudinary
- Push notifications: Firebase Cloud Messaging

## Note

The current ZIP contains the web implementation and backend starter. The new `frontend/mobile-app.html` page adds the complete mobile product blueprint inside the BoundUp website, and the backend includes a mobile blueprint API endpoint.


## V5 Practical Screen Build
The mobile plan has been converted into actual separated HTML prototype pages. Use these screens as the UI reference before building the React Native Android/iOS app.

Recommended React Native mapping:
- mobile-auth.html -> AuthNavigator
- mobile-feed.html -> HomeStack
- mobile-stories.html -> StoriesViewer
- mobile-reels.html -> ReelsTab
- mobile-chat-screen.html -> ChatStack
- mobile-calls.html -> CallStack
- mobile-profile-screen.html -> ProfileStack
- mobile-privacy.html -> SecuritySettings
- mobile-admin.html -> AdminApp

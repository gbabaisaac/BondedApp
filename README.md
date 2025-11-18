# Bonded - College Social Network

A modern, Gen-Z focused social platform for college students built with Next.js 14, React, TypeScript, and Supabase.

## 🚀 Features

### Core Modules
- **Yearbook** - Browse and connect with students (3-column grid, filters by year/major)
- **Forum** - Anonymous and public posts with reactions, comments, media support
- **Messaging** - Real-time conversations and group chats
- **Profiles** - Rich user profiles with photos, interests, Bond Print personality
- **Connections** - Friend system with mutual connections and suggestions
- **Scrapbook** (Love Mode) - Dating/matching feature with blind chats
- **Bond Print** - Personality quiz for compatibility matching
- **Search** - Find students, posts, tags
- **Notifications** - Real-time updates for all activities

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # Main app pages
│   │   ├── yearbook/
│   │   ├── forum/
│   │   ├── messages/
│   │   ├── profile/
│   │   ├── friends/
│   │   ├── scrapbook/
│   │   ├── search/
│   │   ├── notifications/
│   │   ├── settings/
│   │   └── bond-print/
│   └── layout.tsx
├── components/
│   ├── navigation/         # TopBar, BottomNav
│   └── shared/            # Button, Card, Input, Chip
├── hooks/                 # Custom React hooks
├── services/              # API service layer
├── stores/                # Zustand state stores
├── styles/                # Global CSS and design tokens
├── types/                 # TypeScript types
└── utils/                 # Helper functions
```

## 🎨 Design System

All design tokens are centralized in `src/styles/design-system.css`:
- **Colors**: Primary, secondary, accent, gradients
- **Typography**: Font families, sizes, weights
- **Spacing**: 4px base unit (xs to 4xl)
- **Shadows**: sm to xl
- **Borders**: Radius tokens

## 🗄 Database Schema

Complete schema defined in `src/types/database.ts`:
- Users & Profiles
- Photos & Interests
- Connections & Suggestions
- Posts, Comments, Reactions
- Messages & Conversations
- Notifications
- Bond Print data
- Scrapbook/Love Mode

## 🚦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Optimization

- Fully responsive design
- Safe area insets for iOS
- Touch-optimized interactions
- PWA-ready
- Bottom navigation for mobile

## 🔄 Current Status

✅ **Complete File Structure Created**  
✅ Core UI components  
✅ Navigation (Top + Bottom)  
✅ Main screens (Yearbook, Forum, Messages, Profile, etc.)  
✅ Bond Print quiz flow  
✅ Design system & tokens  
✅ Database types  
✅ API service layer  
✅ State management (Zustand)  

🚧 **Next Steps**:
- Connect to real Supabase backend
- Implement real-time features
- Add image upload
- Complete all API integrations
- Testing & bug fixes

## 📄 License

Private - All rights reserved

---

Built with ❤️ for college communities

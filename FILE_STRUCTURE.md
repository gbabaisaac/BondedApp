# Bonded - Complete File Structure

## 📁 Project Overview

This is the complete file structure for the Bonded social network application. All files have been created with basic implementations that can be enhanced with real backend integration.

---

## 🗂 Directory Structure

```
bonded/
├── public/
│   └── manifest.json                    # PWA manifest
│
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── (main)/                      # Main authenticated app
│   │   │   ├── layout.tsx               # Main layout with BottomNav
│   │   │   ├── yearbook/
│   │   │   │   └── page.tsx             # Yearbook grid (3-column, filters)
│   │   │   ├── forum/
│   │   │   │   └── page.tsx             # Forum feed (posts, reactions)
│   │   │   ├── messages/
│   │   │   │   └── page.tsx             # Conversations list
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx             # Own profile
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Other user profiles (photo gallery)
│   │   │   ├── friends/
│   │   │   │   ├── page.tsx             # Friends hub (tabs)
│   │   │   │   ├── connections/
│   │   │   │   │   └── page.tsx         # All connections list
│   │   │   │   └── requests/
│   │   │   │       └── page.tsx         # Connection requests
│   │   │   ├── scrapbook/
│   │   │   │   ├── page.tsx             # Scrapbook landing
│   │   │   │   └── matching/
│   │   │   │       └── page.tsx         # Swipe interface (Love Mode)
│   │   │   ├── search/
│   │   │   │   └── page.tsx             # Search (trending, recent)
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx             # Notifications (all/unread)
│   │   │   ├── settings/
│   │   │   │   └── page.tsx             # Settings hub
│   │   │   └── bond-print/
│   │   │       └── page.tsx             # Personality quiz
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css                  # Global CSS imports
│   │
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── BottomNav.tsx            # Bottom navigation (5 tabs)
│   │   │   └── TopBar.tsx               # Top bar (dynamic, with actions)
│   │   └── shared/
│   │       ├── Button.tsx               # Button (primary, secondary, ghost, danger)
│   │       ├── Card.tsx                 # Card & CardContent
│   │       ├── Input.tsx                # Input with error states
│   │       └── Chip.tsx                 # Chip (multiple variants)
│   │
│   ├── hooks/
│   │   ├── useUser.ts                   # Get current user from store
│   │   └── useDebounce.ts               # Debounce hook for search
│   │
│   ├── services/
│   │   └── api.ts                       # API service layer (all endpoints)
│   │
│   ├── stores/
│   │   ├── useAuthStore.ts              # Auth state (Zustand + persist)
│   │   └── useUIStore.ts                # UI state (modals, sidebar)
│   │
│   ├── styles/
│   │   ├── design-system.css            # CSS variables (colors, spacing, etc)
│   │   └── globals.css                  # Global styles & animations
│   │
│   ├── types/
│   │   └── database.ts                  # TypeScript types for full schema
│   │
│   ├── lib/
│   │   └── utils.ts                     # Utility functions (cn, formatDate)
│   │
│   └── middleware.ts                    # Route protection middleware
│
├── .env.example                         # Environment variables template
├── .gitignore                           # Git ignore rules
├── package.json                         # Dependencies & scripts
├── tailwind.config.ts                   # Tailwind configuration
├── tsconfig.json                        # TypeScript configuration
├── README.md                            # Project documentation
├── IMPLEMENTATION_CHECKLIST.md          # Implementation checklist
└── FILE_STRUCTURE.md                    # This file

```

---

## 📄 File Descriptions

### Core Pages (16 pages total)

1. **Yearbook Home** (`/yearbook`) - Browse students in 3-column grid with filters
2. **Forum Feed** (`/forum`) - Posts with reactions, comments, anonymous mode
3. **Messages** (`/messages`) - Conversation list with unread counts
4. **Own Profile** (`/profile`) - User's own profile with stats
5. **User Profile** (`/profile/[id]`) - Other users' profiles with photo gallery
6. **Friends Hub** (`/friends`) - Tabs for connections/requests/suggestions
7. **Connections** (`/friends/connections`) - All friends with search
8. **Requests** (`/friends/requests`) - Accept/decline connection requests
9. **Scrapbook Landing** (`/scrapbook`) - Love Mode introduction
10. **Matching** (`/scrapbook/matching`) - Swipe interface with blurred photos
11. **Search** (`/search`) - Search students/posts with trending tags
12. **Notifications** (`/notifications`) - All/unread notifications
13. **Settings** (`/settings`) - Settings hub with all options
14. **Bond Print** (`/bond-print`) - Personality quiz with 5 questions

### Shared Components (4 components)

1. **Button** - 4 variants (primary, secondary, ghost, danger), 4 sizes
2. **Card** - Card container with CardContent
3. **Input** - Text input with error states & labels
4. **Chip** - Pills for tags/interests (4 variants)

### Navigation (2 components)

1. **TopBar** - Dynamic top bar with back/search/filters/notifications
2. **BottomNav** - Fixed bottom navigation (5 tabs)

### State Management (2 stores)

1. **useAuthStore** - User auth state (persisted)
2. **useUIStore** - UI state (modals, sidebar)

### Services (1 service)

1. **API Service** - Centralized API calls to Supabase

### Hooks (2 hooks)

1. **useUser** - Get current user from auth store
2. **useDebounce** - Debounce values (for search)

---

## 🎨 Design System

All design tokens are centralized in `src/styles/design-system.css`:

- **Colors**: Primary (#FF6B6B), Secondary, Accent, Gradients
- **Typography**: Font families, sizes (sm to 4xl), weights
- **Spacing**: 4px base unit (xs to 4xl)
- **Borders**: Radius (sm to 2xl), colors
- **Shadows**: sm to xl elevations
- **Z-index**: Layering system (0-1700)

---

## 🗄 Database Schema (28 tables)

Complete TypeScript types in `src/types/database.ts`:

1. schools
2. users
3. user_photos
4. user_interests
5. user_looking_for
6. connections
7. connection_suggestions
8. posts
9. post_tags
10. post_reactions
11. comments
12. comment_reactions
13. trending_tags
14. conversations
15. conversation_participants
16. messages
17. message_read_receipts
18. bond_print_questions
19. bond_print_responses
20. bond_prints
21. daily_bond_questions
22. daily_question_responses
23. compatibility_scores
24. scrapbook_profiles
25. attraction_ratings
26. scrapbook_matches
27. scrapbook_conversations
28. notifications
29. push_tokens
30. reports
31. blocked_users
32. activity_logs
33. search_queries

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📱 Mobile Features

- ✅ Fully responsive (320px to desktop)
- ✅ Touch-optimized interactions
- ✅ Safe area insets for iOS notch
- ✅ PWA-ready (manifest.json)
- ✅ Bottom navigation for mobile
- ✅ Swipe gestures (Scrapbook)

---

## 🎯 Current Status

**✅ COMPLETE FILE STRUCTURE**

All files created with:
- Working navigation
- Mock data for testing
- Full TypeScript types
- Design system applied
- Mobile-responsive layouts

**🚧 NEEDS BACKEND INTEGRATION**

Connect to Supabase for:
- Real user authentication
- Database queries
- Real-time features
- Image uploads
- Push notifications

---

## 📊 File Count

- **Total Pages**: 14 routes
- **Components**: 6 components
- **Stores**: 2 stores
- **Services**: 1 API service
- **Hooks**: 2 hooks
- **Config Files**: 5 files
- **Documentation**: 3 files

**Total: ~40 files created**

---

## 🔗 Key Routes

| Route | Description |
|-------|-------------|
| `/yearbook` | Browse students |
| `/forum` | Community posts |
| `/messages` | Chat & DMs |
| `/profile` | Your profile |
| `/profile/[id]` | User profiles |
| `/friends` | Connections |
| `/scrapbook` | Love Mode |
| `/bond-print` | Personality quiz |
| `/search` | Search everything |
| `/notifications` | Activity feed |
| `/settings` | App settings |

---

Built with ❤️ for Bonded


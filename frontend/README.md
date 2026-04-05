# BuddyScript — Social Feed Application

A full-stack social media feed application built with Next.js 16, TypeScript, PostgreSQL, and Prisma. Users can register, log in, create posts with images, like and comment on posts, and control post visibility.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Demo Accounts](#demo-accounts)
- [Architecture](#architecture)
  - [Authentication](#authentication)
  - [Route Protection](#route-protection)
  - [Data Layer](#data-layer)
  - [API Routes](#api-routes)
  - [Component Architecture](#component-architecture)
- [Features](#features)
- [Design System](#design-system)
- [Key Implementation Notes](#key-implementation-notes)
- [Scripts Reference](#scripts-reference)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.2 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma 7.6.0 |
| DB Driver | `@prisma/adapter-pg` + `pg` |
| Auth | Custom JWT via `jose` (HTTP-only cookies) |
| Styling | Tailwind CSS v4 + original `_`-prefixed CSS classes |
| Validation | Zod 4 |
| Data Fetching | SWR (`useSWRInfinite` for feed pagination) |
| Image Upload | Cloudinary (with local fallback to `public/uploads/`) |
| Date Formatting | date-fns |
| Password Hashing | bcryptjs (12 rounds) |
| Toast Notifications | react-hot-toast |

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page (Server + Client hybrid)
│   │   └── register/page.tsx       # Registration page
│   ├── actions/
│   │   └── auth.ts                 # Server Actions: register, login, logout
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts            # GET paginated posts / POST create post
│   │   │   └── [postId]/
│   │   │       ├── route.ts        # DELETE post
│   │   │       ├── like/route.ts   # POST toggle like
│   │   │       ├── likes/route.ts  # GET users who liked
│   │   │       └── comments/route.ts # GET comments / POST create comment
│   │   ├── comments/
│   │   │   └── [commentId]/
│   │   │       └── like/route.ts   # POST toggle comment like
│   │   └── upload/route.ts         # POST image upload
│   ├── feed/page.tsx               # Feed page (SSR initial data)
│   ├── globals.css                 # CSS custom properties + utility classes
│   ├── layout.tsx                  # Root layout (links CSS, dark mode init)
│   └── page.tsx                    # Root redirect (→ /feed or /login)
├── components/
│   ├── CommentItem.tsx             # Single comment with replies + like
│   ├── CommentSection.tsx          # Lazy-loaded comment list + new comment form
│   ├── CreatePost.tsx              # Post composer with image upload + visibility
│   ├── DarkModeToggle.tsx          # Dark/light mode toggle (persisted to localStorage)
│   ├── FeedClient.tsx              # Infinite scroll feed (useSWRInfinite)
│   ├── LeftSidebar.tsx             # Profile card + navigation + suggestions
│   ├── LikesModal.tsx              # Modal listing users who liked a post
│   ├── Navbar.tsx                  # Top navigation bar with profile dropdown
│   ├── PostCard.tsx                # Post card with like/comment/delete actions
│   └── RightSidebar.tsx            # Friends/contacts list
├── lib/
│   ├── prisma.ts                   # Singleton Prisma client with PrismaPg adapter
│   ├── session.ts                  # JWT session: encrypt/decrypt/create/get/delete
│   └── validations.ts              # Zod schemas for all form inputs
├── prisma/
│   ├── schema.prisma               # Database schema (User, Post, Comment, Like)
│   └── seed.ts                     # Demo data seeder
├── public/
│   ├── css/                        # Original HTML template CSS (Bootstrap + custom)
│   ├── images/                     # Static image assets
│   └── js/                         # Original template JS files
├── types/
│   └── index.ts                    # Shared TypeScript types
├── prisma.config.ts                # Prisma 7 datasource configuration
├── proxy.ts                        # Route protection (replaces middleware.ts in Next.js 16)
├── .env.example                    # Environment variable template
└── package.json
```

---

## Prerequisites

- Node.js 18.17 or later
- PostgreSQL 14 or later (running locally or remote)
- npm 9+

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | 32+ character secret for JWT signing | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No (uses local fallback) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app | No |

**Example `.env.local`:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/buddyscript"
SESSION_SECRET="your-random-32-character-secret-here"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

To generate a secure `SESSION_SECRET`:
```bash
openssl rand -base64 32
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and SESSION_SECRET

# 3. Set up the database (see Database Setup below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`.

---

## Database Setup

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE buddyscript;"
```

### 2. Run migrations

```bash
npm run db:migrate
# Runs: prisma migrate dev
```

This creates all tables: `User`, `Post`, `Comment`, `Like`, and their indexes.

### 3. Seed demo data

```bash
npm run db:seed
# Runs: ts-node prisma/seed.ts
```

Seeds 3 users, 12 posts (mix of PUBLIC/PRIVATE), 7 comments with 1 reply thread, and 12 likes.

### 4. (Optional) Open Prisma Studio

```bash
npm run db:studio
# Opens a visual database browser at http://localhost:5555
```

---

## Demo Accounts

After seeding, these accounts are available:

| Email | Password | Name |
|---|---|---|
| alice@example.com | password123 | Alice Johnson |
| bob@example.com | password123 | Bob Smith |
| carol@example.com | password123 | Carol White |

---

## Architecture

### Authentication

Authentication uses a custom JWT implementation via the `jose` library — **not NextAuth.js**, which is incompatible with Next.js 16.

**Flow:**

1. User submits login form → Server Action `login()` in `app/actions/auth.ts`
2. Password verified with `bcryptjs.compare()`
3. JWT created with `jose` (`HS256`, 7-day expiry), stored as an HTTP-only cookie named `session`
4. All subsequent requests read the cookie via `getSession()` in `lib/session.ts`
5. Logout calls `deleteSession()` which clears the cookie

**Session payload:**
```typescript
type SessionPayload = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  expiresAt: Date;
};
```

**Key functions in `lib/session.ts`:**

| Function | Description |
|---|---|
| `createSession(user)` | Signs JWT, sets HTTP-only cookie |
| `getSession()` | Reads and verifies the session cookie |
| `deleteSession()` | Clears the session cookie (logout) |
| `updateSession()` | Refreshes expiry on active sessions |
| `encrypt(payload)` | Signs a JWT with `SESSION_SECRET` |
| `decrypt(token)` | Verifies and decodes a JWT |

### Route Protection

**File:** `proxy.ts` (root level)

> **Note:** In Next.js 16, the middleware file is named `proxy.ts` and exports a function named `proxy` instead of the `middleware.ts` / `middleware` convention from earlier versions.

Protected routes:
- `/feed/*` — redirects to `/login` if no valid session
- `/login`, `/register` — redirects to `/feed` if already logged in

```typescript
export async function proxy(req: NextRequest) { ... }
export const config = { matcher: ['/feed/:path*', '/login', '/register'] };
```

### Data Layer

**Prisma schema** (`prisma/schema.prisma`):

```
User          — id, firstName, lastName, email, password, avatar, bio
Post          — id, content, imageUrl, visibility (PUBLIC|PRIVATE), authorId
Comment       — id, content, authorId, postId, parentId (self-referential for replies)
Like          — id, userId, postId?, commentId? (unique constraints prevent duplicates)
```

**Indexes:**
- `User.email` — unique lookup for login
- `Post.authorId`, `Post.createdAt DESC`, `Post.(visibility, createdAt DESC)`
- `Comment.(postId, createdAt DESC)`, `Comment.parentId`
- `Like.postId`, `Like.commentId`

**Prisma 7 adapter setup** (`lib/prisma.ts`):

Prisma 7 removed the binary query engine. A driver adapter is required:

```typescript
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

### API Routes

All routes require an authenticated session. Unauthorized requests return `401`.

#### Posts

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts` | Paginated feed (cursor-based). Query params: `cursor`, `limit` (max 50). Returns `{ posts, nextCursor, hasMore }`. Filters PUBLIC posts + current user's PRIVATE posts. |
| `POST` | `/api/posts` | Create a post. Body: `{ content, imageUrl?, visibility? }`. Returns created post with meta. |
| `DELETE` | `/api/posts/[postId]` | Delete a post. Returns `403` if requester is not the author. |

#### Likes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/posts/[postId]/like` | Toggle like on a post. Returns `{ liked: boolean, count: number }`. |
| `GET` | `/api/posts/[postId]/likes` | List users who liked a post. Returns array of `{ id, firstName, lastName, avatar }`. |
| `POST` | `/api/comments/[commentId]/like` | Toggle like on a comment. Returns `{ liked: boolean, count: number }`. |

#### Comments

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts/[postId]/comments` | List comments with nested replies and like counts. |
| `POST` | `/api/posts/[postId]/comments` | Create a comment. Body: `{ content, parentId? }`. Supports 1-level-deep replies. |

#### Upload

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload an image file (multipart/form-data, field name: `file`). Validates MIME type (JPEG/PNG/GIF/WebP) and size (max 5 MB). Uses Cloudinary if configured, otherwise saves to `public/uploads/`. Returns `{ url }`. |

### Component Architecture

The feed uses a **Server Component + Client Component** split:

```
FeedPage (Server Component)
├── Fetches initial 10 posts via direct Prisma query (no HTTP round-trip)
├── Reads session from cookie
└── Renders:
    ├── Navbar
    ├── LeftSidebar
    ├── FeedClient (Client Component) ← receives initialData as prop
    └── RightSidebar

FeedClient (Client Component)
├── useSWRInfinite for cursor-based pagination
├── Falls back to SSR initialData on first render (no loading flash)
├── Prepends new posts created via CreatePost
└── Renders PostCard list with infinite scroll trigger
```

**Component responsibilities:**

| Component | Responsibility |
|---|---|
| `CreatePost` | Textarea, image upload (via `/api/upload`), visibility toggle, calls `/api/posts` POST |
| `PostCard` | Displays post, optimistic like toggle, opens CommentSection, delete (owner only) |
| `CommentSection` | Lazy-loads comments on open, renders CommentItem list, new comment form |
| `CommentItem` | Single comment with like toggle, inline reply input, renders nested replies |
| `LikesModal` | Overlay modal showing users who liked, fetches from `/api/posts/[id]/likes` |
| `DarkModeToggle` | Toggles `data-theme="dark"` on `<html>`, persists preference to `localStorage` |
| `Navbar` | Logo, search bar, icon navigation, profile dropdown with logout |
| `LeftSidebar` | Profile card (avatar, name, bio), navigation links, suggested connections |
| `RightSidebar` | Contacts/friends list with online status indicators |

---

## Features

- **User registration and login** with email/password
- **Persistent sessions** via HTTP-only JWT cookies (7-day expiry)
- **Post creation** with text content, optional image, and PUBLIC/PRIVATE visibility
- **Image uploads** — Cloudinary if configured, local filesystem fallback
- **Infinite scroll feed** — cursor-based pagination, loads 10 posts at a time
- **Optimistic UI** — likes update instantly without waiting for server response
- **Nested comments** — one level of replies per comment
- **Comment likes** — like/unlike individual comments
- **Post deletion** — only by the post author
- **Likes modal** — see who liked a post
- **Dark mode** — toggle persisted across page reloads
- **Input validation** — Zod schemas on both client and server
- **Server Actions** for auth forms — no separate API endpoints needed for login/register

---

## Design System

The UI preserves the original HTML template pixel-faithfully using the `_`-prefixed CSS class naming convention from `public/css/common.css` and `public/css/main.css`.

**CSS custom properties** (defined in `app/globals.css`):

| Variable | Light | Dark |
|---|---|---|
| `--bg1` | `#f0f2f5` | `#18191a` |
| `--bg2` | `#ffffff` | `#242526` |
| `--bcolor1` | `#ddd` | `#3e4042` |
| `--text1` | `#1c1e21` | `#e4e6eb` |
| `--text2` | `#65676b` | `#b0b3b8` |
| `--primary` | `#1877f2` | `#1877f2` |

Dark mode is activated by setting `data-theme="dark"` on `<html>`. The inline script in `app/layout.tsx` reads `localStorage` before first paint to prevent flash of incorrect theme.

**Included CSS files** (loaded in root layout):
- `Bootstrap 4` — grid, utilities
- `common.css` — base component styles
- `main.css` — layout and feed styles
- `responsive.css` — breakpoint overrides

---

## Key Implementation Notes

### Why not NextAuth.js?
NextAuth.js is incompatible with Next.js 16. A custom JWT session using `jose` was implemented instead, providing equivalent functionality with full control over the session lifecycle.

### Why `proxy.ts` instead of `middleware.ts`?
Next.js 16 renamed the middleware file to `proxy.ts` and the exported function to `proxy`. The `middleware.ts` convention from earlier versions will not be picked up by the framework.

### Why `@prisma/adapter-pg`?
Prisma 7 removed the binary query engine. All database connections now require an explicit driver adapter. `@prisma/adapter-pg` provides a native PostgreSQL driver adapter using the `pg` package.

### Why `prisma.config.ts`?
Prisma 7 removed the `url` field from `datasource` in `schema.prisma`. Connection URLs must now be configured in `prisma.config.ts` using `defineConfig({ datasource: { url } })`.

### Cursor-based pagination
The feed uses cursor-based pagination (not OFFSET) for consistency when new posts are created. The cursor is the `id` of the last post in the current page. SWR's `useSWRInfinite` manages the cursor chain and deduplication.

### Path aliases
`@/*` maps to the root directory (`./*`), not `src/`. All `lib/`, `components/`, `types/`, and `app/` directories live at the root of `frontend/`, not inside a `src/` subdirectory.

---

## Scripts Reference

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev` | Start development server with Turbopack |
| `npm run build` | `next build` | Build for production |
| `npm run start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint |
| `npm run db:migrate` | `prisma migrate dev` | Run database migrations |
| `npm run db:seed` | `ts-node prisma/seed.ts` | Seed database with demo data |
| `npm run db:studio` | `prisma studio` | Open Prisma Studio visual browser |

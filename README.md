# BuddyScript — Full-Stack Social Feed Application

A full-stack social media feed application built for the Appifylab Full Stack Engineer selection task. Users can register, log in, create posts with images, like and comment on posts, reply to comments, and control post visibility — all in a responsive UI with dark mode support.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Architecture](#architecture)
  - [Authentication](#authentication)
  - [Route Protection](#route-protection)
  - [Database Schema](#database-schema)
  - [Component Architecture](#component-architecture)
- [Design System](#design-system)
- [Key Implementation Notes](#key-implementation-notes)
- [Scripts Reference](#scripts-reference)

---

## Project Structure

```
buddyscript/
├── frontend/                        # Next.js 16 application (main app)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx       # Login page
│   │   │   └── register/page.tsx    # Registration page
│   │   ├── actions/
│   │   │   └── auth.ts              # Server Actions: register, login, logout
│   │   ├── api/
│   │   │   ├── posts/
│   │   │   │   ├── route.ts         # GET paginated posts / POST create post
│   │   │   │   └── [postId]/
│   │   │   │       ├── route.ts     # DELETE post
│   │   │   │       ├── like/        # POST toggle like on post
│   │   │   │       ├── likes/       # GET users who liked a post
│   │   │   │       └── comments/    # GET comments / POST create comment
│   │   │   ├── comments/
│   │   │   │   └── [commentId]/
│   │   │   │       └── like/        # POST toggle like on comment
│   │   │   │           └── likes/   # GET users who liked a comment
│   │   │   └── upload/route.ts      # POST image upload
│   │   ├── feed/page.tsx            # Feed page (SSR initial data)
│   │   ├── globals.css              # CSS custom properties + dark mode vars
│   │   ├── layout.tsx               # Root layout with CSS + dark mode init script
│   │   └── page.tsx                 # Root redirect (→ /feed or /login)
│   ├── components/
│   │   ├── CommentItem.tsx          # Single comment with replies + like
│   │   ├── CommentSection.tsx       # Lazy-loaded comments list + new comment form
│   │   ├── CreatePost.tsx           # Post composer with image upload + visibility
│   │   ├── DarkModeToggle.tsx       # Dark/light toggle (persisted to localStorage)
│   │   ├── FeedClient.tsx           # Infinite scroll feed (useSWRInfinite)
│   │   ├── LeftSidebar.tsx          # Profile card + navigation + suggestions
│   │   ├── LikesModal.tsx           # Modal listing users who liked a post/comment
│   │   ├── Navbar.tsx               # Top navigation bar with profile dropdown
│   │   ├── PostCard.tsx             # Post card with like/comment/delete actions
│   │   └── RightSidebar.tsx         # Friends/contacts list with online status
│   ├── lib/
│   │   ├── constants.ts             # App-wide constants (limits, durations)
│   │   ├── prisma.ts                # Singleton Prisma client with PrismaPg adapter
│   │   ├── session.ts               # JWT session: encrypt/decrypt/create/get/delete
│   │   └── validations.ts           # Zod schemas for all form inputs
│   ├── prisma/
│   │   ├── migrations/              # SQL migration files
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.ts                  # Demo data seeder (3 users, 12 posts, comments)
│   ├── public/
│   │   ├── css/                     # Bootstrap 4 + original template CSS
│   │   ├── images/                  # Static assets
│   │   └── js/                      # Original template JS files
│   ├── types/index.ts               # Shared TypeScript types
│   ├── prisma.config.ts             # Prisma 7 datasource configuration
│   ├── proxy.ts                     # Route protection middleware (Next.js 16)
│   └── package.json
├── backend/                         # Placeholder (unused — all backend in Next.js)
│   └── package.json
├── assets/                          # Legacy static assets (original HTML template)
├── feed.html                        # Original HTML template (reference only)
├── login.html                       # Original HTML template (reference only)
└── registration.html                # Original HTML template (reference only)
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.2 |
| Language | TypeScript (strict mode) | 5 |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 7.6.0 |
| DB Driver | `@prisma/adapter-pg` + `pg` | 7.6.0 / 8.x |
| Auth | Custom JWT via `jose` | 6.x |
| Styling | Tailwind CSS v4 + original template CSS | 4 |
| Form Validation | Zod | 4.3.6 |
| Data Fetching | SWR (`useSWRInfinite`) | 2.4.1 |
| Image Upload | Cloudinary (local fallback) | 2.x |
| Password Hashing | bcryptjs | 12 rounds |
| Date Formatting | date-fns | 4.1.0 |
| Toast Notifications | react-hot-toast | 2.6.0 |

---

## Features

### Authentication
- User registration with first name, last name, email, and password
- Login with email and password
- JWT sessions stored as HTTP-only, Secure, SameSite=Strict cookies (7-day expiry)
- Session auto-refreshes on each request
- Secure logout clears the cookie and redirects to login

### Posts
- Create posts with text content (up to 2,000 characters)
- Attach images (JPEG, PNG, GIF, WebP — max 5 MB)
- Set visibility: PUBLIC (visible to all) or PRIVATE (visible only to author)
- Delete own posts — other users see no delete control
- Infinite scroll feed with 10 posts per page, SSR initial load (no flash)

### Likes
- Like and unlike posts with optimistic UI (instant feedback, no reload)
- Like and unlike individual comments
- Likes modal showing which users liked a post, with avatars and names

### Comments
- Add comments to any post
- Reply to a comment (one level of nesting)
- Like/unlike comments
- Comments load lazily when the section is opened

### Image Upload
- Validates file type by MIME type (not filename)
- Uploads to Cloudinary when configured
- Falls back to local `public/uploads/` with UUID filenames when Cloudinary is not configured

### UX
- Dark mode toggle — persisted to `localStorage`, reads before first paint to prevent flash
- Toast notifications for upload and submission errors
- Responsive layout across desktop, tablet, and mobile

### Input Validation
- Zod schemas shared between client and server
- Per-field error messages on all forms

---

## Prerequisites

- Node.js 18.17 or later
- PostgreSQL 14 or later
- npm 9 or later

---

## Environment Variables

Create `frontend/.env.local` with the following:

```env
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/buddyscript"
SESSION_SECRET="your-random-32-plus-character-secret-here"

# Optional — image uploads fall back to local filesystem if omitted
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate a secure `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | 32+ character secret for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `NEXT_PUBLIC_APP_URL` | No | Public base URL (used in metadata) |

---

## Getting Started

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL and SESSION_SECRET

# 3. Set up the database (see Database Setup)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`.

---

## Database Setup

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE buddyscript;"
```

### 2. Run migrations

```bash
cd frontend
npm run db:migrate
```

Creates all tables: `User`, `Post`, `Comment`, `Like`, plus all indexes and constraints.

### 3. Seed demo data

```bash
npm run db:seed
```

Seeds 3 users, 12 posts (mix of PUBLIC/PRIVATE), 7 comments including a threaded reply, and 12 likes.

### 4. (Optional) Open Prisma Studio

```bash
npm run db:studio
# Visual database browser at http://localhost:5555
```

---

## Demo Accounts

After running `npm run db:seed`:

| Email | Password | Name |
|---|---|---|
| alice@example.com | password123 | Alice Johnson |
| bob@example.com | password123 | Bob Smith |
| carol@example.com | password123 | Carol White |

---

## API Reference

All endpoints require an authenticated session cookie. Unauthenticated requests return `401`.

### Posts

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts` | Paginated feed. Query: `cursor` (optional), `limit` (optional, max 50, default 10). Returns `{ posts, nextCursor, hasMore }`. Includes PUBLIC posts + caller's own PRIVATE posts. |
| `POST` | `/api/posts` | Create a post. Body: `{ content, imageUrl?, visibility? }`. Returns the created post with metadata. |
| `DELETE` | `/api/posts/[postId]` | Delete a post. Returns `403` if the caller is not the author. |

**`PostWithMeta` shape:**
```typescript
{
  id: string;
  content: string;
  imageUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;          // ISO 8601
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
}
```

### Likes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/posts/[postId]/like` | Toggle like on a post. Returns `{ liked: boolean, likeCount: number }`. |
| `GET` | `/api/posts/[postId]/likes` | List users who liked a post. Returns array of `{ id, firstName, lastName, avatar }`. |
| `POST` | `/api/comments/[commentId]/like` | Toggle like on a comment. Returns `{ liked: boolean, likeCount: number }`. |
| `GET` | `/api/comments/[commentId]/likes` | List users who liked a comment. Returns array of `{ id, firstName, lastName, avatar }`. |

### Comments

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/posts/[postId]/comments` | List top-level comments with nested replies and like counts. |
| `POST` | `/api/posts/[postId]/comments` | Create a comment or reply. Body: `{ content, parentId? }`. |

**`CommentWithMeta` shape:**
```typescript
{
  id: string;
  content: string;
  createdAt: string;
  author: { id, firstName, lastName, avatar };
  likeCount: number;
  isLikedByMe: boolean;
  replies: CommentWithMeta[];   // one level deep
}
```

### Upload

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload an image. `multipart/form-data`, field name: `file`. Max 5 MB. Accepts JPEG, PNG, GIF, WebP. Returns `{ url: string }`. |

---

## Architecture

### Authentication

NextAuth.js is incompatible with Next.js 16, so a custom JWT implementation using the `jose` library was built instead.

**Flow:**
1. User submits login form → Server Action `login()` in `app/actions/auth.ts`
2. Password verified with `bcryptjs.compare()`
3. JWT signed with `SESSION_SECRET` (HS256, 7-day expiry), set as HTTP-only cookie named `session`
4. All API routes and Server Components call `getSession()` to verify the cookie
5. Logout calls `deleteSession()` which clears the cookie and redirects to `/login`

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

**Session cookie settings:**
- Name: `session`
- HttpOnly: `true`
- Secure: `true` (production) / `false` (development)
- SameSite: `strict`
- Max age: 7 days

**Key functions in `lib/session.ts`:**

| Function | Description |
|---|---|
| `createSession(user)` | Signs JWT and sets the HTTP-only cookie |
| `getSession()` | Reads and verifies the session cookie; returns payload or null |
| `deleteSession()` | Clears the session cookie |
| `updateSession()` | Refreshes the expiry on an existing session |
| `encrypt(payload)` | Signs a JWT string with `SESSION_SECRET` |
| `decrypt(token)` | Verifies and decodes a JWT string |

### Route Protection

**File:** `frontend/proxy.ts`

In Next.js 16, the middleware file is named `proxy.ts` and exports a function named `proxy` (not `middleware`).

| Route pattern | Unauthenticated | Authenticated |
|---|---|---|
| `/feed/*` | Redirect → `/login` | Allowed |
| `/login` | Allowed | Redirect → `/feed` |
| `/register` | Allowed | Redirect → `/feed` |

### Database Schema

```
User
  id          String  (CUID, PK)
  firstName   String
  lastName    String
  email       String  (unique, indexed)
  password    String  (bcrypt hash)
  avatar      String? (URL)
  bio         String?
  createdAt   DateTime
  updatedAt   DateTime
  ── has many Posts, Comments, Likes

Post
  id          String  (CUID, PK)
  content     String  (1–2000 chars)
  imageUrl    String?
  visibility  Enum    PUBLIC | PRIVATE
  authorId    String  (FK → User, cascade delete)
  createdAt   DateTime (indexed desc)
  updatedAt   DateTime
  ── has many Comments, Likes

Comment
  id          String  (CUID, PK)
  content     String  (1–1000 chars)
  authorId    String  (FK → User, cascade delete)
  postId      String  (FK → Post, cascade delete)
  parentId    String? (FK → Comment, self-referential for replies)
  createdAt   DateTime (indexed with postId, desc)
  updatedAt   DateTime
  ── has many Likes, Replies (Comment[])

Like
  id          String  (CUID, PK)
  userId      String  (FK → User, cascade delete)
  postId      String? (FK → Post, cascade delete)
  commentId   String? (FK → Comment, cascade delete)
  createdAt   DateTime
  ── unique(userId, postId)      — prevents duplicate post likes
  ── unique(userId, commentId)   — prevents duplicate comment likes
```

**Indexes:**
- `User.email` — fast login lookup
- `Post.(authorId)`, `Post.(createdAt DESC)`, `Post.(visibility, createdAt DESC)` — feed queries
- `Comment.(postId, createdAt DESC)`, `Comment.(parentId)` — comment loading
- `Like.(postId)`, `Like.(commentId)` — like count aggregation

### Component Architecture

```
FeedPage  [Server Component]
  Reads session from cookie
  Fetches first 10 posts via Prisma directly (no HTTP)
  └── FeedClient  [Client Component]
        useSWRInfinite for cursor-based pagination
        Receives initialData as prop (no loading flash)
        Prepends newly created posts
        └── CreatePost     — post composer (textarea, image, visibility)
            PostCard[]     — one per post
              CommentSection  — lazy-loaded, opens on click
                CommentItem[] — with nested CommentItem for replies
              LikesModal      — overlay, fetches likers on open
```

**All components:**

| Component | Responsibility |
|---|---|
| `CreatePost` | Textarea, image upload preview, visibility toggle, calls `/api/posts` |
| `PostCard` | Displays post, optimistic like toggle, opens `CommentSection`, delete (owner only) |
| `CommentSection` | Lazy-loads comments when opened, renders `CommentItem` list, new comment input |
| `CommentItem` | Comment with like toggle, inline reply input, renders nested replies recursively |
| `LikesModal` | Overlay listing users who liked; fetches `/api/posts/[id]/likes` or `/api/comments/[id]/likes` |
| `DarkModeToggle` | Toggles `data-theme="dark"` on `<html>`, persists to `localStorage` |
| `Navbar` | Logo, search bar, notification bell dropdown, profile dropdown with logout |
| `LeftSidebar` | User profile card, navigation links, suggested connections |
| `RightSidebar` | Contacts list with online/offline indicators |

---

## Design System

The UI is pixel-faithful to the provided HTML template, preserving all `_`-prefixed CSS class names from `public/css/common.css` and `public/css/main.css`.

**CSS custom properties** (defined in `app/globals.css`):

| Variable | Light mode | Dark mode |
|---|---|---|
| `--bg1` | `#f0f2f5` | `#18191a` |
| `--bg2` | `#ffffff` | `#242526` |
| `--bcolor1` | `#ddd` | `#3e4042` |
| `--text1` | `#1c1e21` | `#e4e6eb` |
| `--text2` | `#65676b` | `#b0b3b8` |
| `--primary` | `#1877f2` | `#1877f2` |

Dark mode is activated by setting `data-theme="dark"` on `<html>`. An inline script in `app/layout.tsx` reads `localStorage` synchronously before first paint to prevent a flash of the wrong theme.

**CSS loaded in root layout:**
- `Bootstrap 4` — grid system and utilities
- `common.css` — base component styles
- `main.css` — feed and layout styles
- `responsive.css` — breakpoint overrides

---

## Key Implementation Notes

### Why not NextAuth.js?
NextAuth.js is incompatible with Next.js 16. A custom JWT session using `jose` provides equivalent security with full control over the session lifecycle.

### Why `proxy.ts` instead of `middleware.ts`?
Next.js 16 renamed the middleware entry point to `proxy.ts` and the exported function to `proxy`. The `middleware.ts` / `middleware` convention from earlier versions is not recognised.

### Why `@prisma/adapter-pg`?
Prisma 7 removed the binary query engine. All database connections now require an explicit driver adapter. `@prisma/adapter-pg` provides a native PostgreSQL driver using the `pg` package.

### Why `prisma.config.ts`?
Prisma 7 removed the `url` field from `datasource` in `schema.prisma`. Connection URLs must now be declared in `prisma.config.ts` using `defineConfig({ datasource: { url } })`.

### Cursor-based pagination
The feed uses cursor-based pagination (not OFFSET) so results remain stable when new posts are created mid-session. The cursor is the `id` of the last post in the current page. `useSWRInfinite` manages the cursor chain and deduplication.

### Optimistic UI for likes
Like state and count update immediately on click. If the server request fails, the UI rolls back to the previous state. This makes the interaction feel instant without sacrificing correctness.

### Image validation by MIME type
File uploads are validated by inspecting the binary MIME type (via `file.type` on the client and `formData` parsing on the server), not the filename extension, to prevent extension spoofing.

### Path aliases
`@/*` maps to the root of `frontend/` (`./*`), not a `src/` subdirectory. All `lib/`, `components/`, `types/`, and `app/` directories live directly under `frontend/`.

---

## Scripts Reference

Run all scripts from the `frontend/` directory.

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev` | Start development server with Turbopack |
| `npm run build` | `next build` | Build for production |
| `npm run start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint |
| `npm run db:migrate` | `prisma migrate dev` | Run pending database migrations |
| `npm run db:seed` | `ts-node prisma/seed.ts` | Seed database with demo accounts and posts |
| `npm run db:studio` | `prisma studio` | Open Prisma Studio visual database browser |

---

## Validation Rules

| Schema | Rules |
|---|---|
| `registerSchema` | `firstName` (1+ chars), `lastName` (1+ chars), `email` (valid format), `password` (8+ chars, at least 1 uppercase letter, at least 1 number), `confirmPassword` (must match password), `agreeTerms` (must be true) |
| `loginSchema` | `email` (valid format), `password` (non-empty) |
| `createPostSchema` | `content` (1–2000 chars), `imageUrl` (valid URL, optional), `visibility` (`PUBLIC` or `PRIVATE`) |
| `createCommentSchema` | `content` (1–1000 chars), `parentId` (optional string for replies) |

---

## Constants

Defined in `lib/constants.ts`:

| Constant | Value | Used for |
|---|---|---|
| `DEFAULT_PAGE_SIZE` | 10 | Posts per page in feed |
| `MAX_PAGE_SIZE` | 50 | Maximum `limit` param accepted by `/api/posts` |
| `MAX_UPLOAD_SIZE_MB` | 5 | Maximum image file size |
| `SESSION_DURATION_DAYS` | 7 | JWT and cookie expiry |
| `MAX_POST_LENGTH` | 2000 | Post content character limit |
| `MAX_COMMENT_LENGTH` | 1000 | Comment content character limit |

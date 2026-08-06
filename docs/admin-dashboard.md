# Admin Dashboard — Specification

> Copy this entire document into your admin-project repo. It describes every
> table, every column, the design system, and the exact Supabase setup so the
> dashboard can be built as the control centre for `portfolio-2.0`.

---

## 1. Architecture

```
┌─────────────────────────┐     ┌──────────────────────────┐
│     portfolio-2.0       │     │    admin-dashboard       │
│   (public website)      │     │   (private dashboard)    │
│                         │     │                          │
│  • Reads from Supabase  │     │  • Writes to Supabase    │
│  • Uses anon key        │     │  • Uses anon key + auth  │
│  • Falls back to static │     │  • Login required        │
│    content/ files when  │     │  • Rich forms, previews  │
│    env vars are missing │     │  • Image uploads         │
│  • Zero config by default    │                          │
└──────────┬──────────────┘     └───────────┬──────────────┘
           │                                │
           │        Supabase Project        │
           │    (shared backend / DB)       │
           │                                │
           │  ┌──────────────────────────┐  │
           │  │      PostgreSQL          │  │
           │  │  • blog_posts            │  │
           │  │  • projects              │  │
           │  │  • education             │  │
           │  │  • activities            │  │
           │  │  • certificates          │  │
           │  │  • storage (images)      │  │
           │  └──────────────────────────┘  │
           │                                │
           └────────────────────────────────┘
```

- **Shared Supabase project** — admin writes rows, portfolio reads them.
- **Auth**: Supabase Auth with email/password. The admin dashboard uses `signInWithPassword()` from `@supabase/supabase-js`.
- **Row-Level Security (RLS)**: Public can `SELECT` (anon key). Authenticated users can `INSERT`, `UPDATE`, `DELETE` (via RLS policies).
- **Storage**: Supabase Storage bucket for images (blog covers, project screenshots, certificate images, activity photos). Bucket name: `content-images`.
- **No server-side code needed** in the admin dashboard — everything goes directly through the Supabase JS client. The portfolio already reads from the same tables.

---

## 2. Environment Variables

The admin dashboard needs these env vars (same values as the portfolio):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

The portfolio uses a third key `SUPABASE_SERVICE_ROLE_KEY` **only on the server** for the data layer. The admin dashboard does **not** need the service-role key — it writes through the authenticated user via RLS.

---

## 3. Design System

Match the portfolio&rsquo;s aesthetic — **minimal monochrome + halftone tech vibe**.

### 3.1 Fonts

| Token          | Font               | Usage              |
|----------------|--------------------|--------------------|
| `--font-sans`  | Geist              | Body text, inputs  |
| `--font-mono`  | Geist Mono         | Headings, labels, code, badges, nav |

> The admin dashboard can keep `Geist Mono` for structure and labels but may
> use `Geist` more liberally for form descriptions, help text, and long-form
> input areas where readability matters.

### 3.2 Colour Palette

All tokens are **oklch monochrome** — pure black‑white‑gray. No accent/accent colours.

#### Light mode

| Token              | Value              | Hex-ish         |
|--------------------|--------------------|------------------|
| `--background`     | `oklch(1 0 0)`     | `#ffffff`        |
| `--foreground`     | `oklch(0.1 0 0)`   | `#1a1a1a`        |
| `--card`           | `oklch(0.98 0 0)`  | `#fafafa`        |
| `--card-foreground`| `oklch(0.1 0 0)`   | `#1a1a1a`        |
| `--primary`        | `oklch(0.08 0 0)`  | `#141414`        |
| `--primary-foreground` | `oklch(1 0 0)` | `#ffffff`       |
| `--secondary`      | `oklch(0.94 0 0)`  | `#f0f0f0`        |
| `--muted`          | `oklch(0.94 0 0)`  | `#f0f0f0`        |
| `--muted-foreground`| `oklch(0.48 0 0)` | `#7a7a7a`       |
| `--border`         | `oklch(0.88 0 0)`  | `#e0e0e0`        |
| `--input`          | `oklch(0.88 0 0)`  | `#e0e0e0`        |
| `--ring`           | `oklch(0.25 0 0)`  | `#404040`        |

#### Dark mode

| Token              | Value              | Hex-ish         |
|--------------------|--------------------|------------------|
| `--background`     | `oklch(0.09 0 0)`  | `#171717`        |
| `--foreground`     | `oklch(0.92 0 0)`  | `#ebebeb`        |
| `--card`           | `oklch(0.12 0 0)`  | `#1f1f1f`        |
| `--muted`          | `oklch(0.18 0 0)`  | `#2e2e2e`        |
| `--border`         | `oklch(0.2 0 0)`   | `#333333`        |

### 3.3 Halftone Utility Classes

Copy these CSS utilities into the admin dashboard&rsquo;s `globals.css`:

```css
.halftone-dots {
  background-image: radial-gradient(circle, currentColor 0.5px, transparent 0.5px);
  background-size: 6px 6px;
}

.halftone-dots-sm {
  background-image: radial-gradient(circle, currentColor 0.5px, transparent 0.5px);
  background-size: 4px 4px;
}

.halftone-grid {
  background-image:
    linear-gradient(to right, currentColor 0.5px, transparent 0.5px),
    linear-gradient(to bottom, currentColor 0.5px, transparent 0.5px);
  background-size: 20px 20px;
}
```

Use sparingly for empty states, card placeholders, and login screen backgrounds.

### 3.4 Visual Language Summary

| Element       | Rule                                              |
|---------------|---------------------------------------------------|
| Borders       | `border border-border/50` — thin, muted dividers  |
| Cards         | `border border-border/50 bg-card` — flat, no shadow |
| Buttons (primary) | `bg-foreground text-background` — inverted pill |
| Buttons (secondary) | `border border-border/50` — outlined          |
| Badges/chips  | `border border-border/50 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase` |
| Labels        | `font-mono text-[11px] tracking-wider text-foreground/35 uppercase` |
| Inputs        | `border border-border bg-transparent px-3 py-2 font-mono text-sm` |
| Headings      | `font-mono text-2xl font-semibold tracking-tighter` |
| Sidebar       | `bg-card border-r border-border/50`              |
| Radius        | `none` or `rounded-none` — keep it sharp         |

---

## 4. Authentication

The admin dashboard must use **Supabase Auth** with email/password.

### 4.1 Setup in Supabase Dashboard

1. Go to **Authentication → Settings**.
2. Under **Email Auth**, disable **Confirm email** (or keep it enabled — your choice).
3. Under **Users**, create the admin user manually:
   - Click **Add user** → fill email + password → check **Auto Confirm**.
4. (Optional) Set up a custom SMTP server if you want branded magic-link emails.

### 4.2 Client-Side Login

```ts
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(url, anonKey)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@example.com",
  password: "••••••••",
})

// Logout
await supabase.auth.signOut()

// Session listener (for route guards)
supabase.auth.onAuthStateChange((event, session) => {
  // redirect if !session
})
```

### 4.3 Route Guard

Wrap the entire app behind a login gate:

```
/              → Login page (if not authenticated)
/dashboard     → Redirect to /dashboard/blog (default)
/dashboard/blog          → Blog post CRUD
/dashboard/projects      → Project CRUD
/dashboard/education     → Education entries CRUD
/dashboard/activities    → Activities CRUD
/dashboard/certificates  → Certificates CRUD
/dashboard/media         → Image uploads / storage browser
/dashboard/settings      → Profile, password change
```

### 4.4 RLS Policies (already in schema.sql)

```sql
-- Public can read
create policy "Public can read published blog posts"
  on blog_posts for select using (published = true);

-- Authenticated users can do anything
create policy "Authenticated users can manage blog posts"
  on blog_posts for all using (auth.role() = 'authenticated');
```

The admin dashboard uses the **anon key** + an active session (auth cookie set by `supabase.auth.signInWithPassword`). RLS checks `auth.role()` on every request. As long as the user is logged in, they have full CRUD access.

---

## 5. Database Schema — Complete Reference

> The SQL below already exists in `lib/supabase/schema.sql` in the portfolio
> repo. Run it in the Supabase SQL Editor to create all tables. The admin
> dashboard only needs to **write to** these tables.

### 5.1 `blog_posts`

| Column         | Type           | Constraints          | Notes                                   |
|----------------|----------------|----------------------|-----------------------------------------|
| `id`           | `uuid`         | PK, `gen_random_uuid()` | Internal identifier                  |
| `slug`         | `text`         | `UNIQUE NOT NULL`    | URL segment, e.g. `"why-i-blog"`       |
| `title`        | `text`         | `NOT NULL`           | Display title                           |
| `date`         | `date`         | `DEFAULT current_date` | Publication date                      |
| `excerpt`      | `text`         | `DEFAULT ''`         | 1-2 sentence preview                   |
| `tags`         | `jsonb`        | `DEFAULT '[]'`       | `["tag-a", "tag-b"]` — array of strings |
| `cover_image`  | `text`         | nullable             | URL from Supabase Storage               |
| `content`      | `text`         | `DEFAULT ''`         | Raw MDX source                          |
| `reading_time` | `integer`      | `DEFAULT 1`          | Minutes, computed or manual             |
| `published`    | `boolean`      | `DEFAULT false`      | Toggle visibility                       |
| `created_at`   | `timestamptz`  | `DEFAULT now()`      |                                         |
| `updated_at`   | `timestamptz`  | `DEFAULT now()`      |                                         |

**Admin form fields:**

| Field           | Input type            | Validation                          |
|-----------------|-----------------------|-------------------------------------|
| Slug            | Text input            | Required, unique, lowercase-kebab   |
| Title           | Text input            | Required                            |
| Date            | Date picker           | Required                            |
| Excerpt         | Textarea (2 rows)     | 300 char max                        |
| Tags            | Tag input (multi)     | Comma-separated or chip UI          |
| Cover image     | File upload → Storage | Optional, show preview              |
| Content         | Markdown/MDX editor   | Required                            |
| Reading time    | Number input          | Auto-calculate from word count      |
| Published       | Toggle switch         |                                     |

**Special behaviour:**
- `reading_time` should auto-compute from `content` word count (≈ 200 wpm).
- `updated_at` should bump on every save (use a trigger or client-side set).
- The portfolio filters `WHERE published = true`, so drafts never show publicly.

---

### 5.2 `projects`

| Column         | Type           | Constraints          | Notes                                   |
|----------------|----------------|----------------------|-----------------------------------------|
| `id`           | `uuid`         | PK, `gen_random_uuid()` |                                     |
| `slug`         | `text`         | `UNIQUE NOT NULL`    | e.g. `"visual-algo"`                   |
| `title`        | `text`         | `NOT NULL`           |                                         |
| `tagline`      | `text`         | `DEFAULT ''`         | One-liner subtitle                      |
| `description`  | `text`         | `DEFAULT ''`         | MDX — project overview                  |
| `technologies` | `jsonb`        | `DEFAULT '[]'`       | `["React", "TypeScript", "Canvas"]`     |
| `year`         | `text`         | `NOT NULL`           | e.g. `"2025"`                           |
| `cover_image`  | `text`         | nullable             | Storage URL                             |
| `live_url`     | `text`         | nullable             | Deployed site link                      |
| `repo_url`     | `text`         | nullable             | GitHub link                             |
| `featured`     | `boolean`      | `DEFAULT false`      | Shows on homepage if true               |
| `thinking`     | `jsonb`        | `DEFAULT '[]'`       | Array of `{heading, body}` objects      |
| `results`      | `jsonb`        | `DEFAULT '[]'`       | Array of `{heading, body}` objects      |
| `created_at`   | `timestamptz`  | `DEFAULT now()`      |                                         |
| `updated_at`   | `timestamptz`  | `DEFAULT now()`      |                                         |

**`thinking` and `results` JSON shape:**

```json
[
  { "heading": "The problem", "body": "Markdown content here…" },
  { "heading": "Stepping through the work", "body": "More markdown…" }
]
```

**Admin form fields:**

| Field           | Input type              | Validation                        |
|-----------------|-------------------------|-----------------------------------|
| Slug            | Text input              | Required, unique                  |
| Title           | Text input              | Required                          |
| Tagline         | Text input              | 120 char max                      |
| Description     | MDX editor              | Required                          |
| Technologies    | Tag input (multi)       | Sorted alphabetically             |
| Year            | Text input              | Required                          |
| Cover image     | File upload → Storage   | Optional                          |
| Live URL        | URL input               | Optional                          |
| Repo URL        | URL input               | Optional                          |
| Featured        | Toggle switch           |                                   |
| Thinking blocks | Dynamic list of `{heading, body}` | Add/remove/reorder blocks |
| Results blocks  | Dynamic list of `{heading, body}` | Add/remove/reorder blocks |

**Special behaviour:**
- `thinking` and `results` are **dynamic lists**. The admin UI should let the user add/remove/reorder blocks. Each block has two fields: `heading` (text input) and `body` (MDX editor).
- `featured` projects appear on the homepage. Aim to keep this ≤ 3.

---

### 5.3 `education`

| Column         | Type           | Constraints          | Notes                                |
|----------------|----------------|----------------------|--------------------------------------|
| `id`           | `uuid`         | PK, `gen_random_uuid()` |                                  |
| `institution`  | `text`         | `NOT NULL`           | e.g. `"University of Example"`       |
| `degree`       | `text`         | `NOT NULL`           | e.g. `"Bachelor of Science"`         |
| `field`        | `text`         | `DEFAULT ''`         | e.g. `"Computer Science"`            |
| `start_date`   | `text`         | `NOT NULL`           | e.g. `"2022"`                        |
| `end_date`     | `text`         | `NOT NULL`           | e.g. `"2026"`                        |
| `description`  | `text`         | `DEFAULT ''`         | Plain text paragraph                 |
| `highlights`   | `jsonb`        | `DEFAULT '[]'`       | `["Achievement A", "Achievement B"]` |
| `gpa`          | `text`         | nullable             | e.g. `"3.87 / 4.0"`                 |
| `courses`      | `jsonb`        | `DEFAULT '[]'`       | `["CS101", "DS202"]`                |
| `sort_order`   | `integer`      | `DEFAULT 0`          | Lower = first                        |
| `created_at`   | `timestamptz`  | `DEFAULT now()`      |                                      |

**Admin form fields:**

| Field           | Input type              | Validation                   |
|-----------------|-------------------------|------------------------------|
| Institution     | Text input              | Required                     |
| Degree          | Text input              | Required                     |
| Field           | Text input              | Optional                     |
| Start date      | Text input (year)       | Required                     |
| End date        | Text input (year)       | Required                     |
| Description     | Textarea (3 rows)       | 500 char max                 |
| Highlights      | List of text inputs     | Add/remove items             |
| GPA             | Text input              | Optional                     |
| Courses         | Tag input (multi)       | Optional, sorted             |
| Sort order      | Number input            | Auto-incremented             |

---

### 5.4 `activities`

| Column         | Type           | Constraints          | Notes                                |
|----------------|----------------|----------------------|--------------------------------------|
| `id`           | `uuid`         | PK, `gen_random_uuid()` |                                  |
| `title`        | `text`         | `NOT NULL`           | e.g. `"GDSC Core Team"`              |
| `organization` | `text`         | `NOT NULL`           | e.g. `"Google × University"`         |
| `type`         | `text`         | `NOT NULL`           | One of: `program`, `ambassadorship`, `involvement` |
| `start_date`   | `text`         | `NOT NULL`           | e.g. `"2024"`                        |
| `end_date`     | `text`         | nullable             | `null` = &ldquo;present&rdquo;       |
| `description`  | `text`         | `DEFAULT ''`         | Short summary                        |
| `contributions`| `jsonb`        | `DEFAULT '[]'`       | `["Item A", "Item B"]` — bullet list |
| `takeaway`     | `text`         | nullable             | Long-form reflection, MDX supported  |
| `image`        | `text`         | nullable             | URL from Supabase Storage            |
| `sort_order`   | `integer`      | `DEFAULT 0`          | Lower = first                        |
| `created_at`   | `timestamptz`  | `DEFAULT now()`      |                                      |

**Admin form fields:**

| Field           | Input type              | Validation                     |
|-----------------|-------------------------|--------------------------------|
| Title           | Text input              | Required                       |
| Organization    | Text input              | Required                       |
| Type            | Select dropdown         | Required — `program` / `ambassadorship` / `involvement` |
| Start date      | Text input (year)       | Required                       |
| End date        | Text input (year)       | Optional — leave blank for ongoing |
| Description     | Textarea (3 rows)       | 500 char max                   |
| Contributions   | List of text inputs     | Add/remove items               |
| Takeaway        | Textarea (5 rows)       | Optional, MDX supported         |
| Image           | File upload → Storage   | Optional                       |
| Sort order      | Number input            | Auto-incremented               |

---

### 5.5 `certificates`

| Column         | Type           | Constraints          | Notes                                |
|----------------|----------------|----------------------|--------------------------------------|
| `id`           | `uuid`         | PK, `gen_random_uuid()` |                                  |
| `slug`         | `text`         | `UNIQUE NOT NULL`    | e.g. `"google-cloud-digital-leader"` |
| `title`        | `text`         | `NOT NULL`           | e.g. `"Cloud Digital Leader"`        |
| `issuer`       | `text`         | `NOT NULL`           | e.g. `"Google Cloud"`                |
| `date`         | `date`         | `NOT NULL`           | Issue date                           |
| `description`  | `text`         | nullable             | What the cert is / what it covers    |
| `url`          | `text`         | `NOT NULL`           | Verification link (Credly, Coursera, etc.) |
| `credential_id`| `text`         | nullable             | e.g. `"GCL-2025-0001"`              |
| `sort_order`   | `integer`      | `DEFAULT 0`          | Lower = first                        |
| `created_at`   | `timestamptz`  | `DEFAULT now()`      |                                      |

> No `image` column needed — certificates are displayed text-only in the
> portfolio. The `url` field links to the issuer&rsquo;s verification page.

**Admin form fields:**

| Field           | Input type            | Validation                          |
|-----------------|-----------------------|-------------------------------------|
| Slug            | Text input            | Required, unique                    |
| Title           | Text input            | Required                            |
| Issuer          | Text input            | Required                            |
| Date            | Date picker           | Required                            |
| Description     | Textarea (3 rows)     | Optional                            |
| URL             | URL input             | Required                            |
| Credential ID   | Text input            | Optional                            |
| Sort order      | Number input          |                                     |

---

### 5.6 Storage Bucket

Create a bucket named `content-images` in Supabase Storage:

1. Go to **Storage → New Bucket**.
2. Name: `content-images`
3. ✅ **Public bucket** (so image URLs work without signed tokens).
4. File size limit: 5 MB.
5. Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`.

**RLS for storage:**

```sql
-- Public can view
create policy "Public can view images"
  on storage.objects for select
  using (bucket_id = 'content-images');

-- Authenticated users can upload/delete
create policy "Authenticated can upload images"
  on storage.objects for insert
  with check (bucket_id = 'content-images' and auth.role() = 'authenticated');

create policy "Authenticated can delete images"
  on storage.objects for delete
  using (bucket_id = 'content-images' and auth.role() = 'authenticated');
```

**How the admin uploads:**
```ts
const file = event.target.files[0]
const path = `blog/${Date.now()}-${file.name}`

const { data, error } = await supabase.storage
  .from("content-images")
  .upload(path, file)

// Construct the public URL
const publicUrl = supabase.storage
  .from("content-images")
  .getPublicUrl(data.path).data.publicUrl

// Store publicUrl in the record (cover_image, image, etc.)
```

---

## 6. Admin Dashboard Pages

### 6.1 Login Page (`/`)

- Centered card on a halftone-dot background.
- Email + password fields.
- "Sign in" button.
- Error state for invalid credentials.
- On success → redirect to `/dashboard/blog`.

### 6.2 Shell / Layout

- **Sidebar** (left, 240px):
  - Logo: `adhaghani` in monospace.
  - Nav items: Blog, Projects, Education, Activities, Certificates, Media.
  - Active item: `bg-foreground/5`.
  - Bottom: "Sign out" link.
- **Top bar**: Page title + "Signed in as <email>" badge.
- **Main content area**: scrollable, padded.

### 6.3 Blog Posts (`/dashboard/blog`)

- **List view**: table with columns — Title, Date, Tags, Published, Actions.
  - Sortable by date, title.
  - Filter by published/draft.
  - Search by title.
  - Each row: Edit (pencil icon) · Delete (trash icon, with confirmation).
  - "New post" button at top right.
- **Edit/Create view**: form with all fields from §5.1.
  - MDX editor for `content` (recommend a split-pane: edit left, preview right, or tabs).
  - "Save draft" (published = false) and "Publish" (published = true) buttons.
  - "Delete" button (with confirmation modal).

### 6.4 Projects (`/dashboard/projects`)

- Same list → create/edit pattern as blog.
- The `thinking` and `results` fields each need a **dynamic block editor**:
  - A list of blocks, each with a `heading` input and a `body` MDX editor.
  - "Add block", "Remove block", drag-to-reorder (optional).
  - Each block serialises to `{ heading: "...", body: "..." }`.

### 6.5 Education (`/dashboard/education`)

- List of education entries sorted by `sort_order`.
- Drag-to-reorder rows (optional — can use up/down buttons instead).
- Edit form with all fields from §5.3.

### 6.6 Activities (`/dashboard/activities`)

- Filterable by type (program / ambassadorship / involvement).
- Edit form includes the `contributions` dynamic list.
- `takeaway` is a larger MDX editor.
- `image` upload for a single photo.

### 6.7 Certificates (`/dashboard/certificates`)

- Straightforward CRUD. Smallest form.
- URL validation on the `url` field (must start with `https://`).

### 6.8 Media (`/dashboard/media`)

- File browser for the `content-images` bucket.
- Upload new files (drag-and-drop or click).
- Copy URL to clipboard.
- Delete files (with confirmation).
- Optional: show which records reference each image (join on `cover_image`, `image`).

---

## 7. Supabase Client Setup (Shared Code)

Both the portfolio and the admin use identical Supabase clients.
Here is the **server** and **browser** setup from the portfolio that the admin
can replicate:

### 7.1 Browser Client

```ts
// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

let browserClient: ReturnType<typeof createClient<Database>> | null = null

export function getBrowserClient() {
  if (browserClient) return browserClient
  browserClient = createClient<Database>(url, anonKey)
  return browserClient
}
```

### 7.2 The `Database` Type

Copy [lib/supabase/database.types.ts](../lib/supabase/database.types.ts)
verbatim from the portfolio repo into the admin project. It defines the full
TypeScript shape of every table.

### 7.3 Auth Helper

```ts
// lib/auth.ts
import { getBrowserClient } from "./supabase/client"

export async function login(email: string, password: string) {
  const supabase = getBrowserClient()
  return supabase.auth.signInWithPassword({ email, password })
}

export async function logout() {
  const supabase = getBrowserClient()
  return supabase.auth.signOut()
}

export async function getSession() {
  const supabase = getBrowserClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}
```

---

## 8. CRUD Patterns

For every table, the admin dashboard follows the same pattern:

```ts
const supabase = getBrowserClient()

// CREATE
const { data, error } = await supabase
  .from("blog_posts")
  .insert({ slug, title, date, excerpt, tags, content, reading_time, published })
  .select()
  .single()

// READ (all)
const { data, error } = await supabase
  .from("blog_posts")
  .select("*")
  .order("date", { ascending: false })

// READ (single)
const { data, error } = await supabase
  .from("blog_posts")
  .select("*")
  .eq("slug", slug)
  .single()

// UPDATE
const { data, error } = await supabase
  .from("blog_posts")
  .update({ title, content, updated_at: new Date().toISOString() })
  .eq("id", id)
  .select()
  .single()

// DELETE
const { error } = await supabase
  .from("blog_posts")
  .delete()
  .eq("id", id)
```

---

## 9. Tech Stack Recommendation

| Layer        | Choice                       | Why                                     |
|--------------|------------------------------|------------------------------------------|
| Framework    | Next.js 16 (App Router)      | Same as portfolio, shared patterns       |
| Styling      | Tailwind CSS v4              | Same as portfolio, shared tokens         |
| Components   | Radix UI primitives          | Dialogs, dropdowns, toggles — accessible |
| Forms        | React Hook Form + Zod        | Validation, dirty tracking               |
| MDX Editor   | `@uiw/react-md-editor` or a simple `<textarea>` with preview | Simpler = fewer deps; start with textarea, upgrade later |
| Icons        | `lucide-react`               | Same as portfolio                        |
| Fonts        | Geist + Geist Mono            | Same as portfolio                        |
| Deployment   | Vercel (free tier)            | Separate project from portfolio          |
| Auth         | Supabase Auth (email/password) | Built into the shared project          |

---

## 10. Quick-Start Checklist

1. [ ] Create a new Next.js project: `npx create-next-app@latest admin-dashboard`.
2. [ ] Install deps: `@supabase/supabase-js`, `lucide-react`, `next-themes`.
3. [ ] Copy `lib/supabase/database.types.ts` from portfolio.
4. [ ] Copy `lib/supabase/client.ts` from portfolio.
5. [ ] Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
6. [ ] Run the complete `schema.sql` in Supabase SQL Editor (from portfolio `lib/supabase/schema.sql`).
7. [ ] Run the storage bucket SQL (from §5.6 above).
8. [ ] Create the storage bucket `content-images` (public).
9. [ ] Create an admin user in Supabase Auth.
10. [ ] Build the login page with `signInWithPassword`.
11. [ ] Build the sidebar shell.
12. [ ] Build the blog CRUD page (most complex — start here, pattern carries to the rest).
13. [ ] Build projects, education, activities, certificates pages.
14. [ ] Build the media page.
15. [ ] Deploy to Vercel. Set env vars. Done.

# Earth Guardians South America - Setup Guide

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Run Schema in Supabase
1. Go to: https://supabase.com/dashboard/project/bnkwtlbtnvoitmjvefvw/sql
2. Click **New Query**
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click **Run**

This creates all tables, RLS policies, and triggers.

### Step 3: Migrate Your Project Data
1. In same SQL Editor, create **New Query**
2. Copy entire contents of `supabase/migrate-manual.sql`
3. Paste and click **Run**

This inserts all 24 projects linked to YOUR account (UUID: `bff69471-dca3-41cf-ac3d-4124053c940a`).

### Step 4: Start Development
```bash
pnpm run dev
```

App will be at: http://localhost:5173/projects/

---

## Verify Migration

To check if migration worked:

```bash
node supabase/check-status.js
```

You should see:
```
✅ You own 24 project(s)
```

---

## Environment Variables

The `.env` file is already configured with your Supabase credentials:
- `VITE_SUPABASE_URL` - Your project URL
- `VITE_SUPABASE_ANON_KEY` - Public/anon key

**Never commit these to Git** - the file is gitignored.

---

## Features

### ✅ Working Now
- Google OAuth login (configure in Supabase Dashboard > Authentication > Providers)
- Email/password fallback
- All 24 projects loaded from database
- Inline editing (title, description, KPI details)
- Drag-and-drop card repositioning
- Privacy settings (public/private/link-only)
- Content blocks (text, image, link)
- Real-time collaboration indicators
- Member management (invite by email)
- Subproject relationships
- Link chips (auto-formatted for Instagram, YouTube, etc.)

### 🔧 Offline Mode
If Supabase is unavailable, app falls back to hardcoded local data automatically.

---

## Deploy to GitHub Pages

```bash
pnpm run deploy
```

Your site is configured for: `https://hautlys.github.io/projects/`

---

## Troubleshooting

### "Projects table does not exist"
Run `supabase/schema.sql` first (Step 2 above).

### "new row violates row-level security policy"
Use the manual SQL migration (`migrate-manual.sql`) instead of the Node.js script. Direct SQL bypasses RLS.

### No projects showing after migration
Run `node supabase/check-status.js` to verify. If count is 0, the migration didn't complete. Re-run `migrate-manual.sql`.

### Blank page on load
Check browser console. Common causes:
- Missing `.env` file
- Supabase connection error
- Network issues

App should still load with fallback data if Supabase is down.

---

## File Structure

```
src/
├── lib/supabase.js          # Client with null-safe guards
├── stores/
│   ├── auth.js              # Auth state & login
│   ├── projectsStore.js     # Projects CRUD + realtime
│   ├── membersStore.js      # Member/role management
│   ├── contentBlocksStore.js # Content blocks
│   ├── realtimeStore.js     # Presence & collaboration
│   └── gallery.js           # Gallery viewport logic
├── components/
│   ├── AuthModal.vue        # Login UI (Google + email)
│   ├── InlineEdit.vue       # Editable text fields
│   ├── LinkChip.vue         # Auto link badges
│   ├── ProjectCard.vue      # Draggable card
│   └── ProjectDetail.vue    # Full detail view
└── i18n/locales/            # PT/EN translations

supabase/
├── schema.sql               # Database schema + RLS
├── migrate-manual.sql       # Data migration (use this!)
├── migrate.js               # Node.js migration (deprecated)
└── check-status.js          # Verify migration status
```

---

🤖 Generated with Qoder

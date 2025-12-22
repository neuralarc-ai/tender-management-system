# Supabase Database Setup Guide

## 📋 **Migration Files Overview**

All SQL migration files are located in `/supabase/migrations/` and must be executed in order:

1. **`001_initial_schema.sql`** - Core database schema
2. **`002_rls_policies.sql`** - Row Level Security policies
3. **`003_seed_data.sql`** - Demo users and sample data
4. **`004_functions.sql`** - Stored procedures and triggers

---

## 🚀 **Quick Setup Steps**

### **Step 1: Create Supabase Project**
```bash
# Go to https://supabase.com/dashboard
# Click "New Project"
# Project Name: axis-tender-management
# Database Password: [SAVE THIS SECURELY]
# Region: Choose closest to your users
```

### **Step 2: Install Dependencies**
```bash
npm install @supabase/supabase-js
npm install date-fns-tz  # Already installed
```

### **Step 3: Get Your Credentials**
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### **Step 4: Configure Environment**
```bash
# Create .env.local file in project root
cp env.example .env.local

# Edit .env.local and add your credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Step 5: Run Migrations**
Two options:

#### **Option A: Via Supabase Dashboard (Recommended)**
1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy content from `001_initial_schema.sql`
4. Click "Run"
5. Repeat for migrations 002, 003, and 004 **in order**

#### **Option B: Via Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Or run individually:
psql "postgresql://..." < supabase/migrations/001_initial_schema.sql
psql "postgresql://..." < supabase/migrations/002_rls_policies.sql
psql "postgresql://..." < supabase/migrations/003_seed_data.sql
psql "postgresql://..." < supabase/migrations/004_functions.sql
```

---

## 🗄️ **Database Schema**

### **Tables Created:**
1. **`users`** - User accounts (admin/client)
2. **`tenders`** - RFP/tender submissions
3. **`uploaded_files`** - Document attachments
4. **`ai_analysis`** - AI-generated analysis
5. **`proposals`** - Admin responses
6. **`notifications`** - Cross-panel notifications
7. **`user_settings`** - User preferences

### **Demo Users:**
- **Partner (Client)**: 
  - Email: `partner@dcs.com`
  - PIN: `1111`
  - Role: `client`
  
- **Admin**:
  - Email: `admin@neuralarc.com`
  - PIN: `2222`
  - Role: `admin`

---

## 🔐 **Security Features**

### **Row Level Security (RLS)**
All tables have RLS enabled with policies:
- **Clients**: Can only see their own tenders
- **Admins**: Can see all tenders
- **Isolation**: Complete data segregation

### **Validation:**
- Email format validation
- File size limits (10MB max)
- Score constraints (0-100)
- Status enums enforced
- Deadline must be in future

---

## 📊 **Indexes for Performance**

Indexes created on:
- `tenders.status`
- `tenders.created_by`
- `tenders.submission_deadline`
- `tenders.created_at`
- `notifications.target_roles` (GIN index)
- `notifications.created_at`
- All foreign keys

---

## 🔧 **Stored Functions**

1. **`get_tenders_with_details()`** - Returns denormalized tender data with all relations
2. **`create_notification()`** - Safe notification creation
3. **`mark_notification_read()`** - Update read status
4. **`get_unread_count()`** - Get notification badge count
5. **`clean_old_notifications()`** - Archive old notifications (30+ days)

---

## 🔄 **Auto-Triggers**

- **`updated_at` columns**: Auto-update on record modification
- **AI Analysis**: Auto-created when tender is inserted
- **Proposals**: Auto-created as draft when tender is inserted

---

## 🌍 **Timezone Support**

- **Admin**: IST (Asia/Kolkata) - UTC+5:30
- **Partner**: GST (Asia/Dubai) - UTC+4:00
- All timestamps stored in UTC, displayed in user's timezone

---

## 📝 **Next Steps**

After running migrations:

1. **Verify Tables**: Check Supabase Dashboard → Table Editor
2. **Test RLS**: Try querying data as different users
3. **Check Functions**: Go to Database → Functions
4. **Update App**: The app will automatically connect via `lib/supabase.ts`

---

## ⚠️ **Important Notes**

- ✅ All migrations are **idempotent** (safe to re-run)
- ✅ Foreign keys have **CASCADE deletes** for data integrity
- ✅ All sensitive fields are **properly indexed**
- ✅ **Service role key** must NEVER be exposed to frontend
- ✅ RLS policies ensure **clients can't see other clients' data**
- ✅ PIN hashes use **bcrypt** for security

---

## 🧪 **Testing Queries**

```sql
-- Check all tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check demo users
SELECT email, role, organization_name FROM users;

-- Check sample tenders
SELECT id, title, status, created_at FROM tenders;

-- Get unread notifications for admin
SELECT get_unread_count('admin');
```

---

## 📞 **Support**

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Verify environment variables
3. Ensure migrations ran in correct order
4. Check RLS policies are enabled


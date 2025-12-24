# Cursor Rules for Tender Management System

## 🚨 CRITICAL RULES - MUST FOLLOW

### Rule 1: NEVER Edit SQL Migration Files
**NEVER modify existing SQL migration files in `supabase/migrations/`**

#### Why:
- SQL migrations must remain immutable once created
- Editing breaks migration history
- Can cause database inconsistencies
- Impossible to track what changed

#### What to Do Instead:
✅ **ALWAYS create a NEW migration file** with incremented number

**Example:**
```
❌ BAD: Edit 009_ai_document_generation.sql
✅ GOOD: Create 010_document_approval_workflow.sql
```

#### Migration Naming Convention:
```
[number]_[descriptive_name].sql

Examples:
001_initial_schema.sql
002_rls_policies.sql
009_ai_document_generation.sql
010_document_approval_workflow.sql ← NEW
011_next_feature.sql ← NEW
```

#### If You Need to Change Something:
1. Create NEW migration file with next number
2. Use `ALTER TABLE` statements to modify existing tables
3. Use `CREATE OR REPLACE` for functions
4. Add clear comments explaining the change

#### Template for New Migration:
```sql
-- Migration [NUMBER]: [Feature Name]
-- [Description of what this migration does]
--
-- Features:
-- - [Feature 1]
-- - [Feature 2]
--
-- Created: [Date]
-- Run this AFTER [previous_migration].sql

-- Your SQL here
ALTER TABLE existing_table ADD COLUMN new_column TEXT;
-- etc.
```

---

### Rule 2: Database Best Practices

#### Always Include in New Migrations:
- ✅ `IF NOT EXISTS` checks for CREATE statements
- ✅ `IF EXISTS` checks for DROP statements  
- ✅ Proper indexes for performance
- ✅ RLS policies for security
- ✅ Comments explaining purpose
- ✅ Migration number and description header

#### Always Use:
- ✅ `UUID` for primary keys
- ✅ `TIMESTAMPTZ` for timestamps (not TIMESTAMP)
- ✅ `CHECK` constraints for enums
- ✅ Foreign key `REFERENCES` with `ON DELETE CASCADE`
- ✅ Proper indexes on foreign keys and query columns

---

### Rule 3: Migration Sequencing

#### File Numbering:
```
Current migrations:
001 → Initial schema
002 → RLS policies  
003 → Seed data
004 → Functions
005 → Storage setup
006 → Fix RLS recursion
007 → Clean setup
008 → Fix created_by, tender communication
009 → AI document generation
010 → Document approval workflow ← NEW
011 → [Next feature] ← Use this next
```

#### Before Creating New Migration:
1. List existing migrations
2. Find highest number
3. Increment by 1
4. Use descriptive name

---

### Rule 4: Migration Workflow

#### When User Requests Database Changes:

**Step 1:** Check if feature needs new migration
**Step 2:** List existing migrations to find next number
**Step 3:** Create NEW file (don't edit existing)
**Step 4:** Write migration with proper structure
**Step 5:** Test SQL syntax
**Step 6:** Document what it does

**Step 7:** Tell user:
```
Created: supabase/migrations/[number]_[name].sql
Run this in Supabase SQL Editor after running previous migrations
```

---

### Rule 5: Never Edit These Files

**Absolutely NEVER modify:**
- ✅ Any file in `supabase/migrations/*.sql` (once created)
- ✅ `.env.local` (use scripts or instructions instead)
- ✅ `.git` config files
- ✅ `package-lock.json` directly (use npm commands)

**Instead:**
- Create new migration files
- Create helper scripts for env setup
- Use npm install for packages

---

## 📋 Quick Reference

### Creating New Migration:

```bash
# 1. Check last number
ls supabase/migrations/ | sort | tail -1
# Output: 010_document_approval_workflow.sql

# 2. Create next number
File: 011_your_feature_name.sql

# 3. Use template:
-- Migration 011: [Feature Name]
-- [Description]
-- Created: [Date]
-- Run AFTER 010_document_approval_workflow.sql

-- Your SQL
ALTER TABLE ...
```

---

### Running Migrations:

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Click "New Query"
3. Copy ENTIRE migration file
4. Click "Run"
5. Verify success

**Never:**
- Run partial migrations
- Skip migration numbers
- Run out of order
- Edit and re-run

---

## ✅ Summary

**GOLDEN RULE:** 
**SQL migrations are APPEND-ONLY. Never edit, always create new files.**

**Why:** 
Keeps database history clean, trackable, and prevents corruption.

**Remember:**
- 🟢 Create new migration → Good
- 🔴 Edit existing migration → Bad
- 🟢 Increment numbers → Good
- 🔴 Skip numbers → Bad


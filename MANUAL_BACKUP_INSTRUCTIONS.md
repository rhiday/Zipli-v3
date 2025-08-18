# 🗄️ Manual Database Backup Instructions

## Important: Create Backup Before Deployment!

Since local database tools aren't available, please manually create a backup through Supabase Dashboard:

### **Option 1: Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard/project/vqtfcdnrgotgrnwwuryo
2. Navigate to "Settings" → "Database" 
3. Scroll down to "Database Backups"
4. Click "Create backup" or download existing backup
5. Save the backup file locally with timestamp: `zipli-backup-$(date).sql`

### **Option 2: SQL Export via Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Run this query to export essential data:

```sql
-- Export all profiles
SELECT * FROM profiles;

-- Export all food_items  
SELECT * FROM food_items;

-- Export all donations
SELECT * FROM donations;

-- Export all requests
SELECT * FROM requests;

-- Check current counts
SELECT 
  'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'food_items', COUNT(*) FROM food_items  
UNION ALL
SELECT 'donations', COUNT(*) FROM donations
UNION ALL  
SELECT 'requests', COUNT(*) FROM requests;
```

3. Copy results and save to `data-backup-$(date).txt`

### **Option 3: If You Have PostgreSQL Installed**
```bash
# Install if needed: brew install postgresql
pg_dump "postgresql://postgres:YOUR_PASSWORD@db.vqtfcdnrgotgrnwwuryo.supabase.co:5432/postgres" > backup-$(date +%Y%m%d-%H%M).sql
```

## ⚠️ **IMPORTANT: Don't Proceed Without Backup**

The current database contains:
- ✅ **6 test user accounts** with authentication data
- ✅ **10+ food items** in the catalog  
- ✅ **Multiple active donations** and requests
- ✅ **Complete schema** with RLS policies

**Next Step**: Once backup is confirmed, return here and we'll continue with Step 2!
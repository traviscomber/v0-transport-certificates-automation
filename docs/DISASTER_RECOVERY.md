# Disaster Recovery Guide

**Last Updated:** 2026-05-05  
**Version:** 1.0  
**Status:** Production

---

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Recovery Procedures](#recovery-procedures)
4. [Common Scenarios](#common-scenarios)
5. [Testing & Verification](#testing--verification)
6. [Runbooks](#runbooks)

---

## Overview

This guide provides step-by-step procedures for disaster recovery of the Anomaly Dashboard system. The system uses Supabase for data persistence with automated daily backups and point-in-time recovery (PITR).

### Recovery Time Objectives (RTO)

- **Full System Restore:** 30 minutes
- **Partial Data Recovery:** 15 minutes
- **Database-Only Recovery:** 10 minutes

### Recovery Point Objectives (RPO)

- **Maximum Data Loss:** 24 hours
- **Backup Frequency:** Daily at 02:00 UTC
- **Retention Period:** 30 days

---

## Backup Strategy

### Backup Configuration

**Location:** Supabase Cloud Infrastructure  
**Frequency:** Daily (02:00 UTC)  
**Retention:** 30 days  
**Type:** Full database snapshot + Point-in-time recovery  
**Encryption:** AES-256 (at rest)  

### Backup Components

1. **Database Backup**
   - Complete PostgreSQL database
   - All schemas, tables, indexes, functions
   - RLS policies and security configurations

2. **Point-in-Time Recovery (PITR)**
   - Enables recovery to any point within 7 days
   - Granular recovery (specific tables, rows)
   - No version switching required

3. **Application Code**
   - Stored in GitHub repository
   - Automatically deployable from any commit
   - Includes database migrations

4. **Configuration**
   - Environment variables in Vercel
   - Stored separately from code
   - Restored manually

### Backup Verification

Check backup status at any time:

```bash
curl https://your-app.vercel.app/api/backups/verify
```

Expected response (healthy):

```json
{
  "status": "healthy",
  "lastBackup": "2026-05-04T02:00:00Z",
  "nextBackup": "2026-05-05T02:00:00Z",
  "daysRetained": 30,
  "message": "Backups are running normally",
  "timestamp": "2026-05-05T10:30:00Z"
}
```

---

## Recovery Procedures

### Option 1: Full Database Restore (Complete Data Loss)

**Use When:** Database corruption, major data loss, ransomware attack  
**Time Required:** 10 minutes  
**Steps:**

1. **Login to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Navigate to Database Backups**
   - Select your project
   - Go to Settings → Database → Backups

3. **Select Backup to Restore**
   - Click "Restore" on desired backup date
   - Confirm restoration timestamp

4. **Verify Restoration**
   ```bash
   # Test database connection
   pnpm run test:db
   
   # Verify data integrity
   curl https://your-app.vercel.app/api/backups/verify
   ```

5. **Deploy Updated Configuration**
   ```bash
   git push origin main
   vercel deploy --prod
   ```

**Estimated Time:** 10 minutes  
**Data Loss:** Up to 24 hours (last backup)

---

### Option 2: Point-in-Time Recovery (PITR)

**Use When:** Need to recover to specific moment within 7 days  
**Time Required:** 15 minutes  
**Steps:**

1. **Access Supabase Dashboard**
   - Settings → Database → Backups → Point-in-Time Recovery

2. **Select Recovery Timestamp**
   - Choose exact time to recover to
   - Review data preview if available

3. **Confirm Recovery**
   - Click "Restore to this point"
   - Confirm operation

4. **Verify and Deploy**
   ```bash
   # Test connection
   pnpm run test:db
   
   # Check data at recovery point
   curl https://your-app.vercel.app/api/backups/verify
   
   # Redeploy application
   vercel deploy --prod
   ```

**Estimated Time:** 15 minutes  
**Data Loss:** None (recover to exact moment)

---

### Option 3: Partial Recovery (Specific Tables)

**Use When:** Only certain tables need recovery  
**Time Required:** 20 minutes  
**Steps:**

1. **Create Temporary Database**
   - In Supabase, create new database from backup
   - Name it: `recovery-temp-YYYY-MM-DD`

2. **Export Table Data**
   ```bash
   # Connect to temp database
   psql "postgresql://user:password@host/recovery-temp"
   
   # Export specific table
   \copy anomalies TO '/tmp/anomalies.csv' WITH (FORMAT csv, HEADER)
   ```

3. **Import to Production**
   ```bash
   # Import recovered data
   psql "postgresql://user:password@host/production" < recovery.sql
   ```

4. **Cleanup**
   - Delete temporary database
   - Verify imports successful

**Estimated Time:** 20 minutes

---

### Option 4: Application-Only Recovery (Keep Data)

**Use When:** Code is corrupted but data is fine  
**Time Required:** 5 minutes  
**Steps:**

1. **Identify Last Good Commit**
   ```bash
   git log --oneline | head -20
   # Find last stable commit
   ```

2. **Rollback to Previous Version**
   ```bash
   vercel rollback
   # Or deploy specific commit:
   git checkout <commit-hash>
   vercel deploy --prod
   ```

3. **Verify Application**
   - Check website loads
   - Test API endpoints
   - Verify data access

**Estimated Time:** 5 minutes  
**Data Loss:** None (data untouched)

---

## Common Scenarios

### Scenario 1: Complete Database Failure

**Problem:** Database unreachable, corrupt, or data loss  
**Solution:** Use Option 1 (Full Database Restore)  
**Timeline:**

- Detect issue: 5 minutes
- Initiate restore: 2 minutes
- Restore completes: 5 minutes
- Verify & deploy: 3 minutes
- **Total: ~15 minutes**

**Recovery:** Latest daily backup (up to 24 hours ago)

### Scenario 2: Accidental Data Deletion

**Problem:** User accidentally deleted important records  
**Solution:** Use Option 2 (Point-in-Time Recovery)  
**Timeline:**

- Identify deletion time: 5 minutes
- Initiate PITR: 2 minutes
- Recovery executes: 8 minutes
- Verify & deploy: 3 minutes
- **Total: ~18 minutes**

**Recovery:** Exact point before deletion (within 7 days)

### Scenario 3: Application Bug Corrupts Data

**Problem:** Bug caused incorrect updates  
**Solution:** Use Option 2 (PITR) + Option 4 (code rollback)  
**Timeline:**

- Identify bug: 5 minutes
- Initiate PITR: 2 minutes
- Recovery executes: 8 minutes
- Rollback code: 2 minutes
- Verify: 3 minutes
- **Total: ~20 minutes**

**Recovery:** Before bug was deployed (full data integrity)

### Scenario 4: Ransomware or Security Breach

**Problem:** System compromised, data encrypted  
**Solution:** Full restore + security audit  
**Timeline:**

- Detect breach: 10 minutes
- Isolate system: 5 minutes
- Initiate restore: 2 minutes
- Restore completes: 5 minutes
- Security audit: 30+ minutes
- Redeploy: 5 minutes
- **Total: ~1 hour (+ audit)**

**Recovery:** Last known good backup (24 hours ago)

### Scenario 5: Failed Deployment

**Problem:** New code broke the application  
**Solution:** Use Option 4 (Application rollback)  
**Timeline:**

- Detect failure: 2 minutes
- Initiate rollback: 1 minute
- Rollback completes: 2 minutes
- Verify: 1 minute
- **Total: ~6 minutes**

**Recovery:** Immediate (previous stable version)

---

## Testing & Verification

### Weekly Backup Verification

Run this every Monday to ensure backups are working:

```bash
# Check backup API
curl https://your-app.vercel.app/api/backups/verify

# Verify response is "healthy"
# If not, check Supabase dashboard immediately
```

### Monthly Restore Test

First Monday of each month, test restore procedure:

1. **Create test restore**
   - Select 7-day-old backup
   - Create as: `test-restore-$(date +%Y%m%d)`

2. **Verify data integrity**
   - Connect to restored database
   - Run data validation queries
   - Compare row counts, checksums

3. **Document results**
   - Record restore time
   - Note any issues
   - Update this guide if needed

4. **Cleanup**
   - Delete test restore database

### Annual Disaster Recovery Drill

Run full recovery simulation annually:

1. **Schedule downtime** (maintenance window)
2. **Simulate data loss scenario**
3. **Execute full restore procedure**
4. **Verify application functionality**
5. **Document findings and issues**
6. **Update procedures based on learnings**

---

## Runbooks

### Runbook 1: Database is Down

**Symptom:** Application shows "Database connection error"  
**Duration:** 0-10 minutes  
**Recovery:** Automatic (Supabase failover) or manual restore

**Steps:**

```
1. Check Supabase Status
   └─ https://status.supabase.com

2. If Down (Red):
   └─ Wait for Supabase to recover
   └─ ETA: 15-60 minutes
   └─ Monitor status page

3. If Not Down (Green):
   └─ Check application logs
   └─ Verify credentials in Vercel
   └─ Redeploy: vercel deploy --prod

4. If Still Down After 30 min:
   └─ Contact Supabase Support
   └─ Prepare for manual restore (Option 1)
```

---

### Runbook 2: Data Corruption Detected

**Symptom:** Invalid data appears in application  
**Duration:** 5-30 minutes  
**Recovery:** Point-in-Time Recovery (Option 2)

**Steps:**

```
1. Identify Corruption
   └─ Determine: Which tables affected?
   └─ Determine: When did it start?
   └─ Determine: How far back is it?

2. Stop New Operations
   └─ If critical: Put app in read-only mode
   └─ Alert users about data issue

3. Initiate PITR
   └─ Go to Supabase → Settings → Database → Backups
   └─ Select point BEFORE corruption
   └─ Click "Restore to this point"

4. Verify Recovery
   └─ Query affected tables
   └─ Check data is correct
   └─ Verify application works

5. Resume Operations
   └─ Take app out of read-only mode
   └─ Notify users of resolution
   └─ Document incident
```

---

### Runbook 3: Accidental Large Deletion

**Symptom:** Users report missing records  
**Duration:** 5-20 minutes  
**Recovery:** PITR to point before deletion

**Steps:**

```
1. Verify Deletion
   └─ Check when deletion occurred
   └─ Confirm data loss vs. data corruption
   └─ Note exact time of incident

2. Calculate Recovery Point
   └─ Go back 1-5 minutes before deletion
   └─ Choose specific timestamp

3. Execute PITR
   └─ Supabase Dashboard → Backups → PITR
   └─ Enter recovery timestamp
   └─ Confirm operation

4. Monitor Recovery
   └─ Wait for PITR to complete
   └─ Typically 5-10 minutes

5. Verify Data
   └─ Query recovered records
   └─ Spot-check data accuracy
   └─ Verify counts match expectations

6. Resume
   └─ Notify users of recovery
   └─ Document what was recovered
```

---

### Runbook 4: Application Won't Start

**Symptom:** Deployment failed, app won't start  
**Duration:** 2-10 minutes  
**Recovery:** Code rollback

**Steps:**

```
1. Check Error
   └─ Vercel Dashboard → Logs
   └─ Identify error message
   └─ Check if database-related or code-related

2. If Code Issue:
   └─ vercel rollback
   └─ Selects previous stable deployment
   └─ Takes ~2 minutes

3. If Database Issue:
   └─ Check connection string in Vercel
   └─ Verify Supabase is up
   └─ Test with: curl /api/health

4. Verify Application
   └─ Test main endpoints
   └─ Check API responses
   └─ Verify no errors in logs

5. Post-Incident
   └─ Review what broke
   └─ Update testing procedures
   └─ Deploy fix when ready
```

---

### Runbook 5: Performance Degradation

**Symptom:** Slow page loads, slow API responses  
**Duration:** 10-30 minutes  
**Recovery:** Database optimization or scale-up

**Steps:**

```
1. Diagnose Issue
   └─ Check Sentry performance metrics
   └─ Identify slow endpoints
   └─ Check database query times

2. Quick Fixes
   └─ Restart application: vercel deploy --prod
   └─ Clear cache if applicable
   └─ Check API rate limits

3. If Database Slow
   └─ Check Supabase connection count
   └─ Review slow query log
   └─ Add missing indexes

4. If Code Slow
   └─ Check for memory leaks
   └─ Profile with Sentry
   └─ Optimize queries

5. Scale If Needed
   └─ Upgrade Supabase compute
   └─ Upgrade Vercel plan
   └─ Add caching layer
```

---

## Contact & Escalation

### On-Call Support

- **Level 1:** Check status page and documentation
- **Level 2:** Contact Supabase support (24/7)
- **Level 3:** Contact database administrator
- **Emergency:** Contact system owner

### Supabase Support

- **URL:** https://supabase.com/support
- **Email:** support@supabase.com
- **Status:** https://status.supabase.com

### Important Contacts

- **System Owner:** [Name]
- **Database Admin:** [Name]
- **DevOps Lead:** [Name]

---

## Appendix: Quick Reference

### API Endpoints

```bash
# Check backup status
GET /api/backups/verify

# Health check
GET /api/health

# System status
GET /api/status
```

### Useful Commands

```bash
# Check database connection
pnpm run test:db

# View recent deployments
vercel list

# Rollback to previous version
vercel rollback

# Deploy specific commit
vercel deploy --prod

# Check logs
vercel logs

# Verify backups
curl https://your-app/api/backups/verify
```

### Database Credentials

- **Host:** Supabase dashboard
- **Username:** postgres
- **Database:** postgres
- **Connection String:** `$SUPABASE_URL`

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-05 | v0 | Initial version |

---

**Last Updated:** 2026-05-05  
**Next Review:** 2026-06-05  
**Status:** Active

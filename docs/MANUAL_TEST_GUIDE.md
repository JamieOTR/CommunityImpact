# Manual Testing Quick Reference Guide

**Purpose**: Execute manual validation tests for features that cannot be automated
**Time Required**: ~2-3 hours
**Prerequisites**: 4 test accounts, seed data loaded

---

## Test Account Setup (15 minutes)

### Step 1: Create Test Accounts

Create these accounts via the sign-up flow:

1. **super-admin@test.com** (password: test123)
   - Sign up normally
   - Manually set `role = 'super_admin'` in database:
     ```sql
     UPDATE users SET role = 'super_admin', is_admin = true
     WHERE email = 'super-admin@test.com';
     ```

2. **admin-a@test.com** (password: test123)
   - Sign up normally
   - Will be set as owner of Community A via seed data

3. **member-a@test.com** (password: test123)
   - Sign up normally
   - Will join Community A manually

4. **admin-b@test.com** (password: test123)
   - Sign up normally
   - Will be set as owner of Community B via seed data

### Step 2: Load Seed Data

1. Log in as `super-admin@test.com`
2. Navigate to `/admin/seed-data`
3. Click "Seed Demo Data" button
4. Verify success message shows:
   - 2 Communities
   - 4 Programs
   - 20 Milestones
   - 20 Achievements
   - 20 Rewards

### Step 3: Assign Communities

Manually assign communities if needed:

```sql
-- Get community IDs
SELECT community_id, name FROM communities WHERE name IN ('Green Valley Initiative', 'Tech for Good Alliance');

-- Assign admin-a to Community A
UPDATE users SET community_id = '<green_valley_id>', is_admin = true
WHERE email = 'admin-a@test.com';

-- Assign member-a to Community A
UPDATE users SET community_id = '<green_valley_id>'
WHERE email = 'member-a@test.com';

-- Assign admin-b to Community B
UPDATE users SET community_id = '<tech_for_good_id>', is_admin = true
WHERE email = 'admin-b@test.com';
```

---

## Test 1: Notification Flow (20 minutes)

**Accounts**: member-a@test.com, admin-a@test.com

### Part A: Submission Notification

1. Open two browser windows side-by-side
2. **Window 1**: Log in as `member-a@test.com`
3. **Window 2**: Log in as `admin-a@test.com`, navigate to `/admin/submissions`

**Actions**:
1. **Window 1**: Navigate to `/milestones`
2. **Window 1**: Click on any available milestone
3. **Window 1**: Submit achievement with evidence URL
4. **Window 1**: Check notification bell → should show "Achievement submitted" (✅)
5. **Window 2**: Verify submission appears in pending list **without refresh** (✅)
   - Look for live indicator showing "Connected"

### Part B: Approval Notification

**Actions**:
1. **Window 2** (admin): Click "Approve" on the pending submission
2. **Window 1** (member): Check notification bell → should show:
   - "Achievement approved" notification (✅)
   - Unread badge count increased (✅)
3. **Window 1**: Click notification bell → dropdown opens (✅)
4. **Window 1**: Verify notification contains:
   - Title: "Achievement Approved"
   - Message mentions milestone name
   - "View" action link
   - Unread indicator (blue dot)
5. **Window 1**: Click "Mark as read" (checkmark icon)
6. **Window 1**: Verify unread badge decremented (✅)

### Part C: Reward Notification

**Actions**:
1. **Window 2** (admin): Navigate to `/admin/rewards`
2. **Window 2**: Find the pending reward for the approved achievement
3. **Window 2**: Click "Distribute" button
4. **Window 1** (member): Check notification bell → should show:
   - "Reward distributed" or "Tokens awarded" notification (✅)
5. **Window 1**: Click notification → verify details (✅)

### Part D: Rejection Notification

**Actions**:
1. **Window 1** (member): Submit another achievement
2. **Window 2** (admin): Click "Reject" on the new submission
3. **Window 2**: Fill rejection modal:
   - Rejection Reason: "Insufficient evidence - please provide clearer photos"
   - Admin Notes: "Photo was too blurry to verify"
4. **Window 2**: Click "Reject Submission"
5. **Window 1** (member): Check notification bell → should show:
   - "Achievement rejected" notification (✅)
   - Notification should display the rejection reason (✅)
   - Priority indicator (red border if urgent)

**PASS CRITERIA**:
- ✅ All 4 notification types appear
- ✅ Real-time delivery (no refresh needed)
- ✅ Unread count accurate
- ✅ Mark as read works
- ✅ Rejection reason displayed to user

---

## Test 2: Community Data Isolation (15 minutes)

**Accounts**: admin-a@test.com, admin-b@test.com

### Part A: Admin Dashboard Scoping

1. **Browser 1**: Log in as `admin-a@test.com`
2. Navigate to `/admin` (Overview)
3. Note the displayed metrics (member count, programs, etc.)
4. Navigate to `/admin/submissions`
5. Count number of pending submissions
6. Navigate to `/admin/rewards`
7. Count number of pending rewards

8. **Browser 2**: Log in as `admin-b@test.com`
9. Navigate to `/admin` (Overview)
10. **VERIFY**: Different metrics than admin-a (✅)
11. Navigate to `/admin/submissions`
12. **VERIFY**: Different submissions than admin-a (✅)
13. Navigate to `/admin/rewards`
14. **VERIFY**: Different rewards than admin-a (✅)

### Part B: Direct Database Query (DevTools)

1. **Browser 1** (admin-a): Open DevTools → Console
2. Paste and execute:
   ```javascript
   // Try to query Community B data
   const { data, error } = await supabase
     .from('achievements')
     .select('*');
   console.log('Achievements:', data?.length, data);
   ```
3. **VERIFY**: Only Community A achievements returned (✅)
4. Check Community B achievement ID from Browser 2
5. Try to update it from Browser 1:
   ```javascript
   const { error } = await supabase
     .from('achievements')
     .update({ verification_status: 'verified' })
     .eq('achievement_id', '<community_b_achievement_id>');
   console.log('Error:', error);
   ```
6. **VERIFY**: Update fails or affects 0 rows (RLS blocks) (✅)

### Part C: Super Admin Access

1. **Browser 3**: Log in as `super-admin@test.com`
2. Navigate to `/admin`
3. **VERIFY**: Can see data from all communities (✅)
4. Navigate to `/admin/submissions`
5. **VERIFY**: Can see submissions from both Community A and B (✅)
6. Approve an achievement from Community A
7. Approve an achievement from Community B
8. **VERIFY**: Both approvals succeed (✅)

**PASS CRITERIA**:
- ✅ Community A admin cannot see Community B data
- ✅ Community B admin cannot see Community A data
- ✅ RLS blocks cross-community updates
- ✅ Super admin can access all communities

---

## Test 3: Real-Time Updates (15 minutes)

**Accounts**: member-a@test.com, admin-a@test.com

### Part A: Dashboard Metrics

1. **Browser 1**: Log in as `member-a@test.com`, navigate to `/dashboard`
2. Note current token balance and milestones completed
3. **Browser 2**: Log in as `admin-a@test.com`, navigate to `/admin/rewards`
4. Distribute a pending reward for member-a
5. **Browser 1**: Watch dashboard **without refreshing**
6. **VERIFY**: Token balance increases within 1-2 seconds (✅)
7. **VERIFY**: Live indicator shows "Connected" (✅)

### Part B: Admin Submissions List

1. **Browser 1** (member-a): Navigate to `/milestones`
2. **Browser 2** (admin-a): Open `/admin/submissions` in split view
3. **Browser 1**: Submit a new achievement
4. **Browser 2**: Watch submissions list **without refreshing**
5. **VERIFY**: New submission appears within 1-2 seconds (✅)
6. **VERIFY**: Live indicator shows "Connected" (✅)

### Part C: Connection Recovery

1. **Browser 1** (member-a): Open DevTools → Network tab
2. Throttle connection to "Slow 3G"
3. Wait 10 seconds
4. **VERIFY**: Live indicator shows "Reconnecting..." or similar (✅)
5. Reset connection to "No throttling"
6. **VERIFY**: Live indicator returns to "Connected" (✅)
7. Submit achievement or have admin approve one
8. **VERIFY**: Updates still work after reconnection (✅)

**PASS CRITERIA**:
- ✅ Dashboard metrics update in real-time
- ✅ Submissions list updates in real-time
- ✅ Live indicator shows connection status
- ✅ Connection recovery works after network issues

---

## Test 4: Audit Trail Verification (10 minutes)

**Accounts**: admin-a@test.com

### Database Queries

1. Log in as `admin-a@test.com`
2. Approve an achievement
3. Reject an achievement
4. Distribute a reward
5. Open database query tool (Supabase Dashboard or psql)
6. Run audit log query:

```sql
SELECT
  audit_id,
  actor_user_id,
  action,
  entity_type,
  entity_id,
  before_json,
  after_json,
  created_at
FROM audit_logs
WHERE action IN ('achievement_approved', 'achievement_rejected', 'reward_status_updated')
ORDER BY created_at DESC
LIMIT 10;
```

7. **VERIFY**: Each action has corresponding audit log entry (✅)
8. **VERIFY**: `actor_user_id` matches admin user ID (✅)
9. **VERIFY**: `before_json` and `after_json` show state changes (✅)
10. **VERIFY**: Timestamps are accurate (✅)

### Check Specific Fields

```sql
-- Check achievement verification tracking
SELECT
  achievement_id,
  verification_status,
  verified_by,
  verified_at,
  rejection_reason,
  admin_notes
FROM achievements
WHERE verified_at IS NOT NULL
ORDER BY verified_at DESC
LIMIT 5;
```

**VERIFY**:
- ✅ `verified_by` is populated with admin user_id
- ✅ `verified_at` has timestamp
- ✅ Rejected achievements have `rejection_reason`

```sql
-- Check reward approval tracking
SELECT
  reward_id,
  status,
  approved_by,
  approved_at,
  paid_at,
  tx_hash
FROM rewards
WHERE approved_at IS NOT NULL
ORDER BY approved_at DESC
LIMIT 5;
```

**VERIFY**:
- ✅ `approved_by` is populated with admin user_id
- ✅ `approved_at` has timestamp
- ✅ Distributed rewards have `paid_at` and `tx_hash`

**PASS CRITERIA**:
- ✅ All critical actions logged in audit_logs
- ✅ Actor tracking works (verified_by, approved_by)
- ✅ Timestamps accurate
- ✅ State changes captured in JSON fields

---

## Test 5: Seed Data Integrity (10 minutes)

**Account**: super-admin@test.com

### Verification Steps

1. Log in as `super-admin@test.com`
2. Navigate to `/admin/seed-data`
3. Click "Seed Demo Data" button
4. **VERIFY**: Success message displays (✅)
5. **VERIFY**: Counts shown:
   - 2 Communities
   - 4 Programs
   - 20 Milestones
   - 20 Achievements
   - 20 Rewards

### Database Verification

```sql
-- Check communities
SELECT community_id, name, owner_user_id, status, referral_code
FROM communities
ORDER BY created_at DESC
LIMIT 2;
```

**VERIFY**:
- ✅ 2 communities exist with unique referral codes

```sql
-- Check programs
SELECT p.program_id, p.name, p.community_id, c.name as community_name
FROM programs p
JOIN communities c ON c.community_id = p.community_id
ORDER BY p.created_at DESC
LIMIT 4;
```

**VERIFY**:
- ✅ 4 programs exist (2 per community)
- ✅ Programs linked to correct communities

```sql
-- Check milestones
SELECT m.milestone_id, m.title, m.reward_amount, p.name as program_name
FROM milestones m
JOIN programs p ON p.program_id = m.program_id
ORDER BY m.created_at DESC
LIMIT 20;
```

**VERIFY**:
- ✅ 20 milestones exist (5 per program)
- ✅ Milestones have reward amounts

```sql
-- Check achievements with mixed statuses
SELECT verification_status, COUNT(*) as count
FROM achievements
GROUP BY verification_status;
```

**VERIFY**:
- ✅ Mix of pending, verified, rejected statuses

```sql
-- Check rewards with mixed statuses
SELECT status, COUNT(*) as count
FROM rewards
GROUP BY status;
```

**VERIFY**:
- ✅ Mix of pending, confirmed, failed statuses

**PASS CRITERIA**:
- ✅ All entities created with correct counts
- ✅ Relationships properly linked
- ✅ Mixed statuses for realistic demo data
- ✅ Can run multiple times without errors

---

## Test Results Template

Use this template to document results:

```markdown
## Test Execution Results

**Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]

### Test 1: Notification Flow
- Part A: ✅ PASS / ❌ FAIL
  - Notes: [Any issues or observations]
- Part B: ✅ PASS / ❌ FAIL
- Part C: ✅ PASS / ❌ FAIL
- Part D: ✅ PASS / ❌ FAIL

### Test 2: Community Data Isolation
- Part A: ✅ PASS / ❌ FAIL
- Part B: ✅ PASS / ❌ FAIL
- Part C: ✅ PASS / ❌ FAIL

### Test 3: Real-Time Updates
- Part A: ✅ PASS / ❌ FAIL
- Part B: ✅ PASS / ❌ FAIL
- Part C: ✅ PASS / ❌ FAIL

### Test 4: Audit Trail Verification
- ✅ PASS / ❌ FAIL

### Test 5: Seed Data Integrity
- ✅ PASS / ❌ FAIL

### Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

### Screenshots
- [Attach relevant screenshots]

### Overall Status
- ✅ READY FOR DEMO
- ⚠️ READY WITH KNOWN ISSUES
- ❌ NOT READY (CRITICAL ISSUES)
```

---

## Troubleshooting

### Issue: Notifications not appearing

**Check**:
1. Verify user is authenticated
2. Check browser console for errors
3. Verify real-time subscription connected (look for "Connected" indicator)
4. Check database notifications table:
   ```sql
   SELECT * FROM notifications
   WHERE user_id = '<user_id>'
   ORDER BY created_at DESC;
   ```

### Issue: Real-time updates not working

**Check**:
1. Verify Supabase Realtime is enabled on tables
2. Check browser DevTools → Network → WebSocket connection
3. Look for errors in console
4. Try refreshing page to re-establish connection

### Issue: RLS blocking legitimate access

**Check**:
1. Verify user's community_id is set correctly
2. Verify user's is_admin flag if needed
3. Check helper functions:
   ```sql
   SELECT get_user_community_id();
   SELECT is_community_admin();
   SELECT is_super_admin();
   ```

### Issue: Seed data fails

**Check**:
1. Verify user has is_admin = true
2. Check for unique constraint violations (run multiple times)
3. Check browser console for error details
4. Verify all required tables exist

---

## Next Steps After Testing

1. Document all test results in `/docs/INTEGRATION_TEST_RESULTS.md`
2. File bug reports for any failures
3. Create fix tasks (frontend only, no DB changes)
4. Re-test after fixes
5. Update demo runbook if needed
6. Practice demo flow
7. Deploy to staging environment
8. Final demo rehearsal

---

**Time Estimate**: 2-3 hours total
**Critical Path**: Tests 1, 2, 3 must pass before demo
**Nice to Have**: Tests 4, 5 for full validation

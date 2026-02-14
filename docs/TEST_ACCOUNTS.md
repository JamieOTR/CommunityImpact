# Test Accounts & Demo Runbook

## Test Account Credentials

All test accounts have been created and are ready for use.

### 1. Super Admin
- **Email:** `superadmin@test.com`
- **Password:** `SuperAdmin2024!`
- **Role:** Super Admin
- **Community:** None (Platform-wide access)
- **User ID:** `2bf20256-321e-44d9-b243-39c2604d6575`
- **Capabilities:**
  - Access to all communities and data
  - Full admin dashboard access
  - Can manage all programs, milestones, and submissions
  - Can verify achievements across all communities

---

### 2. Community Admin A
- **Email:** `adminA@test.com`
- **Password:** `AdminA2024!`
- **Role:** Community Admin
- **Community:** Community A - Test
- **Community ID:** `976cd64f-3abc-4d1c-981c-5acd06c463ab`
- **Referral Code:** `BNW944`
- **User ID:** `c517db4e-8aec-4093-8b40-33713a4bf1c7`
- **Capabilities:**
  - Admin dashboard access for Community A only
  - Can manage programs and milestones in Community A
  - Can verify achievements for Community A members
  - Cannot see Community B data

---

### 3. Community Admin B
- **Email:** `adminB@test.com`
- **Password:** `AdminB2024!`
- **Role:** Community Admin
- **Community:** Community B - Test
- **Community ID:** `c9ec2331-b334-43e5-8833-dcced8a2a9d5`
- **Referral Code:** `HF3IOV`
- **User ID:** `e13d25dc-015e-408e-b4f4-c0efb197293b`
- **Capabilities:**
  - Admin dashboard access for Community B only
  - Can manage programs and milestones in Community B
  - Can verify achievements for Community B members
  - Cannot see Community A data

---

### 4. Member A
- **Email:** `memberA@test.com`
- **Password:** `MemberA2024!`
- **Role:** Member
- **Community:** Community A - Test
- **Community ID:** `976cd64f-3abc-4d1c-981c-5acd06c463ab`
- **User ID:** `f10c84cf-fabc-4a63-98f9-fcdb5b540f4e`
- **Capabilities:**
  - Standard member access
  - Can view and complete milestones in Community A
  - Can submit achievements for verification
  - Cannot access admin features

---

## Communities Created

### Community A - Test
- **ID:** `976cd64f-3abc-4d1c-981c-5acd06c463ab`
- **Name:** Community A - Test
- **Referral Code:** `BNW944`
- **Admin:** Admin Community A (adminA@test.com)
- **Members:** Member A (memberA@test.com)

### Community B - Test
- **ID:** `c9ec2331-b334-43e5-8833-dcced8a2a9d5`
- **Name:** Community B - Test
- **Referral Code:** `HF3IOV`
- **Admin:** Admin Community B (adminB@test.com)
- **Members:** None yet

---

## Demo Execution Plan

### Step A: Account Verification
✅ **COMPLETED** - All 4 test accounts created successfully

### Step B: Seed Data Population

1. Log in as **Super Admin** (`superadmin@test.com`)
2. Navigate to `/admin/seed-data`
3. Click "Generate Sample Data" button
4. Wait for the seeding process to complete
5. Verify that programs and milestones are created for both communities

### Step C: Manual Test Execution

Execute the following tests in order:

#### Test 1: Community Data Isolation
**Objective:** Verify that community admins can only see their own community's data

**Steps:**
1. Log in as **Admin Community A** (`adminA@test.com`)
2. Navigate to Admin Dashboard → Programs
3. **Expected:** Only see programs for Community A
4. Navigate to Admin Dashboard → Submissions
5. **Expected:** Only see submissions from Community A members
6. Log out

7. Log in as **Admin Community B** (`adminB@test.com`)
8. Navigate to Admin Dashboard → Programs
9. **Expected:** Only see programs for Community B
10. **Expected:** Should NOT see any Community A data
11. Log out

**Evidence to Capture:**
- Screenshot of Admin A's program list
- Screenshot of Admin B's program list
- Run query to verify RLS:
```sql
-- As Admin A, should only see Community A data
SELECT p.program_id, p.name, c.name as community_name
FROM programs p
JOIN communities c ON p.community_id = c.community_id
WHERE p.community_id = '976cd64f-3abc-4d1c-981c-5acd06c463ab';

-- As Admin B, should only see Community B data
SELECT p.program_id, p.name, c.name as community_name
FROM programs p
JOIN communities c ON p.community_id = c.community_id
WHERE p.community_id = 'c9ec2331-b334-43e5-8833-dcced8a2a9d5';
```

---

#### Test 2: Admin Scope Verification
**Objective:** Verify that super admin sees all data, community admins see only their data

**Steps:**
1. Log in as **Super Admin** (`superadmin@test.com`)
2. Navigate to Admin Dashboard → Programs
3. **Expected:** See programs from BOTH Community A and Community B
4. Navigate to Admin Dashboard → Submissions
5. **Expected:** See submissions from all communities
6. Verify community switcher or filter shows both communities

**Evidence to Capture:**
- Screenshot showing all programs from both communities
- Screenshot of submissions view showing cross-community data
- Run query:
```sql
-- Super Admin should see all communities
SELECT community_id, name, admin_id
FROM communities
ORDER BY name;
```

---

#### Test 3: Notification Flow
**Objective:** Verify notifications are created and delivered to correct users

**Steps:**
1. Log in as **Member A** (`memberA@test.com`)
2. Navigate to Milestones page
3. Select a milestone and submit an achievement
4. Log out

5. Log in as **Admin Community A** (`adminA@test.com`)
6. Check notifications (should have notification about new submission)
7. Navigate to Admin Dashboard → Submissions
8. Approve or reject the submission
9. Log out

10. Log in as **Member A** (`memberA@test.com`)
11. Check notifications (should have notification about verification decision)

**Evidence to Capture:**
- Screenshot of notification to Admin A after submission
- Screenshot of notification to Member A after verification
- Run query:
```sql
-- Check notifications created
SELECT n.notification_id, n.type, n.title, n.message, n.is_read,
       u.name as recipient_name, u.email
FROM notifications n
JOIN users u ON n.user_id = u.user_id
WHERE n.created_at > NOW() - INTERVAL '1 hour'
ORDER BY n.created_at DESC;
```

---

#### Test 4: Audit Trail Verification
**Objective:** Verify all admin actions are logged in audit_logs

**Steps:**
1. Perform several admin actions (approve submission, create program, etc.)
2. Run audit log queries to verify tracking

**Evidence to Capture:**
- Run query:
```sql
-- Check audit logs for recent admin actions
SELECT al.audit_id, al.action, al.entity_type,
       u.name as actor_name, u.email,
       c.name as community_name,
       al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.actor_user_id = u.user_id
LEFT JOIN communities c ON al.community_id = c.community_id
WHERE al.created_at > NOW() - INTERVAL '1 hour'
ORDER BY al.created_at DESC
LIMIT 20;
```

---

#### Test 5: Real-Time Updates
**Objective:** Verify that real-time subscriptions work correctly

**Steps:**
1. Open two browser windows side by side
2. Window 1: Log in as **Admin Community A** (`adminA@test.com`), navigate to Submissions page
3. Window 2: Log in as **Member A** (`memberA@test.com`), navigate to Milestones page
4. In Window 2: Submit a new achievement
5. In Window 1: Verify the submission appears in real-time without refresh
6. In Window 1: Approve the submission
7. In Window 2: Verify the status updates in real-time without refresh

**Evidence to Capture:**
- Video recording or screenshot sequence showing real-time updates
- Check browser console for realtime subscription logs

---

## Quick Login Reference

| Account | Email | Password | Use Case |
|---------|-------|----------|----------|
| Super Admin | superadmin@test.com | SuperAdmin2024! | Platform-wide testing |
| Admin A | adminA@test.com | AdminA2024! | Community A admin testing |
| Admin B | adminB@test.com | AdminB2024! | Community B admin testing |
| Member A | memberA@test.com | MemberA2024! | Member experience testing |

---

## Database Verification Queries

### Check All Test Users
```sql
SELECT u.user_id, u.name, u.email, u.role, u.is_admin,
       c.name as community_name
FROM users u
LEFT JOIN communities c ON u.community_id = c.community_id
WHERE u.email LIKE '%@test.com'
ORDER BY u.role DESC, u.name;
```

### Check Community Membership
```sql
SELECT c.community_id, c.name, c.member_count, c.referral_code,
       u.name as admin_name, u.email as admin_email
FROM communities c
LEFT JOIN users u ON c.admin_id = u.user_id
WHERE c.name LIKE '%Test%'
ORDER BY c.name;
```

### Check Recent Achievements
```sql
SELECT a.achievement_id, a.status, a.verification_status,
       u.name as user_name, u.email,
       m.title as milestone_title,
       c.name as community_name,
       a.created_at
FROM achievements a
JOIN users u ON a.user_id = u.user_id
JOIN milestones m ON a.milestone_id = m.milestone_id
LEFT JOIN communities c ON a.community_id = c.community_id
WHERE a.created_at > NOW() - INTERVAL '24 hours'
ORDER BY a.created_at DESC;
```

---

## Reset/Cleanup

If you need to reset the test accounts:

```sql
-- Delete all test data (BE CAREFUL!)
DELETE FROM achievements WHERE user_id IN (
  SELECT user_id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM program_members WHERE user_id IN (
  SELECT user_id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM notifications WHERE user_id IN (
  SELECT user_id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM audit_logs WHERE actor_user_id IN (
  SELECT user_id FROM users WHERE email LIKE '%@test.com'
);

-- Then re-run the setup-test-accounts function
```

---

## Notes

- All accounts have been pre-verified (email_verified_at is set)
- Each account has a starting token balance of 100
- Community referral codes are auto-generated
- RLS policies are active and will restrict data access based on role and community

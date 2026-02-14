# Community Impact Tracker - Demo Runbook

## Overview

This runbook provides a step-by-step guide for demonstrating the complete Community Impact Tracker workflow from program creation to reward distribution.

**Demo Duration**: 10-15 minutes
**Audience**: Stakeholders, investors, community leaders
**Prerequisites**: Admin account access

---

## Setup: Seed Demo Data

**Before the demo**, populate the database with demo data using the admin panel:

1. Navigate to **Admin Panel** → **Seed Demo Data** (`/admin/seed-data`)
2. Click **"Seed Demo Data"** button
3. Verify creation of:
   - 2 Communities
   - 4 Programs
   - 20 Milestones
   - 20 Achievements (mixed statuses)
   - 20 Rewards (mixed statuses)

**Result**: Database populated with realistic demo data showing various states of the workflow.

---

## Demo Flow

### **Act 1: Community Admin - Program & Milestone Setup**

#### Step 1: Create a New Program

**Location**: Admin Panel → Programs (`/admin/programs`)

1. Click **"Create Program"** button
2. Fill in program details:
   - **Name**: "Community Garden Initiative"
   - **Description**: "Transform vacant lots into productive community gardens"
   - **Start Date**: Today
   - **End Date**: 3 months from now
   - **Program Type**: Environmental
   - **Status**: Active

3. Click **"Create Program"**

**What to highlight**:
- Simple program creation flow
- Flexible program types
- Clear date management

---

#### Step 2: Add Milestones to Program

**Location**: Admin Panel → Milestones (`/admin/milestones`)

1. Click **"Create Milestone"** button
2. Add first milestone:
   - **Title**: "Clear and prepare garden plot"
   - **Description**: "Remove debris and prepare soil for planting"
   - **Program**: Community Garden Initiative
   - **Reward Amount**: 150
   - **Reward Token**: IMPACT
   - **Evidence Type**: URL (photo upload)
   - **Verification Mode**: Admin
   - **Status**: Active

3. Click **"Create Milestone"**

4. Repeat for second milestone:
   - **Title**: "Plant initial seedlings"
   - **Reward Amount**: 200
   - **Status**: Active

**What to highlight**:
- Multiple verification modes (admin, auto, peer)
- Flexible evidence requirements
- Token-based rewards

---

### **Act 2: Community Member - Achievement Submission**

#### Step 3: Member Views Available Milestones

**Location**: Dashboard (`/dashboard`) or Milestones (`/milestones`)

1. Log in as a community member (or use admin view)
2. Browse available milestones
3. View milestone details:
   - Requirements
   - Reward amount
   - Deadline (if any)
   - Evidence requirements

**What to highlight**:
- Clear milestone descriptions
- Transparent reward structure
- Easy-to-understand requirements

---

#### Step 4: Member Submits Achievement

**Location**: Milestones page → Milestone detail

1. Select milestone: "Clear and prepare garden plot"
2. Click **"Submit Achievement"** or **"Submit Evidence"**
3. Provide evidence:
   - Upload photo URL or description
   - Add notes (optional)
4. Click **"Submit"**

**What to highlight**:
- Simple submission process
- Real-time progress tracking
- Immediate feedback

---

### **Act 3: Admin - Achievement Verification**

#### Step 5: Admin Reviews Submissions

**Location**: Admin Panel → Submissions (`/admin/submissions`)

1. View pending submissions list
2. **Real-time indicator** shows live updates
3. Click on submission to review:
   - User name and email
   - Milestone details
   - Submitted evidence
   - Submission timestamp
   - **View Evidence** link

**What to highlight**:
- Real-time submission monitoring
- Comprehensive submission details
- Easy evidence review

---

#### Step 6: Approve Achievement

**Action**: Review the evidence

**Option A - Approve**:
1. Click **"Approve"** button
2. System automatically:
   - Sets `verified_by` to admin user
   - Records `verified_at` timestamp
   - Changes status to "completed"
   - Creates pending reward
   - **Triggers notification** to user
   - **Logs audit entry**

**Option B - Reject**:
1. Click **"Reject"** button
2. **Rejection modal appears** (required fields):
   - **Rejection Reason** (required, user-facing)
   - **Admin Notes** (optional, internal)
3. Click **"Reject Submission"**
4. System automatically:
   - Sets `verified_by` to admin user
   - Records `verified_at` timestamp
   - Stores rejection reason
   - Changes status back to "available"
   - **Triggers notification** to user with reason
   - **Logs audit entry**

**What to highlight**:
- **Accountability**: Every decision tracked with admin ID and timestamp
- **Transparency**: Rejection reasons provided to users
- **Auditability**: All actions logged automatically
- **Communication**: Users notified immediately
- Dual-approval fields (user-facing vs internal notes)

---

### **Act 4: Reward Distribution**

#### Step 7: Admin Views Rewards Queue

**Location**: Admin Panel → Rewards Queue (`/admin/rewards`)

1. View pending rewards dashboard:
   - **Pending count** and **total amount**
   - Real-time status updates
   - Filter: Pending / All

2. Review reward details:
   - User name and wallet address
   - Token amount and type
   - Associated achievement
   - Approval timestamp
   - **Approved by** admin name
   - **Approved at** timestamp

**What to highlight**:
- Clear rewards pipeline
- Wallet validation (warns if not connected)
- Batch distribution capability
- Full approval accountability

---

#### Step 8: Distribute Reward

**Action**: Process the reward

**Option A - Individual Distribution**:
1. Click **"Distribute"** button on single reward
2. System:
   - Updates status to "confirmed"
   - Records `paid_at` timestamp
   - Generates transaction hash
   - **Triggers notification** to user
   - **Logs audit entry**

**Option B - Batch Distribution**:
1. Click **"Distribute All"** button
2. Confirm batch processing
3. System processes all pending rewards
4. Each reward tracked individually

**What to highlight**:
- Secure wallet integration
- Transaction tracking
- Error handling for failed transactions
- Retry capability for failed rewards

---

### **Act 5: User Notifications & Impact Tracking**

#### Step 9: Check Notifications

**Location**: Header → Notification Bell Icon

1. Click **notification bell** in header
2. **Badge shows unread count** (e.g., "3")
3. Dropdown displays recent notifications:
   - Achievement submitted
   - Achievement approved/rejected
   - Reward created
   - Reward distributed

4. Notification details:
   - Icon based on type (award, coins, alert)
   - Title and message
   - Timestamp ("2m ago", "1h ago")
   - Priority indicator (urgent = red border)
   - Action link ("View")

5. Actions:
   - **Mark as read** (checkmark icon)
   - **Dismiss** (X icon)
   - **Mark all read** (top button)
   - **View details** (action link)

**What to highlight**:
- **Real-time notifications** (no refresh needed)
- Priority-based styling (urgent notifications highlighted)
- Community-scoped (only see your community's notifications)
- Clean, organized interface
- One-click actions

---

#### Step 10: Review Impact Dashboard

**Location**: Dashboard (`/dashboard`)

1. View updated metrics:
   - Total impact score
   - Tokens earned
   - Milestones completed
   - Community rank

2. Check **real-time updates**:
   - Live indicator shows connection
   - Metrics update automatically
   - Leaderboard refreshes

3. View recent activity:
   - Achievement timeline
   - Token balance changes
   - Community progress

**What to highlight**:
- Real-time metric updates
- Gamification elements
- Community engagement tracking
- Personal progress visualization

---

## Demo Script (Talking Points)

### Opening (1 min)
> "Community Impact Tracker is a blockchain-powered platform that helps communities track, verify, and reward positive social impact. Let me show you how it works end-to-end."

### Program Creation (2 min)
> "Community admins can quickly create programs with clear goals. Each program has milestones that members can complete for token rewards. Notice how simple and intuitive the interface is."

### Member Participation (2 min)
> "Community members browse available milestones, complete activities, and submit proof. The submission process is straightforward - upload evidence and you're done. Real-time updates keep everyone informed."

### Admin Verification (3 min)
> "Here's where accountability becomes critical. When admins review submissions, every action is tracked:
> - **Who** approved or rejected (verified_by field)
> - **When** the decision was made (verified_at timestamp)
> - **Why** it was rejected (rejection_reason for user)
> - **Notes** for internal tracking (admin_notes)
>
> All decisions are logged in our audit system and trigger automatic notifications to users. This creates complete transparency and auditability."

### Reward Distribution (2 min)
> "Approved achievements automatically create rewards in the queue. Admins can distribute individually or in batches. The system tracks:
> - Approval chain (approved_by, approved_at)
> - Payment status (paid_at, tx_hash)
> - Error handling (retry_count, error_message)
>
> Wallet validation prevents distribution errors, and failed transactions can be retried."

### Notifications & Impact (2 min)
> "The notification system keeps everyone engaged:
> - Real-time updates (no refresh needed)
> - Priority-based alerts
> - One-click actions
> - Community-scoped visibility
>
> Members see their impact grow in real-time on the dashboard with live metrics and community rankings."

### Closing (1 min)
> "This complete workflow - from program creation to reward distribution - is fully automated, auditable, and transparent. Every action is tracked, every decision is recorded, and every participant stays informed through real-time notifications."

---

## Advanced Demo Features (Optional)

### Show Row-Level Security (RLS)
**If demonstrating multi-community setup**:

1. Log in as Community A admin
2. Show only Community A data visible
3. Switch to Community B admin
4. Show complete data isolation
5. Switch to Super Admin
6. Show cross-community access

**Talking point**: "Our row-level security ensures complete data privacy between communities while allowing super admins to manage the platform."

---

### Show Audit Trail
**Location**: Database query (for technical audiences):

```sql
SELECT * FROM audit_logs
WHERE action IN ('achievement_approved', 'achievement_rejected', 'reward_created')
ORDER BY created_at DESC
LIMIT 10;
```

**Talking point**: "Every critical action is logged with full context - who did it, when, what changed, and why. This supports compliance and trust."

---

### Show Notification Triggers
**Location**: Database query (for technical audiences):

```sql
SELECT * FROM notifications
WHERE user_id = '<user_id>'
ORDER BY created_at DESC;
```

**Talking point**: "Notifications are automatically created by database triggers, ensuring users never miss important updates about their achievements and rewards."

---

## Troubleshooting During Demo

### Issue: No pending submissions
**Solution**: Use the seed data utility or have team member submit achievement live

### Issue: Wallet not connected
**Solution**: Point out the warning message and explain wallet requirement

### Issue: Real-time not updating
**Solution**: Show live indicator status, explain connection retry logic

### Issue: No notifications appearing
**Solution**: Verify user_id mapping, check notification table directly

---

## Post-Demo Q&A Prep

**Common Questions**:

1. **Q**: "How do you prevent fraud?"
   **A**: Multi-layer approach: admin verification, evidence requirements, audit logging, and blockchain immutability for rewards.

2. **Q**: "Can rewards be in different tokens?"
   **A**: Yes, the system supports any token type - IMPACT, USD, community-specific tokens, etc.

3. **Q**: "What if an admin makes a mistake?"
   **A**: All actions are logged and auditable. Admin notes and rejection reasons create accountability.

4. **Q**: "How scalable is this?"
   **A**: Built on Supabase with real-time subscriptions, RLS for data isolation, and efficient indexing. Proven to handle thousands of concurrent users.

5. **Q**: "Can communities customize the platform?"
   **A**: Yes, community settings allow branding, privacy levels, program types, and custom fields.

---

## Success Metrics to Highlight

After demo, reference these metrics:

- **Zero-downtime verification**: Real-time updates, no page refreshes
- **Complete accountability**: Every action has who, when, why
- **Instant notifications**: Sub-second notification delivery
- **Data isolation**: RLS ensures community privacy
- **Audit compliance**: Every critical action logged

---

## Next Steps After Demo

1. **Technical deep dive**: Show database schema, RLS policies, audit logs
2. **Integration discussion**: API endpoints, webhooks, external systems
3. **Customization roadmap**: Community-specific requirements
4. **Deployment planning**: Infrastructure, scaling, monitoring
5. **Training plan**: Admin and member onboarding

---

**End of Demo Runbook**

*For technical implementation details, see `/docs/TECHNICAL.md`*
*For database schema, see `/docs/schema.sql`*
*For RLS testing, see `/docs/INTEGRATION_TEST_RESULTS.md`*

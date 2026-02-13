# Community Admin Dashboard - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
3. [Overview Page](#overview-page)
4. [Programs Management](#programs-management)
5. [Milestones Management](#milestones-management)
6. [Submissions Review](#submissions-review)
7. [Rewards Queue](#rewards-queue)
8. [Community Settings](#community-settings)
9. [Common Workflows](#common-workflows)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Before you can access the Admin Dashboard, you need:

1. **An active user account** - Sign up and log in to the platform
2. **Admin privileges** - Your account must have `is_admin = true` in the database
3. **Community membership** - You must be part of a community

### Setting Admin Privileges

Admin privileges are set at the database level. To make a user an admin:

```sql
-- Update the is_admin field for a specific user
UPDATE users
SET is_admin = true
WHERE email = 'admin@example.com';
```

**Note:** This operation must be performed by a database administrator or through the Supabase dashboard.

---

## Accessing the Admin Dashboard

### Step 1: Log In
1. Navigate to the platform homepage
2. Click the "Sign In" button
3. Enter your credentials
4. Click "Sign In"

### Step 2: Navigate to Admin Panel
- **Direct URL:** Visit `/admin` in your browser
- **From Dashboard:** Look for an "Admin" link in your navigation menu (if available)

### Step 3: Verification
If you see the admin dashboard with left-side navigation, you're successfully logged in as an admin.

**If you see "Access Denied":**
- You don't have admin privileges
- Contact your system administrator to grant admin access

---

## Overview Page

**Location:** `/admin`

The Overview page is your command center, showing real-time statistics and quick actions.

### What You'll See

#### Statistics Cards
1. **Total Members** - Number of users in your community
2. **Active Programs** - Current programs running
3. **Total Milestones** - All achievement milestones created
4. **Pending Submissions** - Achievements waiting for your review (shows alert if > 0)
5. **Pending Rewards** - Tokens waiting to be distributed (shows alert if > 0)
6. **Tokens Distributed** - Total tokens given to community members

#### Quick Actions
- **Create New Program** - Jump directly to program creation
- **Add Milestone** - Create a new achievement milestone
- **Review Submissions** - Process pending submissions
- **Community Settings** - Manage community configuration

### Best Practices
- Check this page daily to monitor pending items
- Pay attention to cards with alert indicators
- Use Quick Actions for common tasks

---

## Programs Management

**Location:** `/admin/programs`

Programs are the foundation of your community's activities. Think of them as containers for related milestones and achievements.

### Viewing Programs

#### Program Card Information
Each program displays:
- **Name** - Program title
- **Status Badge** - Current state (Draft, Active, Paused, Completed)
- **Description** - Brief overview
- **Start Date** - When the program begins
- **Participant Count** - Number of members enrolled
- **Token Allocation** - Total tokens budgeted

#### Filtering
- Use the **search bar** to find programs by name or description
- Results update in real-time as you type

### Creating a New Program

**Step 1: Click "Create Program"**
- Located in the top-right corner

**Step 2: Fill Out the Form**

Required Fields:
- **Program Name** - Clear, descriptive title
  - Example: "Youth Education Initiative"
- **Description** - Detailed explanation of goals and objectives
- **Start Date** - When the program begins

Optional Fields:
- **End Date** - When the program concludes (leave blank for ongoing)
- **Total Budget** - Total USD budget allocated
- **Token Allocation** - Number of tokens reserved for rewards
- **Status** - Choose from:
  - **Draft** - Still planning (not visible to members)
  - **Active** - Currently running (members can participate)
  - **Paused** - Temporarily halted
  - **Completed** - Finished

**Step 3: Submit**
- Click "Create Program" to save
- Click "Cancel" to discard

### Editing Programs
1. Find the program you want to edit
2. Click the "Edit" button on the program card
3. Modify the fields
4. Save changes

### Program Status Colors
- **Green** - Active
- **Blue** - Completed
- **Yellow** - Paused
- **Gray** - Draft

---

## Milestones Management

**Location:** `/admin/milestones`

Milestones are specific achievements that members can complete within programs.

### Viewing Milestones

#### Milestone Card Information
- **Title** - Achievement name
- **Program Name** - Which program it belongs to
- **Difficulty Badge** - Easy, Medium, or Hard
- **Description** - What needs to be accomplished
- **Reward Amount** - Tokens earned upon completion
- **Deadline** - Due date (if applicable)
- **Verification Type** - How it's verified
- **Category** - Classification (optional)

#### Filtering
- **Filter by Program** - Dropdown menu to show milestones from specific programs
- **All Programs** - Shows all milestones across all programs

### Creating a New Milestone

**Prerequisites:**
- You must have at least one program created
- If no programs exist, you'll be prompted to create one first

**Step 1: Click "Create Milestone"**

**Step 2: Fill Out the Form**

Required Fields:
- **Milestone Title**
  - Example: "Complete First Week Training"
- **Description**
  - Detailed explanation of requirements
  - What evidence is needed
- **Program** - Select from dropdown
- **Reward Amount** - Number of tokens
  - Must be at least 1
- **Difficulty** - Choose from:
  - **Easy** - Simple tasks, quick completion
  - **Medium** - Moderate effort required
  - **Hard** - Significant time/effort investment

Optional Fields:
- **Category** - Classification tag (e.g., "Education", "Training")
- **Deadline** - Due date for completion
- **Verification Type** - Choose from:
  - **Admin Approval** (default) - You manually review
  - **Automatic** - System verifies automatically
  - **Peer Review** - Community members verify
  - **Document Upload** - Requires file submission

**Step 3: Submit**
- Click "Create Milestone" to save
- Click "Cancel" to discard

### Difficulty Colors
- **Green** - Easy
- **Yellow** - Medium
- **Red** - Hard

### Best Practices
- Write clear, specific descriptions
- Set realistic reward amounts
- Use deadlines for time-sensitive activities
- Choose appropriate verification methods
- Balance difficulty levels across your program

---

## Submissions Review

**Location:** `/admin/submissions`

This is where you review and approve member achievement submissions.

### Understanding Submissions

Each submission shows:
- **Milestone Title** - What they're claiming to have completed
- **Member Name** - Who submitted it
- **Submission Date/Time** - When it was submitted
- **Evidence Link** - Supporting documentation (if provided)
- **Reward Details** - Tokens they'll receive if approved
- **Progress Percentage** - How complete the achievement is
- **Status Badge** - Pending, Verified, or Rejected

### Filtering Options

**Show: Pending Only** (Default)
- Only unreviewed submissions
- What requires your attention now

**Show: All Submissions**
- Complete history
- Includes approved and rejected

### Reviewing Submissions

**Step 1: Review the Details**
- Read the milestone requirements
- Check who submitted it
- Look at the timestamp

**Step 2: Check Evidence (if provided)**
- Click "View Evidence" link
- Opens in new tab
- Verify it meets requirements

**Step 3: Make a Decision**

**To Approve:**
1. Click the green "Approve" button
2. System automatically:
   - Marks achievement as verified
   - Changes status to completed
   - Creates reward in Rewards Queue
   - Credits tokens to member's balance

**To Reject:**
1. Click the red "Reject" button
2. System automatically:
   - Marks achievement as rejected
   - Returns status to available
   - Member can try again

### Status Colors
- **Yellow** - Pending review
- **Green** - Verified/approved
- **Red** - Rejected

### Best Practices
- Review submissions daily
- Always check evidence when provided
- Be consistent in your verification standards
- Act promptly to keep members engaged
- If rejecting, consider providing feedback (future feature)

---

## Rewards Queue

**Location:** `/admin/rewards`

Manage token distribution to community members.

### Understanding the Rewards Queue

The Rewards Queue shows all tokens waiting to be distributed to members' wallets.

#### Statistics Cards (when pending rewards exist)
- **Pending Rewards** - Number of rewards waiting
- **Total Pending Amount** - Sum of all pending tokens

### Reward Card Information
- **Member Name** - Who's receiving the reward
- **Status Badge** - Pending, Confirmed, or Failed
- **Description** - What the reward is for
- **Amount** - Number of tokens and token type
- **Created Date** - When the reward was generated
- **Transaction Hash** - Blockchain confirmation (once distributed)
- **Wallet Warning** - Alert if member hasn't connected a wallet

### Filtering Options
- **Pending Only** - Rewards waiting to be sent
- **All Rewards** - Complete history

### Distributing Rewards

#### Individual Distribution

**Step 1: Review the Reward**
- Check the member name
- Verify the amount
- Ensure they have a wallet connected (required)

**Step 2: Click "Distribute"**
- Green button on the right
- Only available if wallet is connected

**Step 3: Confirmation**
- System processes the blockchain transaction
- Status changes to "Confirmed"
- Transaction hash is recorded

#### Bulk Distribution

**For Multiple Pending Rewards:**

**Step 1: Click "Distribute All"**
- Blue button in top-right corner
- Only visible when pending rewards exist

**Step 2: Confirm Action**
- Dialog asks for confirmation
- Click "OK" to proceed

**Step 3: Processing**
- System distributes all eligible rewards
- Shows progress
- Rewards without wallets are skipped

### Status Colors
- **Yellow** - Pending
- **Green** - Confirmed
- **Red** - Failed

### Important Notes

**Wallet Requirement:**
- Members MUST connect a wallet before rewards can be distributed
- Yellow warning appears if wallet is missing
- Reward remains pending until wallet is connected

**Transaction Hashes:**
- Recorded automatically upon distribution
- Provides blockchain verification
- Can be used for auditing

### Best Practices
- Distribute rewards promptly after approval
- Check for wallet warnings before bulk distribution
- Keep records of transaction hashes
- Monitor for failed transactions

---

## Community Settings

**Location:** `/admin/settings`

Configure your community's core information and settings.

### Basic Information

#### Editable Fields

**Community Name** (Required)
- Your community's official name
- Displayed throughout the platform
- Example: "Green Valley Community"

**Description** (Optional)
- Mission statement and goals
- What your community does
- Who you serve
- Best practices:
  - Keep it concise but informative
  - Update as your mission evolves
  - Use clear, welcoming language

**Blockchain Address** (Optional)
- Smart contract address for token distribution
- Format: `0x...` (Ethereum-style address)
- Required for automated token distribution
- Get this from your blockchain administrator

#### Saving Changes
1. Modify any field
2. Click "Save Changes" button
3. Confirmation message appears
4. Changes take effect immediately

### Community Statistics

Read-only information about your community:

**Total Members**
- Current member count
- Updated in real-time

**Created Date**
- When your community was established
- Cannot be changed

### Referral System

Share your community with others using referral codes and links.

#### Referral Code
- Unique code assigned to your community
- Example: `ABC123`
- **To Copy:** Click the "Copy" button next to the code

#### Referral Link
- Full URL with embedded referral code
- Format: `https://yourplatform.com/?ref=ABC123`
- **To Copy:** Click the "Copy" button next to the link

#### How Referrals Work
1. Share your referral link with potential members
2. When they sign up using the link
3. They're automatically added to your community
4. No manual approval needed

#### Sharing Best Practices
- Add to email signatures
- Post on social media
- Include in newsletters
- Share at community events
- Add to marketing materials

### Danger Zone

**Delete Community**
- Permanently removes your community
- Currently disabled for safety
- Contact system administrator if deletion is truly needed

### Best Practices
- Keep information current
- Add a compelling description
- Configure blockchain address for seamless rewards
- Actively share referral links
- Review settings monthly

---

## Common Workflows

### Workflow 1: Setting Up a New Program

**Time Required:** 15-20 minutes

1. **Navigate to Programs** (`/admin/programs`)
2. **Click "Create Program"**
3. **Fill in basic information:**
   - Name your program
   - Write a clear description
   - Set start date
   - Choose "Draft" status initially
4. **Set budget and allocations** (optional but recommended)
5. **Save the program**
6. **Navigate to Milestones** (`/admin/milestones`)
7. **Create 3-5 milestones** for the program:
   - Mix difficulty levels
   - Set appropriate rewards
   - Write clear descriptions
8. **Return to Programs**
9. **Change program status to "Active"**
10. **Announce to your community**

### Workflow 2: Processing Weekly Submissions

**Time Required:** 10-30 minutes (depends on volume)

1. **Check Overview** (`/admin`)
   - Note pending submission count
2. **Navigate to Submissions** (`/admin/submissions`)
3. **Set filter to "Pending Only"**
4. **For each submission:**
   - Review milestone requirements
   - Check evidence if provided
   - Approve or reject
5. **Navigate to Rewards Queue** (`/admin/rewards`)
6. **Review newly created rewards**
7. **Click "Distribute All"** to send tokens
8. **Verify all distributions completed**

### Workflow 3: Monthly Program Review

**Time Required:** 30-45 minutes

1. **Navigate to Overview** (`/admin`)
   - Screenshot statistics for records
2. **Review Programs** (`/admin/programs`)
   - Check completion rates
   - Update program descriptions if needed
   - Close completed programs
3. **Review Milestones** (`/admin/milestones`)
   - Identify low-participation milestones
   - Consider adjusting rewards
   - Add new milestones as needed
4. **Check Submissions History** (`/admin/submissions`, All)
   - Identify trends
   - Look for common issues
5. **Export data** (future feature)
6. **Plan next month's programs**

### Workflow 4: Onboarding a New Community Member

**Time Required:** 5 minutes

1. **Share referral link** from Settings
2. **Wait for signup notification**
3. **Check Overview** - member count should increase
4. **Optional: Announce new member to community**

---

## Troubleshooting

### I can't access the Admin Dashboard

**Problem:** "Access Denied" message appears

**Solutions:**
1. **Verify you're logged in**
   - Try logging out and back in
2. **Check admin status**
   - Contact system administrator
   - Confirm `is_admin = true` in database
3. **Verify community membership**
   - You must belong to a community
4. **Clear browser cache**
   - Try incognito/private mode
5. **Check URL**
   - Make sure you're visiting `/admin`

### No programs appear in the Programs list

**Problem:** Programs page is empty

**Solutions:**
1. **Create your first program**
   - Click "Create Program" button
2. **Check filters**
   - Ensure search box is empty
3. **Verify community**
   - Programs are community-specific
   - Make sure you're in the right community
4. **Refresh the page**
   - Data might be loading

### Can't create milestones

**Problem:** "Create Milestone" button is disabled

**Solution:**
- **You need at least one program first**
- Create a program before creating milestones
- Milestones must be attached to programs

### No submissions to review

**Problem:** Submissions page shows "No submissions found"

**Possible Reasons:**
1. **No members have completed milestones yet**
   - This is normal for new programs
2. **Filter is set to "Pending Only" with no pending items**
   - Switch to "All Submissions" to see history
3. **No milestones created yet**
   - Members need milestones to complete

### Rewards won't distribute

**Problem:** "Distribute" button is disabled or failing

**Common Causes & Solutions:**

1. **Member hasn't connected wallet**
   - Yellow warning will show
   - Ask member to connect wallet
   - Retry distribution after wallet is connected

2. **Blockchain connection issues**
   - Check internet connection
   - Try again in a few minutes
   - Contact technical support if persists

3. **Insufficient permissions**
   - Verify admin status
   - Check community admin rights

### Changes aren't saving

**Problem:** Edits don't persist

**Solutions:**
1. **Check for error messages**
   - Red text or alerts
   - Address any validation errors
2. **Verify required fields**
   - All fields marked with * must be filled
3. **Check internet connection**
   - Ensure stable connection
4. **Try again**
   - Temporary server issue might resolve
5. **Refresh and retry**
   - Don't refresh while saving

### Statistics seem incorrect

**Problem:** Numbers don't match expectations

**Solutions:**
1. **Refresh the page**
   - Statistics update periodically
   - Manual refresh gets latest data
2. **Check date ranges**
   - Statistics might be filtered (future feature)
3. **Verify database sync**
   - Contact technical support
4. **Clear cache**
   - Browser might show cached data

---

## Tips for Success

### General Best Practices

1. **Review Daily**
   - Check pending submissions
   - Monitor reward queue
   - Stay on top of member activity

2. **Be Responsive**
   - Quick approval times boost engagement
   - Members appreciate fast feedback
   - Aim for 24-hour turnaround on submissions

3. **Set Clear Expectations**
   - Write detailed milestone descriptions
   - Specify what evidence is required
   - Be consistent in verification

4. **Communicate Regularly**
   - Announce new programs
   - Share milestone completions
   - Celebrate community achievements

5. **Monitor Trends**
   - Which milestones are popular?
   - Which ones are ignored?
   - Adjust rewards and difficulty accordingly

### Security Best Practices

1. **Protect Your Admin Account**
   - Use a strong password
   - Never share credentials
   - Log out when finished

2. **Verify Before Approving**
   - Always check evidence
   - Don't approve blindly
   - Maintain standards

3. **Review Transaction Hashes**
   - Keep records of distributions
   - Verify blockchain confirmations
   - Audit regularly

4. **Backup Important Data**
   - Export reports regularly (when feature is available)
   - Document your programs
   - Keep records of major decisions

### Growth Strategies

1. **Start Small**
   - Create 1-2 programs initially
   - 3-5 milestones per program
   - Expand as you learn

2. **Iterate Based on Feedback**
   - Ask members what they want
   - Adjust rewards if needed
   - Add requested milestone types

3. **Promote Your Community**
   - Share referral links actively
   - Highlight member achievements
   - Showcase impact metrics

4. **Recognize Top Contributors**
   - Celebrate milestone completions
   - Feature active members
   - Create special recognition programs

---

## Getting Help

### Support Resources

**Technical Issues:**
- Check this manual first
- Review the [Technical Documentation](/docs/TECHNICAL.md)
- Contact system administrator

**Feature Requests:**
- Document what you need
- Explain the use case
- Submit to development team

**Training:**
- Share this manual with co-admins
- Create community-specific guidelines
- Schedule regular admin reviews

### Contact Information

For urgent issues or questions:
- Email: support@communityimpact.org
- Technical issues: Submit a support ticket
- Community questions: Check community forums

---

## Appendix: Keyboard Shortcuts

Coming in future release.

---

## Appendix: API Access

Coming in future release for advanced integrations.

---

## Version History

**Version 1.0** - Initial Release
- Overview dashboard
- Programs management
- Milestones management
- Submissions review
- Rewards queue
- Community settings
- Role-based access control

---

**Last Updated:** February 2026
**Manual Version:** 1.0
**Platform Version:** Compatible with all current releases

---

*This manual is subject to updates as new features are added. Check back regularly for the latest information.*

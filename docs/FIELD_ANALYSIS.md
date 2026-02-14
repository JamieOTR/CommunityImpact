# Data Fields Analysis & Recommendations

## Current Database Fields by Table

### 1. **Users Table**
**Existing Fields:**
- `user_id` (UUID, PK)
- `auth_user_id` (UUID, FK to auth.users)
- `wallet_address` (VARCHAR)
- `email` (VARCHAR)
- `name` (VARCHAR)
- `avatar_url` (TEXT)
- `token_balance` (INTEGER)
- `total_impact_score` (INTEGER)
- `community_id` (UUID, FK)
- `is_admin` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Recommended Additional Fields:**
- `bio` (TEXT) - User profile biography
- `location` (VARCHAR) - Geographic location
- `phone_number` (VARCHAR) - Contact info
- `timezone` (VARCHAR) - For scheduling and notifications
- `language_preference` (VARCHAR) - i18n support
- `last_login_at` (TIMESTAMPTZ) - Track active users
- `last_seen_at` (TIMESTAMPTZ) - Real-time presence
- `account_status` (ENUM: 'active', 'suspended', 'deleted') - Account management
- `email_verified` (BOOLEAN) - Email verification status
- `notifications_enabled` (BOOLEAN) - Notification preferences
- `achievements_count` (INTEGER) - Cached count for performance
- `rewards_earned` (INTEGER) - Total rewards count
- `rank` (INTEGER) - Leaderboard position
- `streak_days` (INTEGER) - Daily login/activity streak
- `referral_code` (VARCHAR) - User referral code
- `referred_by` (UUID, FK to users) - Referral tracking
- `social_links` (JSONB) - Social media profiles
- `skills` (TEXT[]) - User skills/interests
- `onboarding_completed` (BOOLEAN) - Track onboarding flow
- `terms_accepted_at` (TIMESTAMPTZ) - Legal compliance

---

### 2. **Communities Table**
**Existing Fields:**
- `community_id` (UUID, PK)
- `name` (VARCHAR)
- `description` (TEXT)
- `admin_id` (UUID, FK)
- `blockchain_address` (VARCHAR)
- `member_count` (INTEGER)
- `referral_code` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Recommended Additional Fields:**
- `logo_url` (TEXT) - Community branding
- `banner_url` (TEXT) - Cover image
- `website` (VARCHAR) - External website
- `social_links` (JSONB) - Social media
- `status` (ENUM: 'active', 'inactive', 'archived')
- `privacy_level` (ENUM: 'public', 'private', 'invite-only')
- `location` (VARCHAR) - Physical location
- `categories` (TEXT[]) - Tags/categories
- `rules` (TEXT) - Community guidelines
- `join_requirements` (JSONB) - Criteria for joining
- `max_members` (INTEGER) - Capacity limit
- `total_tokens_distributed` (INTEGER) - Track rewards
- `total_impact_score` (INTEGER) - Aggregate score
- `verified` (BOOLEAN) - Verified badge
- `subscription_tier` (VARCHAR) - Premium features
- `settings` (JSONB) - Community preferences
- `is_archived` (BOOLEAN) - Soft delete

---

### 3. **Programs Table**
**Existing Fields:**
- `program_id` (UUID, PK)
- `name` (VARCHAR)
- `description` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE)
- `community_id` (UUID, FK)
- `total_budget` (INTEGER)
- `token_allocation` (INTEGER)
- `participant_count` (INTEGER)
- `status` (ENUM)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Recommended Additional Fields:**
- `created_by` (UUID, FK to users) - Program creator
- `coordinator_id` (UUID, FK to users) - Program lead
- `cover_image_url` (TEXT) - Visual identity
- `goals` (JSONB) - Structured objectives
- `visibility` (ENUM: 'public', 'private', 'invite-only')
- `tags` (TEXT[]) - Searchable tags
- `sdg_alignment` (INTEGER[]) - UN SDG goals
- `impact_areas` (TEXT[]) - Focus areas
- `eligibility_criteria` (JSONB) - Who can participate
- `completion_rate` (DECIMAL) - % of milestones completed
- `budget_spent` (INTEGER) - Track spending
- `featured` (BOOLEAN) - Highlight program
- `difficulty_level` (ENUM: 'beginner', 'intermediate', 'advanced')
- `estimated_duration` (INTEGER) - Days to complete
- `min_participants` (INTEGER) - Minimum requirement
- `max_participants` (INTEGER) - Capacity limit
- `auto_approve_members` (BOOLEAN) - Join settings
- `certificates_enabled` (BOOLEAN) - Issue certificates
- `deleted_at` (TIMESTAMPTZ) - Soft delete

---

### 4. **Milestones Table**
**Existing Fields:**
- `milestone_id` (UUID, PK)
- `title` (VARCHAR)
- `description` (TEXT)
- `reward_amount` (INTEGER)
- `reward_token` (VARCHAR)
- `verification_type` (VARCHAR)
- `program_id` (UUID, FK)
- `completion_criteria` (JSONB)
- `category` (VARCHAR)
- `difficulty` (ENUM)
- `deadline` (TIMESTAMPTZ)
- `requirements` (TEXT[])
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Recommended Additional Fields:**
- `created_by` (UUID, FK to users) - Creator
- `order_index` (INTEGER) - Sequence in program
- `icon` (VARCHAR) - Icon/emoji
- `image_url` (TEXT) - Visual representation
- `is_required` (BOOLEAN) - Mandatory vs optional
- `prerequisites` (UUID[]) - Must complete first
- `max_submissions` (INTEGER) - Attempt limit
- `submission_window_days` (INTEGER) - Time limit
- `auto_verify` (BOOLEAN) - Skip manual review
- `verification_instructions` (TEXT) - Guide for admins
- `points_value` (INTEGER) - Impact score points
- `badge_image_url` (TEXT) - Achievement badge
- `completion_count` (INTEGER) - How many completed
- `success_rate` (DECIMAL) - % approved
- `average_completion_time` (INTERVAL) - Performance metric
- `featured` (BOOLEAN) - Highlight
- `visibility` (ENUM: 'visible', 'hidden', 'locked')
- `unlock_condition` (JSONB) - When it becomes available
- `expires_at` (TIMESTAMPTZ) - Time-limited
- `template_id` (UUID) - Reusable templates
- `metadata` (JSONB) - Flexible custom data

---

### 5. **Achievements Table**
**Existing Fields:**
- `achievement_id` (UUID, PK)
- `user_id` (UUID, FK)
- `milestone_id` (UUID, FK)
- `completed_at` (TIMESTAMPTZ)
- `evidence_hash` (TEXT)
- `evidence_url` (TEXT)
- `verification_status` (ENUM)
- `transaction_hash` (VARCHAR)
- `progress` (INTEGER)
- `status` (ENUM)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Recommended Additional Fields:**
- `started_at` (TIMESTAMPTZ) - Track duration
- `submitted_at` (TIMESTAMPTZ) - Submission time
- `verified_at` (TIMESTAMPTZ) - Verification time
- `verified_by` (UUID, FK to users) - Admin who verified
- `rejection_reason` (TEXT) - Feedback for rejected
- `admin_notes` (TEXT) - Internal notes
- `resubmission_count` (INTEGER) - Track attempts
- `evidence_type` (VARCHAR) - photo, video, document, link
- `evidence_metadata` (JSONB) - File info
- `ai_verification_score` (DECIMAL) - AI confidence
- `ai_verification_details` (JSONB) - AI analysis
- `peer_reviews` (JSONB) - Community feedback
- `quality_score` (INTEGER) - Submission quality
- `time_spent_minutes` (INTEGER) - Self-reported effort
- `location` (VARCHAR) - Where completed
- `collaborators` (UUID[]) - Team achievements
- `is_featured` (BOOLEAN) - Showcase example
- `views_count` (INTEGER) - Social engagement
- `likes_count` (INTEGER) - Community appreciation
- `comments_count` (INTEGER) - Discussions

---

### 6. **Rewards Table**
**Existing Fields:**
- `reward_id` (UUID, PK)
- `user_id` (UUID, FK)
- `achievement_id` (UUID, FK)
- `token_amount` (INTEGER)
- `token_type` (VARCHAR)
- `distributed_at` (TIMESTAMPTZ)
- `transaction_hash` (VARCHAR)
- `status` (ENUM)
- `description` (TEXT)

**Recommended Additional Fields:**
- `approved_by` (UUID, FK to users) - Admin approval
- `approved_at` (TIMESTAMPTZ) - Approval time
- `scheduled_for` (TIMESTAMPTZ) - Batch processing
- `distributed_by` (UUID, FK to users) - Who distributed
- `blockchain_network` (VARCHAR) - Which blockchain
- `gas_fee` (DECIMAL) - Transaction cost
- `exchange_rate` (DECIMAL) - Token to USD rate
- `usd_value` (DECIMAL) - Fiat equivalent
- `claimed` (BOOLEAN) - User claimed status
- `claimed_at` (TIMESTAMPTZ) - Claim time
- `expires_at` (TIMESTAMPTZ) - Expiration
- `retry_count` (INTEGER) - Failed attempts
- `error_message` (TEXT) - Failure reason
- `batch_id` (UUID) - Group distributions
- `reward_category` (VARCHAR) - Type classification
- `bonus_multiplier` (DECIMAL) - Special bonuses
- `metadata` (JSONB) - Custom attributes

---

### 7. **Interactions Table** (AI Chat)
**Existing Fields:**
- `interaction_id` (UUID, PK)
- `user_id` (UUID, FK)
- `message` (TEXT)
- `ai_response` (TEXT)
- `timestamp` (TIMESTAMPTZ)
- `context_type` (VARCHAR)
- `session_id` (UUID)

**Recommended Additional Fields:**
- `conversation_id` (UUID) - Group related messages
- `message_type` (ENUM: 'text', 'voice', 'image')
- `sentiment_score` (DECIMAL) - Message sentiment
- `language` (VARCHAR) - i18n support
- `tokens_used` (INTEGER) - API cost tracking
- `response_time_ms` (INTEGER) - Performance
- `model_version` (VARCHAR) - AI model used
- `helpful` (BOOLEAN) - User feedback
- `feedback_rating` (INTEGER) - 1-5 stars
- `feedback_comment` (TEXT) - User feedback
- `intent_detected` (VARCHAR) - AI classification
- `entities_extracted` (JSONB) - NLP entities
- `action_taken` (VARCHAR) - What AI did
- `error_occurred` (BOOLEAN) - Track failures
- `attachment_url` (TEXT) - Uploaded files
- `parent_message_id` (UUID) - Thread support

---

### 8. **Impact_Metrics Table**
**Existing Fields:**
- `metric_id` (UUID, PK)
- `program_id` (UUID, FK)
- `community_id` (UUID, FK)
- `metric_name` (VARCHAR)
- `metric_type` (VARCHAR)
- `current_value` (NUMERIC)
- `target_value` (NUMERIC)
- `last_updated` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

**Recommended Additional Fields:**
- `unit` (VARCHAR) - e.g., "people", "kg CO2"
- `baseline_value` (NUMERIC) - Starting point
- `measurement_date` (DATE) - When measured
- `data_source` (VARCHAR) - Where data comes from
- `verification_method` (VARCHAR) - How verified
- `verified_by` (UUID, FK to users) - Verifier
- `verified_at` (TIMESTAMPTZ) - Verification date
- `confidence_level` (ENUM: 'low', 'medium', 'high')
- `sdg_goal` (INTEGER) - UN SDG alignment
- `trend` (ENUM: 'improving', 'stable', 'declining')
- `percentage_complete` (DECIMAL) - Progress %
- `historical_data` (JSONB) - Time series
- `notes` (TEXT) - Context/explanation
- `is_public` (BOOLEAN) - Visibility
- `chart_type` (VARCHAR) - Display preference

---

## New Tables to Consider

### 9. **Audit_Logs** (System Activity Tracking)
```sql
- audit_id (UUID, PK)
- user_id (UUID, FK)
- action (VARCHAR) - e.g., "create", "update", "delete"
- table_name (VARCHAR) - Which table affected
- record_id (UUID) - Which record
- old_values (JSONB) - Before
- new_values (JSONB) - After
- ip_address (INET) - Security
- user_agent (TEXT) - Browser info
- timestamp (TIMESTAMPTZ)
```

### 10. **Notifications**
```sql
- notification_id (UUID, PK)
- user_id (UUID, FK)
- type (ENUM: 'achievement', 'reward', 'message', 'system')
- title (VARCHAR)
- message (TEXT)
- action_url (TEXT)
- is_read (BOOLEAN)
- read_at (TIMESTAMPTZ)
- priority (ENUM: 'low', 'normal', 'high')
- created_at (TIMESTAMPTZ)
- expires_at (TIMESTAMPTZ)
```

### 11. **Comments** (Social Features)
```sql
- comment_id (UUID, PK)
- user_id (UUID, FK)
- entity_type (ENUM: 'achievement', 'program', 'milestone')
- entity_id (UUID)
- content (TEXT)
- parent_comment_id (UUID, FK) - Threading
- likes_count (INTEGER)
- is_edited (BOOLEAN)
- is_deleted (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### 12. **Badges** (Gamification)
```sql
- badge_id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- image_url (TEXT)
- criteria (JSONB)
- rarity (ENUM: 'common', 'rare', 'epic', 'legendary')
- points_value (INTEGER)
- created_at (TIMESTAMPTZ)
```

### 13. **User_Badges** (Badge Ownership)
```sql
- user_badge_id (UUID, PK)
- user_id (UUID, FK)
- badge_id (UUID, FK)
- earned_at (TIMESTAMPTZ)
- is_displayed (BOOLEAN)
```

### 14. **Program_Members** (Explicit Membership)
```sql
- member_id (UUID, PK)
- program_id (UUID, FK)
- user_id (UUID, FK)
- role (ENUM: 'participant', 'coordinator', 'viewer')
- joined_at (TIMESTAMPTZ)
- status (ENUM: 'active', 'completed', 'dropped')
- completed_at (TIMESTAMPTZ)
```

### 15. **Analytics_Events** (User Behavior)
```sql
- event_id (UUID, PK)
- user_id (UUID, FK)
- event_type (VARCHAR) - e.g., "page_view", "button_click"
- event_data (JSONB)
- session_id (UUID)
- timestamp (TIMESTAMPTZ)
- page_url (TEXT)
- referrer (TEXT)
```

### 16. **Files** (Media Management)
```sql
- file_id (UUID, PK)
- uploaded_by (UUID, FK to users)
- filename (VARCHAR)
- file_size (BIGINT)
- mime_type (VARCHAR)
- storage_path (TEXT)
- public_url (TEXT)
- entity_type (VARCHAR)
- entity_id (UUID)
- uploaded_at (TIMESTAMPTZ)
- virus_scanned (BOOLEAN)
```

---

## Priority Recommendations

### High Priority (Implement Soon)
1. **Audit_Logs** - Essential for security and debugging
2. **Notifications** - Critical for user engagement
3. **Program_Members** - Better program management
4. User fields: `last_login_at`, `account_status`, `achievements_count`
5. Achievement fields: `verified_by`, `verified_at`, `rejection_reason`
6. Reward fields: `approved_by`, `approved_at`, `error_message`

### Medium Priority (Next Phase)
1. **Comments** - Community engagement
2. **Badges** - Enhanced gamification
3. User fields: `streak_days`, `rank`, `referral_code`
4. Community fields: `logo_url`, `privacy_level`, `verified`
5. Program fields: `coordinator_id`, `completion_rate`

### Low Priority (Future Enhancement)
1. **Analytics_Events** - Advanced analytics
2. **Files** - Better media management
3. Social features (likes, views counts)
4. Advanced tracking (time_spent, quality_score)

---

## Benefits of Additional Fields

1. **Better Analytics** - Track user behavior, program success
2. **Improved UX** - Personalization, notifications
3. **Security & Compliance** - Audit trails, terms acceptance
4. **Performance** - Cached counts reduce queries
5. **Scalability** - Soft deletes, archiving
6. **Community Building** - Social features, gamification
7. **Admin Control** - Better moderation and management
8. **Data Integrity** - Proper tracking of who/when/why

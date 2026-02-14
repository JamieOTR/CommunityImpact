/*
  # STEP 5 - Activate Audit Logging and Notifications

  Creates helper functions and triggers to automatically:
  1. Log critical operations to audit_logs
  2. Create in-app notifications for key events

  Audit Logging Activated For:
  - Achievement verification (approve/reject)
  - Reward status changes
  - Program create/update/archive
  - Milestone create/update/archive
  - Community settings updates

  Notifications Activated For (IN-APP ONLY):
  - Submission received
  - Submission approved/rejected
  - Reward created
  - Reward paid/failed
*/

-- ============================================================
-- AUDIT LOGGING HELPERS
-- ============================================================

-- Helper function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_community_id UUID,
  p_before_json JSONB DEFAULT NULL,
  p_after_json JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_actor_user_id UUID;
BEGIN
  -- Only log if audit_logs feature is enabled
  IF NOT is_feature_enabled('enable_audit_logs') THEN
    RETURN NULL;
  END IF;

  -- Get the current user's user_id
  SELECT user_id INTO v_actor_user_id
  FROM users
  WHERE auth_user_id = auth.uid();

  -- Insert audit log
  INSERT INTO audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    community_id,
    before_json,
    after_json,
    request_id
  ) VALUES (
    v_actor_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_community_id,
    p_before_json,
    p_after_json,
    uuid_generate_v4()
  )
  RETURNING audit_id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for achievements audit logging
CREATE OR REPLACE FUNCTION audit_achievement_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_community_id UUID;
  v_before JSONB;
  v_after JSONB;
  v_action VARCHAR;
BEGIN
  -- Get community_id
  v_community_id := COALESCE(NEW.community_id, OLD.community_id);

  IF TG_OP = 'INSERT' THEN
    v_action := 'achievement_submitted';
    v_after := to_jsonb(NEW);
    PERFORM log_audit_event(v_action, 'achievement', NEW.achievement_id, v_community_id, NULL, v_after);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log significant changes
    IF OLD.verification_status != NEW.verification_status THEN
      IF NEW.verification_status = 'verified' THEN
        v_action := 'achievement_approved';
      ELSIF NEW.verification_status = 'rejected' THEN
        v_action := 'achievement_rejected';
      ELSE
        v_action := 'achievement_updated';
      END IF;
      
      v_before := jsonb_build_object(
        'verification_status', OLD.verification_status,
        'verified_by', OLD.verified_by,
        'verified_at', OLD.verified_at
      );
      v_after := jsonb_build_object(
        'verification_status', NEW.verification_status,
        'verified_by', NEW.verified_by,
        'verified_at', NEW.verified_at,
        'rejection_reason', NEW.rejection_reason
      );
      
      PERFORM log_audit_event(v_action, 'achievement', NEW.achievement_id, v_community_id, v_before, v_after);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_achievement_changes ON achievements;
CREATE TRIGGER trigger_audit_achievement_changes
  AFTER INSERT OR UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION audit_achievement_changes();

-- Trigger function for rewards audit logging
CREATE OR REPLACE FUNCTION audit_reward_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_community_id UUID;
  v_before JSONB;
  v_after JSONB;
  v_action VARCHAR;
BEGIN
  v_community_id := COALESCE(NEW.community_id, OLD.community_id);

  IF TG_OP = 'INSERT' THEN
    v_action := 'reward_created';
    v_after := jsonb_build_object(
      'reward_id', NEW.reward_id,
      'token_amount', NEW.token_amount,
      'status', NEW.status
    );
    PERFORM log_audit_event(v_action, 'reward', NEW.reward_id, v_community_id, NULL, v_after);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      v_action := 'reward_status_changed';
      v_before := jsonb_build_object('status', OLD.status, 'approved_by', OLD.approved_by);
      v_after := jsonb_build_object('status', NEW.status, 'approved_by', NEW.approved_by, 'paid_at', NEW.paid_at, 'error_message', NEW.error_message);
      PERFORM log_audit_event(v_action, 'reward', NEW.reward_id, v_community_id, v_before, v_after);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_reward_changes ON rewards;
CREATE TRIGGER trigger_audit_reward_changes
  AFTER INSERT OR UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION audit_reward_changes();

-- Trigger function for programs audit logging
CREATE OR REPLACE FUNCTION audit_program_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action VARCHAR;
  v_before JSONB;
  v_after JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'program_created';
    v_after := jsonb_build_object(
      'program_id', NEW.program_id,
      'name', NEW.name,
      'status', NEW.status
    );
    PERFORM log_audit_event(v_action, 'program', NEW.program_id, NEW.community_id, NULL, v_after);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      v_action := 'program_status_changed';
      v_before := jsonb_build_object('status', OLD.status);
      v_after := jsonb_build_object('status', NEW.status);
      PERFORM log_audit_event(v_action, 'program', NEW.program_id, NEW.community_id, v_before, v_after);
    ELSIF OLD.name != NEW.name OR OLD.description != NEW.description THEN
      v_action := 'program_updated';
      v_before := jsonb_build_object('name', OLD.name, 'description', OLD.description);
      v_after := jsonb_build_object('name', NEW.name, 'description', NEW.description);
      PERFORM log_audit_event(v_action, 'program', NEW.program_id, NEW.community_id, v_before, v_after);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_program_changes ON programs;
CREATE TRIGGER trigger_audit_program_changes
  AFTER INSERT OR UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION audit_program_changes();

-- Trigger function for milestones audit logging
CREATE OR REPLACE FUNCTION audit_milestone_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action VARCHAR;
  v_community_id UUID;
BEGIN
  -- Get community_id from program
  SELECT community_id INTO v_community_id
  FROM programs
  WHERE program_id = COALESCE(NEW.program_id, OLD.program_id);

  IF TG_OP = 'INSERT' THEN
    v_action := 'milestone_created';
    PERFORM log_audit_event(v_action, 'milestone', NEW.milestone_id, v_community_id, NULL, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      v_action := 'milestone_status_changed';
      PERFORM log_audit_event(v_action, 'milestone', NEW.milestone_id, v_community_id,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_milestone_changes ON milestones;
CREATE TRIGGER trigger_audit_milestone_changes
  AFTER INSERT OR UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION audit_milestone_changes();

-- Trigger function for communities audit logging
CREATE OR REPLACE FUNCTION audit_community_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action VARCHAR;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.settings IS DISTINCT FROM NEW.settings THEN
      v_action := 'community_settings_updated';
      PERFORM log_audit_event(v_action, 'community', NEW.community_id, NEW.community_id,
        jsonb_build_object('settings', OLD.settings),
        jsonb_build_object('settings', NEW.settings)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_community_changes ON communities;
CREATE TRIGGER trigger_audit_community_changes
  AFTER UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION audit_community_changes();

-- ============================================================
-- NOTIFICATION HELPERS
-- ============================================================

-- Helper function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_related_entity_type VARCHAR DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Only create if notifications feature is enabled
  IF NOT is_feature_enabled('enable_notifications_in_app') THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    related_entity_type,
    related_entity_id,
    priority
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_related_entity_type,
    p_related_entity_id,
    p_priority
  )
  RETURNING notification_id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for achievement notifications
CREATE OR REPLACE FUNCTION notify_achievement_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_milestone_title VARCHAR;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify admin that submission was received
    -- (In production, this would notify community admins)
    PERFORM create_notification(
      NEW.user_id,
      'achievement',
      'Submission Received',
      'Your achievement submission has been received and is pending verification.',
      NULL,
      'achievement',
      NEW.achievement_id,
      'normal'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Notify user on verification status change
    IF OLD.verification_status != NEW.verification_status THEN
      -- Get milestone title
      SELECT title INTO v_milestone_title
      FROM milestones
      WHERE milestone_id = NEW.milestone_id;

      IF NEW.verification_status = 'verified' THEN
        PERFORM create_notification(
          NEW.user_id,
          'verification',
          'Achievement Approved',
          'Your achievement "' || v_milestone_title || '" has been approved!',
          NULL,
          'achievement',
          NEW.achievement_id,
          'high'
        );
      ELSIF NEW.verification_status = 'rejected' THEN
        PERFORM create_notification(
          NEW.user_id,
          'verification',
          'Achievement Not Approved',
          'Your achievement "' || v_milestone_title || '" was not approved. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided'),
          NULL,
          'achievement',
          NEW.achievement_id,
          'high'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_achievement_changes ON achievements;
CREATE TRIGGER trigger_notify_achievement_changes
  AFTER INSERT OR UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_changes();

-- Trigger function for reward notifications
CREATE OR REPLACE FUNCTION notify_reward_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      NEW.user_id,
      'reward',
      'Reward Created',
      'You have been awarded ' || NEW.token_amount || ' ' || NEW.token_type || ' tokens!',
      NULL,
      'reward',
      NEW.reward_id,
      'high'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'confirmed' THEN
        PERFORM create_notification(
          NEW.user_id,
          'reward',
          'Reward Paid',
          'Your reward of ' || NEW.token_amount || ' ' || NEW.token_type || ' tokens has been confirmed!',
          NULL,
          'reward',
          NEW.reward_id,
          'high'
        );
      ELSIF NEW.status = 'failed' THEN
        PERFORM create_notification(
          NEW.user_id,
          'reward',
          'Reward Payment Failed',
          'There was an issue processing your reward. Our team has been notified.',
          NULL,
          'reward',
          NEW.reward_id,
          'urgent'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_reward_changes ON rewards;
CREATE TRIGGER trigger_notify_reward_changes
  AFTER INSERT OR UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION notify_reward_changes();

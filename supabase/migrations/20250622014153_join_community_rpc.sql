CREATE OR REPLACE FUNCTION join_community_with_code(
  _referral_code TEXT,
  _user_id UUID
)
RETURNS TABLE(
  community_id UUID,
  name TEXT,
  description TEXT,
  admin_id UUID
) AS $$
DECLARE
  _community_id UUID;
BEGIN
  -- Find the community_id for the given referral code
  SELECT c.community_id INTO _community_id
  FROM public.communities c
  WHERE c.referral_code = _referral_code;

  -- If no community is found, raise an exception
  IF _community_id IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;

  -- Update the user's community_id
  UPDATE public.users
  SET community_id = _community_id
  WHERE user_id = _user_id;

  -- Return the details of the joined community
  RETURN QUERY
    SELECT c.community_id, c.name, c.description, c.admin_id
    FROM public.communities c
    WHERE c.community_id = _community_id;
END;
$$ LANGUAGE plpgsql;

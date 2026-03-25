-- Fix auth trigger causing signup errors
DROP TRIGGER IF EXISTS on_user_signup_link_member ON auth.users;
DROP TRIGGER IF EXISTS on_user_login_link_member ON auth.users;
DROP FUNCTION IF EXISTS link_member_to_user();

-- Recreate with proper error handling
CREATE OR REPLACE FUNCTION link_member_to_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE project_members
  SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block signup
  RAISE WARNING 'Failed to link member: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_signup_link_member
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION link_member_to_user();

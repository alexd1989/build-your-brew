/*
  # Create Admin User

  1. Functions
    - `create_admin_user` - Creates an admin user with specified email
    - `promote_user_to_admin` - Promotes existing user to admin role

  2. Usage
    - Call `SELECT create_admin_user('admin@example.com', 'password123');` to create admin
    - Call `SELECT promote_user_to_admin('user@example.com');` to promote existing user
*/

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email text,
  admin_password text DEFAULT 'admin123'
)
RETURNS text AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- This function should be called manually in the Supabase dashboard
  -- or through the auth admin API, not through the application
  RETURN 'Please create admin user through Supabase dashboard or auth admin API';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote existing user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS text AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found';
  END IF;
  
  -- Update or insert admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id)
  DO UPDATE SET role = 'admin', created_at = now();
  
  RETURN 'User promoted to admin successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote admin to user
CREATE OR REPLACE FUNCTION demote_admin_to_user(user_email text)
RETURNS text AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found';
  END IF;
  
  -- Update role to user
  UPDATE user_roles
  SET role = 'user', created_at = now()
  WHERE user_id = target_user_id;
  
  RETURN 'Admin demoted to user successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
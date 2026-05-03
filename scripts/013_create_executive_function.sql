-- Create a function to insert executives with proper UUID generation
CREATE OR REPLACE FUNCTION create_executive_user(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_rut TEXT
)
RETURNS TABLE(user_id UUID, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_user_id UUID;
  v_message TEXT;
BEGIN
  -- Generate a new UUID
  v_user_id := gen_random_uuid();
  
  -- Insert into profiles directly with the generated UUID
  INSERT INTO profiles (id, email, full_name, role, phone, rut, is_active)
  VALUES (v_user_id, p_email, p_full_name, 'admin', p_phone, p_rut, true);
  
  v_message := 'User created successfully';
  
  RETURN QUERY SELECT v_user_id, true, v_message;
  
EXCEPTION WHEN OTHERS THEN
  v_message := SQLERRM;
  RETURN QUERY SELECT v_user_id, false, v_message;
END;
$$ LANGUAGE plpgsql;

-- Update the existing user to have admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'abdallahhussien18@gmail.com';
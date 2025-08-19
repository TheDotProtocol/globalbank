-- Update the test user with a proper password hash
-- Password will be: test123456

UPDATE public.users 
SET password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'njmsweettie@gmail.com';

-- Verify the update
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  "kycStatus"
FROM public.users 
WHERE email = 'njmsweettie@gmail.com'; 
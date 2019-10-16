UPDATE public.user SET "registrationStatus"=2 WHERE "registrationStatus"=1; 
DELETE FROM public.user_registration_status WHERE id=1;
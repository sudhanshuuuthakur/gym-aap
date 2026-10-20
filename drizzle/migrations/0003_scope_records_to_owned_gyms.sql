ALTER POLICY "Users can create their own admissions" ON public.admissions WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
ALTER POLICY "Users can delete their own admissions" ON public.admissions USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
ALTER POLICY "Users can update their own admissions" ON public.admissions USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid())) WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
ALTER POLICY "Users can view their own admissions" ON public.admissions USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));

ALTER POLICY "Users can create their own payments" ON public.payments WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
ALTER POLICY "Users can delete their own payments" ON public.payments USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
ALTER POLICY "Users can update their own payments" ON public.payments USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid())) WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
ALTER POLICY "Users can view their own payments" ON public.payments USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));

ALTER POLICY "Users can create their own attendance records" ON public.attendance WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
ALTER POLICY "Users can delete their own attendance records" ON public.attendance USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
ALTER POLICY "Users can view their own attendance records" ON public.attendance USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_id AND g.owner_id = auth.uid()));
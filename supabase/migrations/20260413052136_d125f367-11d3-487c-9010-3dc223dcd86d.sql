
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admission_id, check_in_date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attendance records"
ON public.attendance FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attendance records"
ON public.attendance FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance records"
ON public.attendance FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_attendance_check_in_date ON public.attendance(check_in_date);
CREATE INDEX idx_attendance_admission_id ON public.attendance(admission_id);

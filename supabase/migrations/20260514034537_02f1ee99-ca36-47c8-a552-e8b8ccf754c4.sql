
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light')),
  default_mode TEXT NOT NULL DEFAULT 'fiction' CHECK (default_mode IN ('fiction','academic')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Research sources
CREATE TABLE public.research_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  extracted_text TEXT,
  page_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.research_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sources" ON public.research_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sources" ON public.research_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own sources" ON public.research_sources FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('research-sources', 'research-sources', false);

CREATE POLICY "Users read own source files" ON storage.objects FOR SELECT
  USING (bucket_id = 'research-sources' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own source files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'research-sources' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own source files" ON storage.objects FOR DELETE
  USING (bucket_id = 'research-sources' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────
-- profiles table for user settings & display info
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rezeptretter.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{"default_servings": 2, "cook_mode_font_size": "normal", "timer_sound": true, "timer_vibration": true, "dark_mode": "system"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE rezeptretter.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON rezeptretter.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON rezeptretter.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON rezeptretter.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION rezeptretter.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rezeptretter.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION rezeptretter.handle_new_user();

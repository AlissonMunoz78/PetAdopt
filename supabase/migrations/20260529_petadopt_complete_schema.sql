-- ============================================================
-- SCHEMA PETADOPT — Schema completo y correcto
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- ============================================================
-- TABLA PROFILES — Base de usuarios (adoptantes y refugios)
-- ============================================================

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT,
  role          TEXT NOT NULL DEFAULT 'adopter' CHECK (role IN ('adopter', 'shelter')),
  avatar_url    TEXT,
  phone         TEXT,
  description   TEXT,
  address       TEXT,
  city          TEXT,
  latitude      FLOAT,
  longitude     FLOAT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'adopter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLA PETS — Mascotas disponibles para adopción
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pets (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shelter_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  species            TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'rabbit', 'bird', 'other')),
  breed              TEXT,
  age_years          INT CHECK (age_years >= 0),
  age_months         INT CHECK (age_months >= 0 AND age_months < 12),
  size               TEXT CHECK (size IN ('small', 'medium', 'large', 'xlarge')),
  weight_kg          FLOAT,
  description        TEXT,
  temperament        TEXT,
  health_status      TEXT CHECK (health_status IN ('healthy', 'medical_attention', 'vaccinated')),
  image_url          TEXT,
  additional_images  TEXT[] DEFAULT ARRAY[]::TEXT[],
  available          BOOLEAN DEFAULT TRUE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_shelter   ON public.pets(shelter_id);
CREATE INDEX IF NOT EXISTS idx_pets_available ON public.pets(available);
CREATE INDEX IF NOT EXISTS idx_pets_species   ON public.pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_size      ON public.pets(size);

-- ── RLS pets ─────────────────────────────────────────────────

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_select_public" ON public.pets
  FOR SELECT USING (available = true);

CREATE POLICY "pets_select_own_shelter" ON public.pets
  FOR SELECT USING (shelter_id = auth.uid());

CREATE POLICY "pets_create_shelter" ON public.pets
  FOR INSERT WITH CHECK (
    auth.uid() = shelter_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'shelter')
  );

CREATE POLICY "pets_update_own_shelter" ON public.pets
  FOR UPDATE USING (auth.uid() = shelter_id)
  WITH CHECK (auth.uid() = shelter_id);

CREATE POLICY "pets_delete_own_shelter" ON public.pets
  FOR DELETE USING (auth.uid() = shelter_id);

-- ============================================================
-- TABLA ADOPTION_REQUESTS — Solicitudes de adopción
-- ============================================================

CREATE TABLE IF NOT EXISTS public.adoption_requests (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id            UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  adopter_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shelter_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message           TEXT,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adoption_requests_pet     ON public.adoption_requests(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_adopter ON public.adoption_requests(adopter_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_shelter ON public.adoption_requests(shelter_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_status  ON public.adoption_requests(status);

-- ── RLS adoption_requests ────────────────────────────────────

ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adoption_requests_adopter_select" ON public.adoption_requests
  FOR SELECT USING (adopter_id = auth.uid());

CREATE POLICY "adoption_requests_shelter_select" ON public.adoption_requests
  FOR SELECT USING (shelter_id = auth.uid());

CREATE POLICY "adoption_requests_adopter_create" ON public.adoption_requests
  FOR INSERT WITH CHECK (
    adopter_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'adopter')
  );

CREATE POLICY "adoption_requests_adopter_cancel" ON public.adoption_requests
  FOR UPDATE USING (adopter_id = auth.uid())
  WITH CHECK (adopter_id = auth.uid() AND status = 'cancelled');

CREATE POLICY "adoption_requests_shelter_update" ON public.adoption_requests
  FOR UPDATE USING (shelter_id = auth.uid())
  WITH CHECK (shelter_id = auth.uid());

-- ============================================================
-- STORAGE — Políticas para bucket pet-images
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'pet_images_upload'
  ) THEN
    CREATE POLICY "pet_images_upload"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'pet-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'pet_images_select'
  ) THEN
    CREATE POLICY "pet_images_select"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'pet-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'pet_images_delete'
  ) THEN
    CREATE POLICY "pet_images_delete"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'pet-images');
  END IF;
END $$;

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.pets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.adoption_requests;

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adoption_requests_updated_at BEFORE UPDATE ON public.adoption_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

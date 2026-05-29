-- ============================================================
-- SCHEMA PETADOPT — Mascotas y Solicitudes de Adopción
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- ── Actualizar perfiles para soportar refugios ──────────────
-- Cambiar role de 'cliente'/'vendedor' a 'adoptantes'/'refugios'
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('adoptantes', 'refugios'));

-- Agregar campos de contacto para refugios
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT;

-- ── Tabla pets — Mascotas disponibles para adopción ────────
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

-- Índices para búsqueda y filtrado
CREATE INDEX IF NOT EXISTS idx_pets_shelter ON public.pets(shelter_id);
CREATE INDEX IF NOT EXISTS idx_pets_available ON public.pets(available);
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_size ON public.pets(size);

-- ── Tabla adoption_requests — Solicitudes de adopción ──────
CREATE TABLE IF NOT EXISTS public.adoption_requests (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id             UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  adopter_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shelter_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message            TEXT,
  rejection_reason   TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_adoption_requests_pet ON public.adoption_requests(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_adopter ON public.adoption_requests(adopter_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_shelter ON public.adoption_requests(shelter_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_status ON public.adoption_requests(status);

-- ── RLS para tabla pets ──────────────────────────────────────
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver mascotas disponibles
CREATE POLICY "pets_select_public" ON public.pets 
  FOR SELECT 
  USING (available = true);

-- Refugios pueden ver sus propias mascotas (incluso si no están disponibles)
CREATE POLICY "pets_select_own_shelter" ON public.pets 
  FOR SELECT 
  USING (shelter_id = auth.uid());

-- Solo refugios pueden crear mascotas
CREATE POLICY "pets_create_shelter" ON public.pets 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = shelter_id 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'refugios')
  );

-- Solo refugio propietario puede actualizar su mascota
CREATE POLICY "pets_update_own_shelter" ON public.pets 
  FOR UPDATE 
  USING (auth.uid() = shelter_id)
  WITH CHECK (auth.uid() = shelter_id);

-- Solo refugio propietario puede eliminar su mascota
CREATE POLICY "pets_delete_own_shelter" ON public.pets 
  FOR DELETE 
  USING (auth.uid() = shelter_id);

-- ── RLS para tabla adoption_requests ──────────────────────
ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;

-- Adoptantes ven sus propias solicitudes
CREATE POLICY "adoption_requests_adopter_select" ON public.adoption_requests 
  FOR SELECT 
  USING (adopter_id = auth.uid());

-- Refugios ven las solicitudes de sus mascotas
CREATE POLICY "adoption_requests_shelter_select" ON public.adoption_requests 
  FOR SELECT 
  USING (shelter_id = auth.uid());

-- Adoptantes pueden crear solicitudes
CREATE POLICY "adoption_requests_adopter_create" ON public.adoption_requests 
  FOR INSERT 
  WITH CHECK (
    adopter_id = auth.uid() 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'adopter')
  );

-- Solo el adoptante puede cancelar su solicitud (cambiar a cancelled)
CREATE POLICY "adoption_requests_adopter_cancel" ON public.adoption_requests 
  FOR UPDATE 
  USING (adopter_id = auth.uid())
  WITH CHECK (adopter_id = auth.uid() AND status = 'cancelled');

-- Refugio puede aprobar/rechazar solicitudes de sus mascotas
CREATE POLICY "adoption_requests_shelter_update" ON public.adoption_requests 
  FOR UPDATE 
  USING (shelter_id = auth.uid())
  WITH CHECK (shelter_id = auth.uid());

-- ── Storage bucket para imágenes de mascotas ─────────────────
-- Ejecutar manualmente en Storage → Nuevo bucket → "pet-images" (público)
-- Luego ejecutar las policies:

CREATE POLICY IF NOT EXISTS "pet_images_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pet-images');

CREATE POLICY IF NOT EXISTS "pet_images_select"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'pet-images');

CREATE POLICY IF NOT EXISTS "pet_images_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pet-images');

-- ── Realtime para notificaciones ─────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE pets;
ALTER PUBLICATION supabase_realtime ADD TABLE adoption_requests;

-- ── Trigger para actualizar updated_at ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adoption_requests_updated_at BEFORE UPDATE ON public.adoption_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

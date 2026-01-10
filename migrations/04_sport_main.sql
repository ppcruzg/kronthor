-- =====================================================
-- Migration 04: Tabla Sport y Relaciones
-- =====================================================
-- Descripción: Crea la tabla principal de deportes y todas
-- las tablas de relación para campos multi-selección y mix ponderado.
-- =====================================================

-- =====================================================
-- 1. TABLA PRINCIPAL: SPORT
-- =====================================================
CREATE TABLE sport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  position_role VARCHAR(100),
  
  -- Lateralidad
  laterality_support_id INTEGER REFERENCES laterality_support(id),
  laterality_load_id INTEGER REFERENCES laterality_load(id),
  
  -- Exigencias
  antirotation_stability_id INTEGER REFERENCES antirotation_stability(id),
  cod_demand_id INTEGER REFERENCES cod_demand(id),
  ssc_demand_id INTEGER REFERENCES ssc_demand(id),
  impact_demand_id INTEGER REFERENCES impact_demand(id),
  
  -- Volumen y perfil
  practice_volume_id INTEGER REFERENCES practice_volume(id),
  energy_profile_id INTEGER REFERENCES energy_profile(id),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sport_sport_id ON sport(sport_id);
CREATE INDEX idx_sport_name ON sport(name);
CREATE INDEX idx_sport_is_active ON sport(is_active);

-- RLS
ALTER TABLE sport ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sports"
  ON sport FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage sports"
  ON sport FOR ALL
  USING (auth.role() = 'authenticated');

-- Comentarios
COMMENT ON TABLE sport IS 'Catálogo de deportes con sus características físicas y demandas';
COMMENT ON COLUMN sport.sport_id IS 'Código único del deporte (formato: SPORT_XXXX)';
COMMENT ON COLUMN sport.position_role IS 'Posición o prueba específica dentro del deporte (opcional)';

-- =====================================================
-- 2. ACCIONES CLAVE DEL DEPORTE (6-10 selecciones)
-- =====================================================
CREATE TABLE sport_key_action (
  id SERIAL PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  action_id INTEGER NOT NULL REFERENCES key_action(id),
  CONSTRAINT unique_sport_action UNIQUE(sport_id, action_id)
);

-- Índices
CREATE INDEX idx_sport_key_action_sport_id ON sport_key_action(sport_id);
CREATE INDEX idx_sport_key_action_action_id ON sport_key_action(action_id);

-- RLS
ALTER TABLE sport_key_action ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sport_key_action"
  ON sport_key_action FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage sport_key_action"
  ON sport_key_action FOR ALL
  USING (auth.role() = 'authenticated');

-- Validación: 6-10 acciones
CREATE OR REPLACE FUNCTION validate_sport_key_actions_count()
RETURNS TRIGGER AS $$
DECLARE
  action_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO action_count
  FROM sport_key_action
  WHERE sport_id = COALESCE(NEW.sport_id, OLD.sport_id);
  
  IF action_count < 6 THEN
    RAISE EXCEPTION 'Un deporte debe tener al menos 6 acciones clave (actual: %)', action_count;
  END IF;
  
  IF action_count > 10 THEN
    RAISE EXCEPTION 'Un deporte debe tener máximo 10 acciones clave (actual: %)', action_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_sport_key_actions_count
  AFTER INSERT OR UPDATE OR DELETE ON sport_key_action
  FOR EACH ROW
  EXECUTE FUNCTION validate_sport_key_actions_count();

-- =====================================================
-- 3. PRIORIDADES FÍSICAS (3-5 selecciones ORDENADAS)
-- =====================================================
CREATE TABLE sport_physical_priority (
  id SERIAL PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  priority_id INTEGER NOT NULL REFERENCES physical_priority(id),
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 5),
  CONSTRAINT unique_sport_priority UNIQUE(sport_id, priority_id),
  CONSTRAINT unique_sport_rank UNIQUE(sport_id, rank)
);

-- Índices
CREATE INDEX idx_sport_physical_priority_sport_id ON sport_physical_priority(sport_id);
CREATE INDEX idx_sport_physical_priority_rank ON sport_physical_priority(sport_id, rank);

-- RLS
ALTER TABLE sport_physical_priority ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sport_physical_priority"
  ON sport_physical_priority FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage sport_physical_priority"
  ON sport_physical_priority FOR ALL
  USING (auth.role() = 'authenticated');

-- Validación: 3-5 prioridades
CREATE OR REPLACE FUNCTION validate_sport_priorities_count()
RETURNS TRIGGER AS $$
DECLARE
  priority_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO priority_count
  FROM sport_physical_priority
  WHERE sport_id = COALESCE(NEW.sport_id, OLD.sport_id);
  
  IF priority_count < 3 THEN
    RAISE EXCEPTION 'Un deporte debe tener al menos 3 prioridades físicas (actual: %)', priority_count;
  END IF;
  
  IF priority_count > 5 THEN
    RAISE EXCEPTION 'Un deporte debe tener máximo 5 prioridades físicas (actual: %)', priority_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_sport_priorities_count
  AFTER INSERT OR UPDATE OR DELETE ON sport_physical_priority
  FOR EACH ROW
  EXECUTE FUNCTION validate_sport_priorities_count();

COMMENT ON COLUMN sport_physical_priority.rank IS 'Orden de prioridad (1 = más importante)';

-- =====================================================
-- 4. ZONAS DE RIESGO TÍPICAS (1-3 selecciones)
-- =====================================================
CREATE TABLE sport_risk_zone (
  id SERIAL PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  zone_id INTEGER NOT NULL REFERENCES risk_zone(id),
  CONSTRAINT unique_sport_zone UNIQUE(sport_id, zone_id)
);

-- Índices
CREATE INDEX idx_sport_risk_zone_sport_id ON sport_risk_zone(sport_id);
CREATE INDEX idx_sport_risk_zone_zone_id ON sport_risk_zone(zone_id);

-- RLS
ALTER TABLE sport_risk_zone ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sport_risk_zone"
  ON sport_risk_zone FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage sport_risk_zone"
  ON sport_risk_zone FOR ALL
  USING (auth.role() = 'authenticated');

-- Validación: 1-3 zonas
CREATE OR REPLACE FUNCTION validate_sport_risk_zones_count()
RETURNS TRIGGER AS $$
DECLARE
  zone_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO zone_count
  FROM sport_risk_zone
  WHERE sport_id = COALESCE(NEW.sport_id, OLD.sport_id);
  
  IF zone_count < 1 THEN
    RAISE EXCEPTION 'Un deporte debe tener al menos 1 zona de riesgo (actual: %)', zone_count;
  END IF;
  
  IF zone_count > 3 THEN
    RAISE EXCEPTION 'Un deporte debe tener máximo 3 zonas de riesgo (actual: %)', zone_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_sport_risk_zones_count
  AFTER INSERT OR UPDATE OR DELETE ON sport_risk_zone
  FOR EACH ROW
  EXECUTE FUNCTION validate_sport_risk_zones_count();

-- =====================================================
-- 5. LIMITANTES COMUNES (1-3 selecciones)
-- =====================================================
CREATE TABLE sport_common_limiter (
  id SERIAL PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  limiter_id INTEGER NOT NULL REFERENCES common_limiter(id),
  CONSTRAINT unique_sport_limiter UNIQUE(sport_id, limiter_id)
);

-- Índices
CREATE INDEX idx_sport_common_limiter_sport_id ON sport_common_limiter(sport_id);
CREATE INDEX idx_sport_common_limiter_limiter_id ON sport_common_limiter(limiter_id);

-- RLS
ALTER TABLE sport_common_limiter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sport_common_limiter"
  ON sport_common_limiter FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage sport_common_limiter"
  ON sport_common_limiter FOR ALL
  USING (auth.role() = 'authenticated');

-- Validación: 1-3 limitantes
CREATE OR REPLACE FUNCTION validate_sport_limiters_count()
RETURNS TRIGGER AS $$
DECLARE
  limiter_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO limiter_count
  FROM sport_common_limiter
  WHERE sport_id = COALESCE(NEW.sport_id, OLD.sport_id);
  
  IF limiter_count < 1 THEN
    RAISE EXCEPTION 'Un deporte debe tener al menos 1 limitante común (actual: %)', limiter_count;
  END IF;
  
  IF limiter_count > 3 THEN
    RAISE EXCEPTION 'Un deporte debe tener máximo 3 limitantes comunes (actual: %)', limiter_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_sport_limiters_count
  AFTER INSERT OR UPDATE OR DELETE ON sport_common_limiter
  FOR EACH ROW
  EXECUTE FUNCTION validate_sport_limiters_count();

-- =====================================================
-- 6. VECTOR DOMINANTE (MIX PONDERADO)
-- =====================================================
CREATE TABLE sport_vector_mix (
  id SERIAL PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  vector_id INTEGER NOT NULL REFERENCES dominant_vector(id),
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100 AND weight % 10 = 0),
  CONSTRAINT unique_sport_vector UNIQUE(sport_id, vector_id)
);

-- Índices
CREATE INDEX idx_sport_vector_mix_sport_id ON sport_vector_mix(sport_id);
CREATE INDEX idx_sport_vector_mix_vector_id ON sport_vector_mix(vector_id);

-- RLS
ALTER TABLE sport_vector_mix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sport_vector_mix"
  ON sport_vector_mix FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage sport_vector_mix"
  ON sport_vector_mix FOR ALL
  USING (auth.role() = 'authenticated');

-- Validación (misma lógica que exercise_vector_mix)
CREATE OR REPLACE FUNCTION validate_sport_vector_mix_sum()
RETURNS TRIGGER AS $$
DECLARE
  total INTEGER;
  component_count INTEGER;
  max_weight INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(weight), 0), 
    COUNT(*), 
    COALESCE(MAX(weight), 0) 
  INTO total, component_count, max_weight
  FROM sport_vector_mix
  WHERE sport_id = COALESCE(NEW.sport_id, OLD.sport_id);
  
  IF component_count > 0 THEN
    IF total != 100 THEN
      RAISE EXCEPTION 'Sport vector mix: suma debe ser 100 (actual: %)', total;
    END IF;
    
    IF component_count > 3 THEN
      RAISE EXCEPTION 'Sport vector mix: maximo 3 componentes (actual: %)', component_count;
    END IF;
    
    IF max_weight < 50 THEN
      RAISE EXCEPTION 'Sport vector mix: al menos un componente debe ser >= 50 (maximo: %)', max_weight;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_sport_vector_mix_sum
  AFTER INSERT OR UPDATE OR DELETE ON sport_vector_mix
  FOR EACH ROW
  EXECUTE FUNCTION validate_sport_vector_mix_sum();

-- =====================================================
-- 7. PLANO DOMINANTE (MIX PONDERADO)
-- =====================================================
CREATE TABLE sport_plane_mix (
  id SERIAL PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  plane_id INTEGER NOT NULL REFERENCES plane(id),
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100 AND weight % 10 = 0),
  CONSTRAINT unique_sport_plane UNIQUE(sport_id, plane_id)
);

-- Índices
CREATE INDEX idx_sport_plane_mix_sport_id ON sport_plane_mix(sport_id);
CREATE INDEX idx_sport_plane_mix_plane_id ON sport_plane_mix(plane_id);

-- RLS
ALTER TABLE sport_plane_mix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sport_plane_mix"
  ON sport_plane_mix FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage sport_plane_mix"
  ON sport_plane_mix FOR ALL
  USING (auth.role() = 'authenticated');

-- Validación
CREATE OR REPLACE FUNCTION validate_sport_plane_mix_sum()
RETURNS TRIGGER AS $$
DECLARE
  total INTEGER;
  component_count INTEGER;
  max_weight INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(weight), 0), 
    COUNT(*), 
    COALESCE(MAX(weight), 0) 
  INTO total, component_count, max_weight
  FROM sport_plane_mix
  WHERE sport_id = COALESCE(NEW.sport_id, OLD.sport_id);
  
  IF component_count > 0 THEN
    IF total != 100 THEN
      RAISE EXCEPTION 'Sport plane mix: suma debe ser 100 (actual: %)', total;
    END IF;
    
    IF component_count > 3 THEN
      RAISE EXCEPTION 'Sport plane mix: maximo 3 componentes (actual: %)', component_count;
    END IF;
    
    IF max_weight < 50 THEN
      RAISE EXCEPTION 'Sport plane mix: al menos un componente debe ser >= 50 (maximo: %)', max_weight;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_sport_plane_mix_sum
  AFTER INSERT OR UPDATE OR DELETE ON sport_plane_mix
  FOR EACH ROW
  EXECUTE FUNCTION validate_sport_plane_mix_sum();

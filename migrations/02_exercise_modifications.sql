-- =====================================================
-- Migration 02: Modificaciones a Tabla Exercise
-- =====================================================
-- Descripción: Agrega nuevos campos a la tabla exercise y crea
-- tablas de relación para mix ponderado (plano y vector).
-- =====================================================

-- =====================================================
-- 1. AGREGAR NUEVOS CAMPOS A EXERCISE
-- =====================================================
ALTER TABLE exercise
  ADD COLUMN laterality_support_id INTEGER REFERENCES laterality_support(id),
  ADD COLUMN laterality_load_id INTEGER REFERENCES laterality_load(id),
  ADD COLUMN ssc_demand_id INTEGER REFERENCES ssc_demand(id),
  ADD COLUMN impact_demand_id INTEGER REFERENCES impact_demand(id),
  ADD COLUMN antirotation_stability_id INTEGER REFERENCES antirotation_stability(id),
  ADD COLUMN movement_pattern_id INTEGER REFERENCES movement_pattern(id);

-- =====================================================
-- 2. TABLA PARA MIX PONDERADO DE VECTOR DOMINANTE
-- =====================================================
CREATE TABLE exercise_vector_mix (
  id SERIAL PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  vector_id INTEGER NOT NULL REFERENCES dominant_vector(id),
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100 AND weight % 10 = 0),
  CONSTRAINT unique_exercise_vector UNIQUE(exercise_id, vector_id)
);

-- Índices para mejorar performance
CREATE INDEX idx_exercise_vector_mix_exercise_id ON exercise_vector_mix(exercise_id);
CREATE INDEX idx_exercise_vector_mix_vector_id ON exercise_vector_mix(vector_id);

-- RLS
ALTER TABLE exercise_vector_mix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise_vector_mix"
  ON exercise_vector_mix FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage exercise_vector_mix"
  ON exercise_vector_mix FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. TABLA PARA MIX PONDERADO DE PLANO
-- =====================================================
CREATE TABLE exercise_plane_mix (
  id SERIAL PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  plane_id INTEGER NOT NULL REFERENCES plane(id),
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100 AND weight % 10 = 0),
  CONSTRAINT unique_exercise_plane UNIQUE(exercise_id, plane_id)
);

-- Índices
CREATE INDEX idx_exercise_plane_mix_exercise_id ON exercise_plane_mix(exercise_id);
CREATE INDEX idx_exercise_plane_mix_plane_id ON exercise_plane_mix(plane_id);

-- RLS
ALTER TABLE exercise_plane_mix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise_plane_mix"
  ON exercise_plane_mix FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage exercise_plane_mix"
  ON exercise_plane_mix FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. VALIDACIONES PARA MIX PONDERADO
-- =====================================================

-- Función de validación para vector_mix
CREATE OR REPLACE FUNCTION validate_vector_mix_sum()
RETURNS TRIGGER AS $$
DECLARE
  total INTEGER;
  component_count INTEGER;
  max_weight INTEGER;
BEGIN
  -- Calcular totales después de la operación
  SELECT 
    COALESCE(SUM(weight), 0), 
    COUNT(*), 
    COALESCE(MAX(weight), 0) 
  INTO total, component_count, max_weight
  FROM exercise_vector_mix
  WHERE exercise_id = COALESCE(NEW.exercise_id, OLD.exercise_id);
  
  -- Solo validar si hay componentes
  IF component_count > 0 THEN
    -- Validar suma = 100
    IF total != 100 THEN
      RAISE EXCEPTION 'Vector mix: suma debe ser 100 (actual: %)', total;
    END IF;
    
    -- Validar máximo 3 componentes
    IF component_count > 3 THEN
      RAISE EXCEPTION 'Vector mix: maximo 3 componentes (actual: %)', component_count;
    END IF;
    
    -- Validar al menos un componente >= 50%
    IF max_weight < 50 THEN
      RAISE EXCEPTION 'Vector mix: al menos un componente debe ser >= 50 (maximo: %)', max_weight;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para INSERT y UPDATE
CREATE TRIGGER check_vector_mix_sum_insert_update
  AFTER INSERT OR UPDATE ON exercise_vector_mix
  FOR EACH ROW
  EXECUTE FUNCTION validate_vector_mix_sum();

-- Trigger para DELETE (validar después de eliminar)
CREATE TRIGGER check_vector_mix_sum_delete
  AFTER DELETE ON exercise_vector_mix
  FOR EACH ROW
  EXECUTE FUNCTION validate_vector_mix_sum();

-- Función de validación para plane_mix
CREATE OR REPLACE FUNCTION validate_plane_mix_sum()
RETURNS TRIGGER AS $$
DECLARE
  total INTEGER;
  component_count INTEGER;
  max_weight INTEGER;
BEGIN
  -- Calcular totales después de la operación
  SELECT 
    COALESCE(SUM(weight), 0), 
    COUNT(*), 
    COALESCE(MAX(weight), 0) 
  INTO total, component_count, max_weight
  FROM exercise_plane_mix
  WHERE exercise_id = COALESCE(NEW.exercise_id, OLD.exercise_id);
  
  -- Solo validar si hay componentes
  IF component_count > 0 THEN
    -- Validar suma = 100
    IF total != 100 THEN
      RAISE EXCEPTION 'Plane mix: suma debe ser 100 (actual: %)', total;
    END IF;
    
    -- Validar máximo 3 componentes
    IF component_count > 3 THEN
      RAISE EXCEPTION 'Plane mix: maximo 3 componentes (actual: %)', component_count;
    END IF;
    
    -- Validar al menos un componente >= 50%
    IF max_weight < 50 THEN
      RAISE EXCEPTION 'Plane mix: al menos un componente debe ser >= 50 (maximo: %)', max_weight;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para plane_mix
CREATE TRIGGER check_plane_mix_sum_insert_update
  AFTER INSERT OR UPDATE ON exercise_plane_mix
  FOR EACH ROW
  EXECUTE FUNCTION validate_plane_mix_sum();

CREATE TRIGGER check_plane_mix_sum_delete
  AFTER DELETE ON exercise_plane_mix
  FOR EACH ROW
  EXECUTE FUNCTION validate_plane_mix_sum();

-- =====================================================
-- 5. COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================
COMMENT ON COLUMN exercise.laterality_support_id IS 'Tipo de apoyo: bilateral, unilateral o alternante';
COMMENT ON COLUMN exercise.laterality_load_id IS 'Distribución de carga: simétrica o asimétrica';
COMMENT ON COLUMN exercise.ssc_demand_id IS 'Exigencia de ciclo estiramiento-acortamiento: bajo, medio o alto';
COMMENT ON COLUMN exercise.impact_demand_id IS 'Exigencia de impacto: bajo, medio o alto';
COMMENT ON COLUMN exercise.antirotation_stability_id IS 'Exigencia de estabilidad antirotación: baja, media o alta';
COMMENT ON COLUMN exercise.movement_pattern_id IS 'Patrón de movimiento dominante del ejercicio';

COMMENT ON TABLE exercise_vector_mix IS 'Mix ponderado de vectores dominantes para ejercicios (suma debe ser 100%)';
COMMENT ON TABLE exercise_plane_mix IS 'Mix ponderado de planos para ejercicios (suma debe ser 100%)';

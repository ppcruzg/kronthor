-- =====================================================
-- Migration 01: Catálogos Compartidos (Ejercicio + Deporte)
-- =====================================================
-- Descripción: Crea tablas de catálogo que son usadas tanto por
-- la pestaña Ejercicio como por la pestaña Deporte.
-- =====================================================

-- =====================================================
-- 1. VECTOR DOMINANTE
-- =====================================================
CREATE TABLE dominant_vector (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO dominant_vector (code, name, description) VALUES
  ('HOR', 'horizontal', 'Fuerza/propulsión/frenado principalmente en horizontal'),
  ('VER', 'vertical', 'Fuerza principalmente en vertical (soporte y propulsión vertical)'),
  ('ROT', 'rotacional', 'Producción/resistencia de torque rotacional (tronco/cadera/hombro)');

-- RLS
ALTER TABLE dominant_vector ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dominant_vector"
  ON dominant_vector FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify dominant_vector"
  ON dominant_vector FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 2. LATERALIDAD DE APOYO
-- =====================================================
CREATE TABLE laterality_support (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO laterality_support (code, name, description) VALUES
  ('BIL', 'bilateral', 'Ambos apoyos simultáneos; base estable'),
  ('UNI', 'unilateral', 'Un solo apoyo dominante; requiere control de pelvis/rodilla'),
  ('ALT', 'alternante', 'Unilateral alternado (pasos/cambios); soporte cambia repetidamente');

-- RLS
ALTER TABLE laterality_support ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view laterality_support"
  ON laterality_support FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify laterality_support"
  ON laterality_support FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 3. LATERALIDAD DE CARGA
-- =====================================================
CREATE TABLE laterality_load (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO laterality_load (code, name, description) VALUES
  ('SIM', 'simétrica', 'Carga centrada y equilibrada (bilateral simétrica)'),
  ('ASIM', 'asimétrica (offset)', 'Carga desplazada/unilateral (p. ej., suitcase, offset KB/DB)');

-- RLS
ALTER TABLE laterality_load ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view laterality_load"
  ON laterality_load FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify laterality_load"
  ON laterality_load FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 4. SSC EXIGENCIA
-- =====================================================
CREATE TABLE ssc_demand (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO ssc_demand (code, name, description) VALUES
  ('BAJO', 'bajo', 'Poca elasticidad/reactividad; sin rebotes; tempo controlado'),
  ('MEDIO', 'medio', 'SSC presente pero no dominante; saltos bajos o ciclos moderados'),
  ('ALTO', 'alto', 'SSC dominante; pliometría/reactividad alta; ciclos rápidos');

-- RLS
ALTER TABLE ssc_demand ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ssc_demand"
  ON ssc_demand FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify ssc_demand"
  ON ssc_demand FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 5. IMPACTO EXIGENCIA
-- =====================================================
CREATE TABLE impact_demand (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO impact_demand (code, name, description) VALUES
  ('BAJO', 'bajo', 'Sin impactos relevantes; apoyo controlado; baja fuerza de reacción'),
  ('MEDIO', 'medio', 'Impactos moderados o repetidos; aterrizajes controlados'),
  ('ALTO', 'alto', 'Impacto alto (saltos, sprints, pliometría intensa)');

-- RLS
ALTER TABLE impact_demand ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view impact_demand"
  ON impact_demand FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify impact_demand"
  ON impact_demand FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 6. ESTABILIDAD ANTIROTACIÓN
-- =====================================================
CREATE TABLE antirotation_stability (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO antirotation_stability (code, name, description) VALUES
  ('BAJA', 'baja', 'Tronco estable sin demandas rotacionales relevantes'),
  ('MEDIA', 'media', 'Requiere control de tronco/pelvis ante perturbaciones moderadas'),
  ('ALTA', 'alta', 'Resistencia a rotación/inclinación crítica (unilateral pesado, carries, etc.)');

-- RLS
ALTER TABLE antirotation_stability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view antirotation_stability"
  ON antirotation_stability FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify antirotation_stability"
  ON antirotation_stability FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');
